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
var securityApi         =   	require('./security/security.js');
var admin            	=   	require("firebase-admin");
var utility            	=   	require('./utility/utility.js');
var q 			        =      	require("q");
var config              =       require('./config.json');
var logger              =       require('./logs/logger.js')

// Initialize firebase connection

var serviceAccount = require(config.FIREBASE_ADMIN_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.DATABASE_URL
});

// Get reference to correct data element

var db = admin.database();
var ref = db.ref("/dev2");

// Clear requests that are still on Firebase

setInterval(function(){
    clearTimeoutRequests();
    clearClientRequests();
},60000);

// Listen for firebase changes and send responses for requests
logger.log('debug','Initialize listeners: ');
listenForRequest('requests');
listenForRequest('passwordResetRequests');

//
function listenForRequest(requestType){
    logger.log('debug','Starting '+ requestType+' listener.');
    ref.child(requestType).on('child_added', function(snapshot){
        handleRequest(requestType,snapshot);
    });
}

function handleRequest(requestType, snapshot){
    var headers = {key: snapshot.key, objectRequest: snapshot.val()};
    logger.log('debug',"Toplevel snapshot key", snapshot.key);
    processRequest(headers).then(function(response){
        logger.log('debug','Got ' + requestType);
        console.log(response);
        //logger.info(response);
        uploadToFirebase(response, requestType);
    }).catch(function(error){
        logger.error("Error processing request!", {error: error});
    });
}

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
                    logger.log('debug','Deleting leftover responses on firebase');
                    ref.child('users/'+user+'/'+requestKey).set(null);
                }
            }

        }
    });
}

function clearClientRequests(){
    ref.child('requests').once('value').then(function(snapshot){
        //logger.log('I am inside deleting requests');
        var now=(new Date()).getTime();
        var requestData=snapshot.val();
        for (var requestKey in requestData) {
            if(requestData[requestKey].hasOwnProperty('Timestamp')&&now-requestData[requestKey].Timestamp>60000)
            {
                logger.log('debug','Deleting leftover responses on firebase');
                ref.child('requests/'+requestKey).set(null);
            }

        }
    });
}

function processRequest(headers){

    var r = q.defer();
    var requestKey = headers.key;
    var requestObject= headers.objectRequest;
    //logger.log("----------------------------------REQUEST OBJECT --------------------------------------")
    //logger.log(requestObject);
    //logger.log("----------------------------------REQUEST OBJECT END --------------------------------------")

    // Need to be able to send info
    if(requestObject.Request == 'SecurityQuestion'){
        securityApi.securityQuestion(requestKey,requestObject)
            .then(function(response) {
                //logger.log('New login initialized');
                //logger.log(results);
                r.resolve(response);
            })
            .catch(function(error){
                //logger.log("SecurityAnswer error", error)
            });
    }
    else if(requestObject.Request=='PasswordReset'||requestObject.Request=='SetNewPassword'||requestObject.Request=='VerifyAnswer')
    {
        //logger.log(requestObject);
        securityApi.resetPasswordRequest(requestKey,requestObject).then(function(results)
        {
            //logger.log('Reset Password ');
            //logger.log(results);
            r.resolve(results)
            .catch(function(error){
                logger.error("PassRest, SetNewPass or VerifyAns error", {error:error})
            });
        });

    }else{
        mainRequestApi.apiRequestFormatter(requestKey, requestObject).then(function(results){
            //logger.log('Api call from server.js');
            //logger.log(results);
            r.resolve(results);
        });
    }
    return r.promise;
}

function uploadToFirebase(response, key)
{
    //logger.log('I am about to go to into encrypting regular upload');
    var headers = JSON.parse(JSON.stringify(response.Headers));
    var success = response.Response;
    var requestKey = headers.RequestKey;
    var encryptionKey = response.EncryptionKey;
    //logger.log(encryptionKey);
    delete response.EncryptionKey;
    if(typeof encryptionKey!=='undefined' && encryptionKey!=='') response = utility.encryptObject(response, encryptionKey);
    response.Timestamp = admin.database.ServerValue.TIMESTAMP;
    //logger.log("upload to firebase", response);

    var path = '';
    if (key === "requests") {
        var userId = headers.RequestObject.UserID;
        path = 'users/'+userId+'/'+requestKey;
    } else if (key === "passwordResetRequests") {
        path = 'passwordResetResponses/'+requestKey;
    }

    delete response.Headers.RequestObject;

    ref.child(path).set(response).then(function(){
        //logger.log('I just finished writing to firebase');
        completeRequest(headers,success, key);
    }).catch(function (error) {
        logger.error('Error wrirting to firebase', {error:error});
    });
}

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

    ref.child(key).child(requestKey).set(null);
    //headers = {};
}


