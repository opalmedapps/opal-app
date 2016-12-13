
// Import necessary libraries

var mainRequestApi      =   	require('./main.js');
var resetPasswordApi    =   	require('./resetPassword.js');
var admin            	=   	require("firebase-admin");
var utility            	=   	require('./utility.js');
var q 			        =      	require("q");

// Initialize firebase connection

admin.database.enableLogging(true);

var serviceAccount = require("/home/robert/firebase_account/opal-dev-firebase-adminsdk-73h8x-5c71c7ec12.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://opal-dev.firebaseio.com",
    /*databaseAuthVariableOverride: {
        uid: "backend-worker"
    }*/
});

// Get reference to correct data element

var db = admin.database();
var ref = db.ref("/dev2");

// Clear requests that are still on Firebase

setInterval(function(){
    clearTimeoutRequests();
},30000);

// Listen for firebase changes and send responses for requests

listenAndSend();

function listenAndSend(){
    ref.on('child_added', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            	var headers = {key: childSnapshot.key,objectRequest: childSnapshot.val()};
		console.log("Toplevel snapshot key", snapshot.key);
		console.log("Childlevel snapshot key", childSnapshot.key);
		if(!(snapshot.key === "users" || snapshot.key === "passwordResetResponses")){
            		processRequest(headers).then(function(response){
				console.log('Got' + snapshot.key);
                		uploadToFirebase(response, snapshot.key);
			}).catch(function(error){
				console.log("Error processing request!", error);
			});
		}
	});

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
                    console.log('I am deleting leftover requests');
                    ref.child('users/'+user+'/'+requestKey).set(null);
                }
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


    if(requestObject.Request=='VerifySSN'||requestObject.Request=='SetNewPassword'||requestObject.Request=='VerifyAnswer')
    {
        //console.log(requestObject);
        resetPasswordApi.resetPasswordRequest(requestKey,requestObject).then(function(results)
        {
            console.log('Reset Password ');
            //console.log(results);
            r.resolve(results);
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
    console.log(encryptionKey);
    delete response.EncryptionKey;
    if(typeof encryptionKey!=='undefined' && encryptionKey!=='') response = utility.encryptObject(response, encryptionKey);
    response.Timestamp = admin.database.ServerValue.TIMESTAMP;
    console.log(response);

    var path = '';
    if (key === "requests") {
        var userId = headers.RequestObject.UserID;
        path = 'users/'+userId+'/'+requestKey;
    } else if (key === "passwordResetRequests") {
        path = 'passwordResetResponses/'+requestKey;
    }

    ref.child(path).set(response).then(function(){
        console.log('I just finished writing to firebase');
        completeRequest(headers,success, key);
    }).catch(function (error) {
        console.log('Error wrirting to firebase:' + error);
    });
}

/**
 * @name EncryptObject
 * @description Deletes the request from Firebase and displays it on the screen
 *
 */
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
}

console.log('Listener is started.')
