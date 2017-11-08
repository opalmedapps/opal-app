const utility           = require('./../utility/utility.js');
const sqlInterface      = require('./sqlInterface.js');
const q                 = require('q');
const processApiRequest = require('./processApiRequest.js');
const logger            = require('./../logs/logger');

/**
 * apiRequestFormatter
 * @desc handles the api requests by formatting the response obtained from the API
 * @param requestKey
 * @param requestObject
 * @returns {Promise}
 */
exports.apiRequestFormatter=function(requestKey,requestObject) {

    const r = q.defer();
    const encryptionKey = '';

    let responseObject = {};

    //Gets user password for decrypting
    sqlInterface.getEncryption(requestObject).then(function(rows){
        if(rows.length>1||rows.length === 0) {
            //Rejects requests if username returns more than one password
            logger.log('error', 'Error at getting users encryption information. This is due to a username returning more than one password, or none at all.');
            responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject},EncryptionKey:'', Code: 1, Data:{},Response:'error', Reason:'Injection attack, incorrect UserID'};
            r.resolve(responseObject);
        }else{

            //Gets password and security answer (both hashed) in order to decrypt request
            const salt = rows[0].AnswerText;
            const pass = rows[0].Password;

            try{
                utility.decrypt(requestObject.Request,pass,salt)
                    .then((res) => {
                        requestObject.Request = res;

                        //If requests after decryption is empty, key was incorrect, reject the request
                        //TODO: Remove? I'm pretty sure this code will never be reached
                        if(requestObject.Request === '') {
                            responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject},EncryptionKey:'', Code: 1, Data:{},Response:'error', Reason:'Incorrect Password for decryption'};
                            r.resolve(responseObject);
                        }else{
                            //Otherwise decrypt the parameters and send to process api request
                            utility.decrypt(requestObject.Parameters,pass,salt)
                                .then((res) =>{
                                    requestObject.Parameters= res;

                                    //Process request simple checks the request and pipes it to the appropiate API call, then it receives the response
                                    processApiRequest.processRequest(requestObject).then(function(data) {
                                        //Once its process if the response is a hospital request processed, simply delete request
                                        responseObject = data;
                                        responseObject.Code = 3;
                                        responseObject.EncryptionKey = pass;
                                        responseObject.Salt = salt;
                                        responseObject.Headers = {RequestKey:requestKey,RequestObject:requestObject};
                                        r.resolve(responseObject);
                                    }).catch(function(errorResponse){
                                        //There was an error processing the request with the parameters, delete request;
                                        logger.log('error', "Error processing request", {error:errorResponse});
                                        errorResponse.Code = 2;
                                        errorResponse.Reason = 'Server error, report the error to the hospital';
                                        errorResponse.Headers = {RequestKey:requestKey,RequestObject:requestObject};
                                        responseObject.EncryptionKey = pass;
                                        responseObject.Salt = salt;
                                        r.resolve(errorResponse);
                                    });
                                })
                                .catch((err)=>{
                                    logger.log('error', JSON.stringify(err));
                                    responseObject = { RequestKey:requestKey,EncryptionKey:encryptionKey, Code:2,Data:error, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'error', Reason:'Server error, report the error to the hospital'};
                                    r.resolve(requestObject);
                                })
                        }
                    })
            } catch(err) {
                logger.log('error', JSON.stringify(err));
                responseObject = { RequestKey:requestKey,EncryptionKey:encryptionKey, Code:2,Data:error, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'error', Reason:'Server error, report the error to the hospital'};
                r.resolve(requestObject);
            }
        }
    }).catch(function(error){
        logger.log('error', "Error processing request", {error: error});
        responseObject = { RequestKey:requestKey,EncryptionKey:encryptionKey, Code:2,Data:error, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'error', Reason:'Server error, report the error to the hospital'};
        r.resolve(responseObject);
    });

    return r.promise;
};

//TODO: MOVE TO CONSTANTS FILE

/**
 * Response codes facilitate the handling of the error for firebase, here is the breakdown.
 * CODE 1: Attack to our server incorrect password for encryption or unable to retrieve user's password, delete request and ignore user, since user
 * expects only responses encrypted with their password
 * CODE 2: User is authenticated correctly but their was a problem processing the request, could be queries, incorrect parameters, etc. In that case we log the error
 *        In the error log table and respond to the user a server error, report error to the hospital.
 * CODE 3: success
 */
//
var responseCodes =
    {
        '1':'Authentication problem',
        '2':'Server Response Error',
        '3':'Success',
        '4':'Too many attempts for answer'
    };
