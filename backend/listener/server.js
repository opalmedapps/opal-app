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

// Initialize firebase connection

var serviceAccount = require("/home/robert/firebase_account/opal-dev-firebase-adminsdk-73h8x-3b90af80af.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://opal-dev.firebaseio.com"
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
console.log('Initialize listeners: ');
listenForRequest('requests');
listenForRequest('passwordResetRequests');

//
function listenForRequest(requestType){
    console.log('Starting regular request listener.');
    ref.child(requestType).on('child_added', function(snapshot){
        handleRequest(requestType,snapshot);
    });
}

function handleRequest(requestType, snapshot){
    var headers = {key: snapshot.key, objectRequest: snapshot.val()};
    console.log("Toplevel snapshot key", snapshot.key);
    //console.log("Childlevel snapshot key", childSnapshot.key);
    processRequest(headers).then(function(response){
        console.log('Got ' + requestType);
        uploadToFirebase(response, requestType);
    }).catch(function(error){
        console.log("Error processing request!", error);
    });
}

function clearTimeoutRequests()
{
    ref.child('users').once('value').then(function(snapshot){
        //console.log('I am inside deleting requests');
        var now=(new Date()).getTime();
        var usersData=snapshot.val();
        for (var user in usersData) {
            for(var requestKey in usersData[user])
            {
                if(usersData[user][requestKey].hasOwnProperty('Timestamp')&&now-usersData[user][requestKey].Timestamp>60000)
                {
                    console.log('I am deleting leftover responses');
                    ref.child('users/'+user+'/'+requestKey).set(null);
                }
            }

        }
    });
}

function clearClientRequests(){
    ref.child('requests').once('value').then(function(snapshot){
        //console.log('I am inside deleting requests');
        var now=(new Date()).getTime();
        var requestData=snapshot.val();
        for (var requestKey in requestData) {
            if(requestData[requestKey].hasOwnProperty('Timestamp')&&now-requestData[requestKey].Timestamp>60000)
            {
                console.log('I am deleting leftover requests');
                ref.child('requests/'+requestKey).set(null);
            }

        }
    });
}

function processRequest(headers){

    var r = q.defer();
    var requestKey = headers.key;
    var requestObject= headers.objectRequest;
    console.log("----------------------------------REQUEST OBJECT --------------------------------------")
    console.log(requestObject);
    console.log("----------------------------------REQUEST OBJECT END --------------------------------------")

    // Need to be able to send info
    if(requestObject.Request == 'SecurityQuestion'){
        securityApi.securityQuestion(requestKey,requestObject)
            .then(function(response) {
                console.log('New login initialized');
                //console.log(results);
                r.resolve(response);
            })
            .catch(function(error){
                console.log("SecurityAnswer error", error)
            });
    }
    else if(requestObject.Request=='PasswordReset'||requestObject.Request=='SetNewPassword'||requestObject.Request=='VerifyAnswer')
    {
        //console.log(requestObject);
        securityApi.resetPasswordRequest(requestKey,requestObject).then(function(results)
        {
            console.log('Reset Password ');
            //console.log(results);
            r.resolve(results)
            .catch(function(error){
                console.log("PassRest, SetNewPass or VerifyAns error", error)
            });
        });

    }else{
        mainRequestApi.apiRequestFormatter(requestKey, requestObject).then(function(results){
            console.log('Api call from server.js');
            //console.log(results);
            r.resolve(results);
        });
    }
    return r.promise;
}

function uploadToFirebase(response, key)
{
    console.log('I am about to go to into encrypting regular upload');
    var headers = JSON.parse(JSON.stringify(response.Headers));
    var success = response.Response;
    var requestKey = headers.RequestKey;
    var encryptionKey = response.EncryptionKey;
    //console.log(encryptionKey);
    delete response.EncryptionKey;
    if(typeof encryptionKey!=='undefined' && encryptionKey!=='') response = utility.encryptObject(response, encryptionKey);
    response.Timestamp = admin.database.ServerValue.TIMESTAMP;
    console.log("upload to firebase", response);

    var path = '';
    if (key === "requests") {
        var userId = headers.RequestObject.UserID;
        path = 'users/'+userId+'/'+requestKey;
    } else if (key === "passwordResetRequests") {
        path = 'passwordResetResponses/'+requestKey;
    }

    delete response.Headers.RequestObject;

    ref.child(path).set(response).then(function(){
        console.log('I just finished writing to firebase');
        completeRequest(headers,success, key);
    }).catch(function (error) {
        console.log('Error wrirting to firebase:' + error);
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


