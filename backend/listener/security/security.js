var sqlInterface=require('./../api/sqlInterface.js');
var q=require('q');
var utility=require('./../utility/utility.js');
var CryptoJS=require('crypto-js');
var exports=module.exports={};


exports.resetPasswordRequest=function(requestKey, requestObject)
{
    var r=q.defer();
    //console.log(requestObject.UserEmail);
    var responseObject = {};
    //Get the patient fields to verify the credentials
    console.log(requestObject);
    sqlInterface.getPatientFieldsForPasswordReset(requestObject).then(function(patient){
        //Check for injection attacks by the number of rows the result is returning
        if(patient.length>1||patient.length === 0)
        {
            responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason:'Injection attack, incorrect Email'};
            r.resolve(responseObject);
        }else{
            //If the request is not erroneus simply direct the request to appropiate function based on the request mapping object
            //var request = requestObject.Request;
            console.log(requestObject.Request, requestObject.Parameters);
            console.log(patient);
            requestMappings[requestObject.Request](requestKey, requestObject,patient[0]).then(function(response){
                r.resolve(response);
            });
        }
    }).catch(function(error){
        console.log("Reqeust error", error);
        //If there is an error with the queries reply with an error message
        responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason: error+""};
        r.resolve(responseObject);
    });
    return r.promise;

};
exports.verifySecurityAnswer=function(requestKey,requestObject,patient)
{
    var r=q.defer();

    var key = patient.AnswerText;
    console.log("before decryption", requestObject.Parameters);
    var unencrypted=utility.decryptObject(requestObject.Parameters,key);
    console.log("after decryption");

    var response = {};

    var isSSNValid = unencrypted.SSN == patient.SSN;
    console.log("SSNVALID "+unencrypted.SSN, isSSNValid);
    var isAnswerValid = unencrypted.Answer == patient.AnswerText;
    console.log("Answer valid ", isAnswerValid);
    
    var isVerified;
    if (unencrypted.SSN == 'undefined' || unencrypted.SSN == '') isVerified = isAnswerValid;
    else isVerified = isSSNValid && isAnswerValid;
    console.log("Verified ", isVerified);

    if (isVerified)
    {
        response = { RequestKey:requestKey, Code:3,Data:{AnswerVerified:"true"}, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};
        sqlInterface.setTrusted(requestObject)
            .then(function(){
                r.resolve(response);
            })
            .catch(function(error){
                response = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason:'Could not set trusted device'};
            })

    } else {
        response = { RequestKey:requestKey, Code:3,Data:{AnswerVerified:"false"}, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};
        r.resolve(response);
    }



    return r.promise;
};
exports.setNewPassword=function(requestKey, requestObject,patient)
{
    var r=q.defer();

    var key = patient.AnswerText;
    var unencrypted=utility.decryptObject(requestObject.Parameters,key);

    sqlInterface.setNewPassword(unencrypted.newPassword,patient.PatientSerNum, requestObject.Token).then(function(){
        var response = { RequestKey:requestKey, Code:3,Data:{PasswordReset:"true"}, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};
        r.resolve(response);
    }).catch(function(error){
        console.log('Invalid setting password', error);
        //completeRequest(requestKey,{},'Invalid');
        var response = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason:'Could not set password'};
        r.resolve(response);
    });

    return r.promise;
};

exports.securityQuestion=function(requestKey,requestObject) {


    var r = q.defer();

    var unencrypted=utility.decryptObject(requestObject.Parameters,'none');

    console.log(requestObject);

    sqlInterface.updateDeviceIdentifier(requestObject, unencrypted)
        .then(function () {
            return sqlInterface.getSecurityQuestion(requestObject)
        })
        .then(function (response) {
            console.log(response);
            r.resolve({
                Code:3,
                Data:response.Data,
                Headers:{RequestKey:requestKey,RequestObject:requestObject},
                Response:'success'
            });

        })
        .catch(function (response){

            r.resolve({
                Headers:{RequestKey:requestKey,RequestObject:requestObject},
                Code: 2,
                Data:{},
                Response:'error',
                Reason:response
            });

        });
    return r.promise;

};

var requestMappings = {
    'SetNewPassword':exports.setNewPassword,
    'VerifyAnswer':exports.verifySecurityAnswer
};