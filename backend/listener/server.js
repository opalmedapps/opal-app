/*
 * Filename     :   server.js
 * Description  :   This script listens for changes on dev2/ in firebase, reads those changes and writes a response back to firebase.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   07 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

const mainRequestApi    = require('./api/main.js');
const processApi        = require('./api/processApiRequest');
const admin             = require("firebase-admin");
const utility           = require('./utility/utility.js');
const q                 = require("q");
const config            = require('./config.json');
const logger            = require('./logs/logger.js');
const OpalQueue         = require('./utility/queue').OpalQueue;

const DEBUG = process.env.NODE_ENV === 'development';
const FIREBASE_DEBUG = !!process.env.FIREBASE_DEBUG;

/*********************************************
 * INITIALIZE
 *********************************************/
const serviceAccount = require(config.FIREBASE_ADMIN_KEY);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.DATABASE_URL
});

if(FIREBASE_DEBUG) admin.database.enableLogging(true);

// Get reference to correct data element
const db = admin.database();
const ref = db.ref("/dev2");

logger.log('debug', 'CURRENTLY IN DEBUG MODE');

//Main queue to handle results sequentially
let mainQueue = new OpalQueue();

// Ensure there is no leftover data on firebase
ref.set(null)
    .catch(function (error) {
        logger.log('error', 'Cannot reset firebase', {
            error:error
        })
    });

// Periodically clear requests that are still on Firebase
setInterval(function(){
    clearTimeoutRequests();
    clearClientRequests();
},60000);

logger.log('debug','Initialize listeners: ');
listenForRequest('requests');
listenForRequest('passwordResetRequests');


/*********************************************
 * FUNCTIONS
 *********************************************/

/**
 * listenForRequest
 * @param requestType
 * @desc Listen for firebase changes and send responses for requests
 */
function listenForRequest(requestType){
    logger.log('info','Starting '+ requestType+' listener.');

    //disconnect any existing listeners..
    ref.child(requestType).off();

    ref.child(requestType).on('child_added',
        function(snapshot){
            logger.log('debug', 'Received request from Firebase: ', JSON.stringify(snapshot.val()));
            logger.log('info', 'Received request from Firebase: ', snapshot.val().Request);
            handleRequest(requestType,snapshot);
        },
        function(error){
	        logError(error);
        });
}

/**
 * handleRequest
 * @description Enqueues request for processing.
 * @param requestType
 * @param snapshot
 */
function handleRequest(requestType, snapshot){
    logger.log('debug', 'Handling request');

    let headers = {key: snapshot.key, objectRequest: snapshot.val(), requestType: requestType};
	mainQueue.enqueue(headers);
    if(!mainQueue.inProgress){
        logger.log('debug', "INITIATING PROCESS OPAL QUEUE");
        processOpalQueue();
    }
}

function processOpalQueue(){
    logger.log('debug', "Processing request");
	mainQueue.inProgress = true;
	let headers =  mainQueue.dequeue();

    logger.log('debug', `SIZE OF QUEUE: ${mainQueue.head}, DATE OF REQUEST: ${new Date(headers.objectRequest.Timestamp).toISOString()}`);

    processRequest(headers).then((response)=>{
        logResponse(response);
		uploadToFirebase(response, headers.requestType).then(()=>{
			processNext();
        }).catch((error)=>{
			logError(error);
			processNext();
        });

	}).catch(function(error){
        logError(error);
		processNext();
	});
}

function processNext() {
    logger.log('debug', "Processing next");

    if(!mainQueue.isEmpty())
	{
		processOpalQueue();
	}else{
        logger.log('debug', "Queue is empty");
		mainQueue.inProgress = false;
	}
}

/**
 * logResponse
 * @param response
 * @desc logs every successful response the listener handles
*/
function logResponse(response){
	// Log before uploading to Firebase. Check that it was not a simple log
	if (response.Headers.RequestObject.Request !== 'Log') {
		logger.log('debug', "Completed response", {
			deviceID: response.Headers.RequestObject.DeviceId,
			userID: response.Headers.RequestObject.UserID,
			request: response.Headers.RequestObject.Request +
			(response.Headers.RequestObject.Request === 'Refresh' ? ": " + response.Headers.RequestObject.Parameters.Fields.join(' ') : ""),
			requestKey: response.Headers.RequestKey
		});

        logger.log('info', "Completed response", response.Headers.RequestObject.Request);
	}
}

/**
 * logError
 * @param err
 * @param requestObject
 * @param requestKey
 * @desc logs every error the listener encounters
 */
function logError(err, requestObject, requestKey) {
    err = JSON.stringify(err);
    logger.error("Error processing request!", {
        error: err,
        deviceID:requestObject.DeviceId,
        userID:requestObject.UserID,
        request:requestObject.Request,
        requestKey: requestKey
    });
}

/**
 * clearTimeoutRequests
 * @desc Erase response data on firebase in case the response has not been processed
 * TODO: THIS SHOULD BE IN SEPARATE PROCESS. WE'VE SEEN THAT THIS HOLDS UP THE EVENT LOOP
 */
function clearTimeoutRequests() {
    ref.child('users').once('value').then(function(snapshot){
        const now = (new Date()).getTime();
        const usersData = snapshot.val();
        for (const user in usersData) {
            for(const requestKey in usersData[user])
            {
                if(usersData[user][requestKey].hasOwnProperty('Timestamp')&&now-usersData[user][requestKey].Timestamp>60000)
                {
                    logger.log('info','Deleting leftover response on firebase', {
                        request: requestKey
                    });
                    ref.child('users/'+user+'/'+requestKey).set(null);
                }
            }

        }
    });
}

/**
 * clearClientRequests
 * @desc Erase requests data on firebase in case the request has not been processed
 * TODO: THIS SHOULD BE IN SEPARATE PROCESS. WE'VE SEEN THAT THIS HOLDS UP THE EVENT LOOP
 */
function clearClientRequests(){
    logger.log('debug', 'clearClientRequest called');
    ref.child('requests').once('value').then(function(snapshot){
        const now = (new Date()).getTime();
        const requestData = snapshot.val();
        for (const requestKey in requestData) {
            if(requestData[requestKey].hasOwnProperty('Timestamp')&&now-requestData[requestKey].Timestamp>60000) {
                logger.log('info', 'Deleting leftover request on firebase', {
                    requestKey: requestKey
                });
                ref.child('requests/' + requestKey).set(null);
            }
        }
    });
}

/**
 * processRequest
 * @param headers
 * @desc takes in the request read from Firebase and routes it to the correct API handler
 */
function processRequest(headers){

    logger.log('debug', 'Processing request: ' + JSON.stringify(headers));
    logger.log('info', 'Processing request');

    const r = q.defer();
    const requestKey = headers.key;
    const requestObject = headers.objectRequest;

    // Separate security requests from main requests
    if(processApi.securityAPI.hasOwnProperty(requestObject.Request)) {

        logger.log('debug', 'Processing security request');

        processApi.securityAPI[requestObject.Request](requestKey, requestObject)
            .then(function (response) {
                r.resolve(response);
            })
            .catch(function (error) {
                logError(error, requestObject, requestKey);
            });
    } else {

        logger.log('debug', 'Processing general request');

        mainRequestApi.apiRequestFormatter(requestKey, requestObject)
            .then(function(results){
                r.resolve(results);
            })
            .catch(function (error) {
                logError(error, requestObject, requestKey);
            });
    }
    return r.promise;
}

/**
 * uploadToFirebase
 * @param response
 * @param key
 * @desc Encrypt and upload the response to Firebase
 */
function uploadToFirebase(response, key) {

    logger.log('debug', 'Uploading to Firebase');

    return new Promise((resolve, reject)=>{

        //Need to make a copy of the data, since the encryption key needs to be read
        const headers = JSON.parse(JSON.stringify(response.Headers));
        const success = response.Response;
        const requestKey = headers.RequestKey;
        const salt = response.Salt;

        let encryptionKey = response.EncryptionKey;

        delete response.EncryptionKey;
	    delete response.Salt;

        // Encrypt the response data
        try{
            if(typeof encryptionKey!=='undefined' && encryptionKey!=='') {
                logger.log('debug', 'Encrypting response');

                utility.encrypt(response, encryptionKey, salt)
                    .then((res) => {
                        response = res;
                    })
                    .catch((err) => {
                        logError(err);
                        reject(err);
                    })
            }
        } catch(err) {
            logError(err);
            reject(err);
        }

	    response.Timestamp = admin.database.ServerValue.TIMESTAMP;

        let path = '';
        if (key === "requests") {
            const userId = headers.RequestObject.UserID;
            path = 'users/'+userId+'/'+requestKey;
	    } else if (key === "passwordResetRequests") {
		    path = 'passwordResetResponses/'+requestKey;
	    }

	    delete response.Headers.RequestObject;

        logger.log('debug', 'Uploading response to Firebase');

        ref.child(path).set(response).then(function(){
		    logResponse(response);
		    completeRequest(headers, success, key);
		    resolve('done');
	    }).catch(function (error) {
		    logger.error('Error writing to firebase', {error:error});
		    reject(error);
	    });
    });
}

/**
 * completeRequest
 * @desc Clears the request off Firebase after returning response
 * @param headers
 * @param success
 * @param key
 * @return {Promise}
 */
function completeRequest(headers, success, key) {
    return ref.child(key).child(headers.RequestKey).set(null)
    .catch(function (error) {
        logger.error('Error writing to firebase', {error:error});
    });
}

