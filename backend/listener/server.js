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
const cp                = require('child_process');
const os                = require('os');

const FIREBASE_DEBUG = !!process.env.FIREBASE_DEBUG;

/*********************************************
 * INITIALIZE
 *********************************************/

// Initialize firebase connection
const serviceAccount = require(config.FIREBASE_ADMIN_KEY);
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: config.DATABASE_URL
});

if(FIREBASE_DEBUG) admin.database.enableLogging(true);

// Get reference to correct data element
const db = admin.database();
const ref = db.ref("/dev2");
const heartbeatRef = db.ref("/dev2/users/heartbeat");

logger.log('debug', 'INITIALIZED APP IN DEBUG MODE');

// Ensure there is no leftover data on firebase
ref.set(null)
	.catch(function (error) {
		logger.log('error', 'Cannot reset firebase', {
			error:error
		})
	});



logger.log('info','Initialize listeners: ');
listenForRequest('requests');
listenForRequest('passwordResetRequests');
spawnCronJobs();


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

            if(snapshot.val().Request === 'HeartBeat'){
                handleHeartBeat(snapshot.val())
            } else {
                handleRequest(requestType,snapshot);
            }
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

    const headers = {key: snapshot.key, objectRequest: snapshot.val()};
    processRequest(headers).then(function(response){
        // Log before uploading to Firebase. Check that it was not a simple log
        if (response.Headers.RequestObject.Request !== 'Log') logResponse(response);
        uploadToFirebase(response, requestType);
    });
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
function logError(err, requestObject, requestKey)
{
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

                logger.log('debug', 'processed request successfully with response: ' + JSON.stringify(response));

                r.resolve(response);
            })
            .catch(function (error) {
                logError(error, requestObject, requestKey);
                r.resolve(error);
            });
    } else {

        logger.log('debug', 'Processing general request');

        mainRequestApi.apiRequestFormatter(requestKey, requestObject)
            .then(function(results){
                r.resolve(results);
            })
    }
    return r.promise;
}

/**
 * encryptResponse
 * @desc Encrypts the response object before being uploaded to Firebase
 * @param response
 * @return {Promise}
 */
function encryptResponse(response)
{
	let encryptionKey = response.EncryptionKey;
	let salt = response.Salt;
	delete response.EncryptionKey;
	delete response.Salt;

	if(typeof encryptionKey!=='undefined' && encryptionKey!=='')
	{
		return utility.encrypt(response, encryptionKey, salt);
	}else{
		return Promise.resolve(response);
	}
}

/**
 * uploadToFirebase
 * @param response
 * @param key
 * @desc Encrypt and upload the response to Firebase
 */
function uploadToFirebase(response, key)
{
  logger.log('debug', 'Uploading to Firebase');
	return new Promise((resolve, reject)=>{

		//Need to make a copy of the data, since the encryption key needs to be read
        const headers = JSON.parse(JSON.stringify(response.Headers));
        const requestKey = headers.RequestKey;

        encryptResponse(response).then((response)=>{
			response.Timestamp = admin.database.ServerValue.TIMESTAMP;
            let path = '';
            if (key === "requests") {
                const userId = headers.RequestObject.UserID;
                path = 'users/'+userId+'/'+requestKey;
			} else if (key === "passwordResetRequests") {
				path = 'passwordResetResponses/'+requestKey;
			}

			delete response.Headers.RequestObject;

			logger.log('debug', path);

			ref.child(path).set(response).then(function(){
				logger.log('debug', 'Uploaded to firebase');
				completeRequest(headers, key);
				resolve('done');
			}).catch(function (error) {
				logger.error('Error writing to firebase', {error:error});
				reject(error);
			});
		}).catch((err)=>{
			logger.error('Error writing to firebase', {error:err});
			reject(err);
		});
	});
}

/**
 * Sets the request reference to null after uploading response
 * @param headers
 * @param key
 * @return {Promise}
 */
function completeRequest(headers, key)
{
    logger.log('debug', 'Removing request from Firebase after uploading response: ' + key);
	return ref.child(key).child(headers.RequestKey).set(null)
		.catch(function (error) {
			logger.error('Error writing to firebase', {error:error});
		});
}

function handleHeartBeat(data){
    "use strict";

    let HeartBeat = {};

    //Get CPU Usage
    const cpus = os.cpus();
    let CPUInfo = {
        0: {Global: null, Averages: null},
        1: {Global: null, Averages: null},
        2: {Global: null, Averages: null},
        3: {Global: null, Averages: null}
    };

    let i = 0, len = cpus.length;
    for(; i < len; i++) {
        const cpu = cpus[i];

        let type;
        let currentCPU = {};
        let total = 0;

        for(type in cpu.times) {
            total += cpu.times[type];
        }

        for(type in cpu.times) {
            currentCPU.type = Math.round(100 * cpu.times[type] / total);
        }

        CPUInfo[i].Global = cpus;
        CPUInfo[i].Averages = currentCPU;
    }

    CPUInfo.Process = process.cpuUsage();

    //Get Memory Usage Of Process
    let memoryUsage = process.memoryUsage();

    //Get Other Process Info
    let config = process.config;

    //Push Heartbeat Back To Firebase
    HeartBeat.CPU = CPUInfo;
    HeartBeat.Memory = memoryUsage;
    HeartBeat.Config = config;
    HeartBeat.Timestamp = data.Timestamp;

    heartbeatRef.set(HeartBeat)
        .catch(err => {
            logger.log('error', 'Error reporting heartbeat', err)
        })

}


/*********************************************
 * CRON
 *********************************************/

/**
 * Spawns three cron jobs:
 *  1) clearRequest: clears request from firebase that have not been handled within 5 minute period
 *  2) clearResponses: clears responses from firebase that have not been handled within 5 minute period
 *  3) heartbeat: sends heartbeat request to firebase every 30 secs to get information about listener
 */
function spawnCronJobs(){
    spawnClearRequest();
    spawnClearResponses();
    spawnHeartBeat();
}

/**
 * @name spawnClearRequest
 * @desc creates clearRequest process that clears requests from firebase every 5 minutes
 */
function spawnClearRequest(){
    let clearRequests = cp.fork(`${__dirname}/cron/clearRequests.js`);

    // Handles clearRequest cron events
    clearRequests.on('message', (m) => {
        logger.log('info', 'PARENT got message:', m);
    });

    clearRequests.on('error', (m) => {
        logger.log('error','clearRequest cron error:', m);
        clearRequests.kill();
        if(clearRequests.killed){
            clearRequests = cp.fork(`${__dirname}/cron/clearRequests.js`);
        }
    });
}

/**
 * @name spawnClearResponse
 * @desc creates clearResponse process that clears responses from firebase every 5 minutes
 */
function spawnClearResponses(){
    let clearResponses = cp.fork(`${__dirname}/cron/clearResponses.js`);

    // Handles clearResponses cron events
    clearResponses.on('message', (m) => {
        logger.log('info','PARENT got message:', m);
    });

    clearResponses.on('error', (m) => {
        logger.log('error','clearResponse cron error:', m);

        clearResponses.kill();
        if(clearResponses.killed){
            clearResponses = cp.fork(`${__dirname}/cron/clearResponses.js`);
        }
    });
}


function spawnHeartBeat(){
    // create new Node child processs
    let heartBeat = cp.fork(`${__dirname}/cron/heartBeat.js`);

    // Handles heartBeat cron events
    heartBeat.on('message', (m) => {
        logger.log('info','PARENT got message:', m);
    });

    heartBeat.on('error', (m) => {
        logger.log('error','heartBeat cron error:', m);

        heartBeat.kill();
        if(heartBeat.killed){
            heartBeat = cp.fork(`${__dirname}/cron/heartBeat.js`);
        }
    });

}