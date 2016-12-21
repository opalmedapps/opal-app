var Firebase    =require('firebase'),
    utility=require('./utility.js'),
    credentials=require('./credentials.js'),
    sqlInterface=require('./sqlInterface.js'),
    resetPasswordApi=require('./resetPassword.js'),
    CryptoJS=require('crypto-js'),
    q=require('q'),
    processApiRequest=require('./processApiRequest.js');

//This handles the api requests by formating the response obtain from the API
exports.apiRequestFormatter=function(requestKey,requestObject)
{
  var r=q.defer();
  var responseObject = {};
  var encryptionKey = '';
  //Gets user password for decryptiong
  sqlInterface.getUsersPassword(requestObject.UserID).then(function(rows){
    if(rows.length>1||rows.length === 0)
    {
      //Rejects requests if username returns more than one password
      console.log('Rejecting request due to injection attack', rows);
      //Construction of request object
      responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject},EncryptionKey:'', Code: 1, Data:{},Response:'error', Reason:'Injection attack, incorrect UserID'};       
      r.resolve(responseObject);
    }else{
      //Gets password and decrypts request
      var key=rows[0].Password;
      requestObject.Request=utility.decryptObject(requestObject.Request,key);
      encryptionKey=key;
      //If requests after decryption is empty, key was incorrect, reject the request
      if(requestObject.Request === '') {
        console.log('Rejecting request due to incorrect password recorded');
        responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject},EncryptionKey:'', Code: 1, Data:{},Response:'error', Reason:'Incorrect Password for decryption'};
        r.resolve(responseObject);
      }else{
        //Otherwise decrypt the parameters and send to process api request
        requestObject.Parameters=utility.decryptObject(requestObject.Parameters,key);
        console.log('line38', requestObject.Parameters);
        
        //Process request simple checks the request and pipes it to the appropiate API call, then it receives the response
        processApiRequest.processRequest(requestObject).then(function(data)
        {
          //Once its process if the response is a hospital request processed, simply delete request
            responseObject = data;
            responseObject.Code = 3;
            responseObject.EncryptionKey = encryptionKey;   
            responseObject.Headers = {RequestKey:requestKey,RequestObject:requestObject};
            r.resolve(responseObject);
        }).catch(function(errorResponse){
          //There was an error processing the request with the parameters, delete request
            console.log(errorResponse);
            errorResponse.Code = 2;
            errorResponse.Reason = 'Server error, report the error to the hospital';
            errorResponse.Headers = {RequestKey:requestKey,RequestObject:requestObject};
            errorResponse.EncryptionKey = encryptionKey;
            r.resolve(errorResponse);
        });
      }
    }
  }).catch(function(error){
    console.log(error);
    responseObject = { RequestKey:requestKey,EncryptionKey:encryptionKey, Code:2,Data:error, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'error', Reason:'Server error, report the error to the hospital'};
    r.resolve(responseObject);
  });

  return r.promise;
};
/**
 * Response codes facilitate the handling of the error for firebase, here is the breakdown.
 * CODE 1: Attack to our server incorrect password for encryption or unable to retrieve user's password, delete request and ignore user, since user
 * expects only responses encrypted with their password
 * CODE 2: User is authenticated correctly but their was a problem processing the request, could be queries, incorrect parameters, etc. In that case we log the error
 *        In the error log table and respond to the user a server error, report error to the hospital.
 * CODE 3: success
 */
//
var resposeCodes = 
{
  '1':'Authentication problem',
  '2':'Server Response Error',
  '3':'Success'
};
