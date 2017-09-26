/*
 * Filename     :   server.js
 * Description  :   This script listens for changes on dev2/ in firebase, reads those changes and writes a response back to firebase.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   07 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

var mainRequestApi      =   	require('./api/main.js');
var processApi          =       require('./api/processApiRequest');
var admin            	=   	require("firebase-admin");
var utility            	=   	require('./utility/utility.js');
var q 			        =      	require("q");
var config              =       require('./config.json');
var logger              =       require('./logs/logger.js');

/*********************************************
 * INTIALIZE
 *********************************************/

// Initialize firebase connection
var serviceAccount = require(config.FIREBASE_ADMIN_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.DATABASE_URL
});

//admin.database.enableLogging(true);

// Get reference to correct data element
var db = admin.database();
var ref = db.ref("/dev2");

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

// Listen for firebase changes and send responses for requests
function listenForRequest(requestType){
    logger.log('debug','Starting '+ requestType+' listener.');
    ref.child(requestType).on('child_added', function(snapshot){
        handleRequest(requestType,snapshot);
    });
}

function handleRequest(requestType, snapshot){
    var headers = {key: snapshot.key, objectRequest: snapshot.val()};
    processRequest(headers).then(function(response){

        // Log before uploading to Firebase. Check that it was not a simple log
        if (response.Headers.RequestObject.Request != 'Log') {

            //console.log(response.Headers.RequestObject.Parameters.Fields.join(' '));
            logger.log('info', "Completed response", {
                deviceID: response.Headers.RequestObject.DeviceId,
                userID: response.Headers.RequestObject.UserID,
                request: response.Headers.RequestObject.Request +
                (response.Headers.RequestObject.Request === 'Refresh' ? ": " + response.Headers.RequestObject.Parameters.Fields.join(' ') : ""),
                requestKey: response.Headers.RequestKey
            });
        }

        uploadToFirebase(response, requestType);

    }).catch(function(error){

        //Log the error
        logger.error("Error processing request!", {
            error: error
        });
    });
}

// Erase response data on firebase in case the response has not been processed
function clearTimeoutRequests()
{
    ref.child('users').once('value').then(function(snapshot){
        var now=(new Date()).getTime();
        var usersData=snapshot.val();
        for (var user in usersData) {
            for(var requestKey in usersData[user])
            {
                if(usersData[user][requestKey].hasOwnProperty('Timestamp')&&now-usersData[user][requestKey].Timestamp>60000)
                {
                    logger.log('info','Deleting leftover responses on firebase', {
                        request: requestKey
                    });
                    ref.child('users/'+user+'/'+requestKey).set(null);
                }
            }

        }
    });
}

// Erase requests data on firebase in case the request has not been processed
function clearClientRequests(){
    ref.child('requests').once('value').then(function(snapshot){
        //logger.log('I am inside deleting requests');
        var now=(new Date()).getTime();
        var requestData=snapshot.val();
        for (var requestKey in requestData) {
            if(requestData[requestKey].hasOwnProperty('Timestamp')&&now-requestData[requestKey].Timestamp>60000)
            {
                logger.log('info','Deleting leftover requests on firebase', {
                    requestKey: requestKey
                });
                ref.child('requests/'+requestKey).set(null);
            }

        }
    });
}

// Processes requests read from firebase
function processRequest(headers){

    var r = q.defer();
    var requestKey = headers.key;
    var requestObject= headers.objectRequest;

    // Separate security requests from main requests
    if(processApi.securityAPI.hasOwnProperty(requestObject.Request)) {
        processApi.securityAPI[requestObject.Request](requestKey, requestObject)
            .then(function (response) {
                r.resolve(response);
            })
            .catch(function (error) {
                logger.error("Error processing request!", {
                    error: error,
                    deviceID:requestObject.DeviceId,
                    userID:requestObject.UserID,
                    request:requestObject.Request,
                    requestKey: requestKey
                });
            });
    }else{
        mainRequestApi.apiRequestFormatter(requestKey, requestObject)
            .then(function(results){
                r.resolve(results);
            })
            .catch(function (error) {
                logger.error("Error processing request!", {
                    error: error,
                    deviceID:requestObject.DeviceId,
                    userID:requestObject.UserID,
                    request:requestObject.Request,
                    requestKey: requestKey
                });
            });
    }
    return r.promise;
}

// Uploading the response to firebase
function uploadToFirebase(response, key)
{

    //Need to make a copy of the data, since the encryption key needs to be read
    var headers = JSON.parse(JSON.stringify(response.Headers));
    var success = response.Response;
    var requestKey = headers.RequestKey;
    var encryptionKey = response.EncryptionKey;
    var salt = response.Salt;
    delete response.EncryptionKey;
    delete response.Salt;
    

    if(typeof encryptionKey!=='undefined' && encryptionKey!=='') response = utility.encrypt(response, encryptionKey, salt);
    response.Timestamp = admin.database.ServerValue.TIMESTAMP;
    var path = '';
    if (key === "requests") {
        var userId = headers.RequestObject.UserID;
        path = 'users/'+userId+'/'+requestKey;
    } else if (key === "passwordResetRequests") {
        path = 'passwordResetResponses/'+requestKey;
    }

    delete response.Headers.RequestObject;
    logger.log('debug', path);

    ref.child(path).set(response).then(function(){
        logger.log('debug', 'Uploaded to firebase');
        completeRequest(headers,success, key);
    }).catch(function (error) {
        logger.error('Error writing to firebase', {error:error});
    });
}

// Clearing the request off firebase
function completeRequest(headers, success, key)
{
    var requestKey = headers.RequestKey;
    var requestObject  = headers.RequestObject;
    requestObject.Parameters=JSON.stringify(requestObject.Parameters);
    requestObject.time=new Date();
    if(success == 'error')
    {
        requestObject.response='Failure';
    }else{
        requestObject.response='Success';
    }

    ref.child(key).child(requestKey).set(null)
        .catch(function (error) {
            logger.error('Error writing to firebase', {error:error});
        });
}
