
const utility           = require('./../utility/utility.js');
const sqlInterface      = require('./sqlInterface.js');
const q                 = require('q');
const processApiRequest = require('./processApiRequest.js');
const logger            = require('./../logs/logger');
const OpalResponseSuccess = require('./response/response-success');
const OpalResponseError = require('./response/response-error');
const RequestValidator = require('./request/request-validator');

module.exports.requestFormatter = requestFormatter;
/**
 * apiRequestFormatter
 * @desc handles the api requests by formatting the response obtained from the API
 * @param requestKey
 * @param requestObject
 * @returns {Promise}
 */
function requestFormatter({key,request}) {
	return RequestValidator.validate(key, request)
		.then( opalReq => { //opalReq of type, OpalRequest
			return processApiRequest.processRequest(opalReq.toLegacy()).then((data)=>
			{
				let response = new OpalResponseSuccess(data, opalReq);
				return response.toLegacy();
			}).catch((err)=>{
				let response = new OpalResponseError( 2, 'Server error, report the error to the hospital',
									opalReq,err);
				return response.toLegacy();
			});
		});
}

/**
 * @name requestLegacyWrapper
 * @description Wrapper to make it compatible with current infrastructure
 * @param requestKey
 * @param requestObject
 */
function requestLegacyWrapper(requestKey, requestObject) {
	let r = q.defer();
	requestFormatter({key: requestKey,request:requestObject})
		.then((result)=>r.resolve(result)).catch((result)=>r.resolve(result));
	return r.promise;
}
/**
 * apiRequestFormatter
 * @desc handles the api requests by formatting the response obtained from the API
 * @param requestKey
 * @param requestObject
 * @returns {Promise}
 */
module.exports.apiRequestFormatter = function(requestKey,requestObject) {
	return  requestLegacyWrapper(requestKey, requestObject);
};

//TODO: MOVE TO CONSTANTS FILE


/**
 * const r = q.defer();
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
            const {AnswerText, Password} = rows[0];
            utility.decrypt({req: requestObject.Request, params: requestObject.Parameters},Password,AnswerText)
                .then((dec) => {
                    requestObject.Request = dec.req;
                    requestObject.Parameters = dec.params;

                    //If requests after decryption is empty, key was incorrect, reject the request
                    if(requestObject.Request === '') {
                        responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject},EncryptionKey:'', Code: 1, Data:{},Response:'error', Reason:'Incorrect Password for decryption'};
                        r.resolve(responseObject);
                    }else{
                        //Process request simple checks the request and pipes it to the appropiate API call, then it receives the response
                        processApiRequest.processRequest(requestObject).then(function(data)
                        {
                            //Once its process if the response is a hospital request processed, simply delete request
                            responseObject = data;
                            responseObject.Code = 3;
                            responseObject.EncryptionKey = Password;
                            responseObject.Salt = AnswerText;
                            responseObject.Headers = {RequestKey:requestKey,RequestObject:requestObject};
                            r.resolve(responseObject);
                        }).catch(function(errorResponse){
                            //There was an error processing the request with the parameters, delete request;
                            logger.log('error', "Error processing request", {error:errorResponse});
                            errorResponse.Code = 2;
                            errorResponse.Reason = 'Server error, report the error to the hospital';
                            errorResponse.Headers = {RequestKey:requestKey,RequestObject:requestObject};
                            responseObject.EncryptionKey = Password;
                            responseObject.Salt = AnswerText;
                            r.resolve(errorResponse);
                        });
                    }
                }).catch((err)=>{
                    logger.log('error', JSON.stringify(err));
                    responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject},EncryptionKey:'', Code: 1, Data:{},Response:'error', Reason:'Incorrect Password for decryption'};
                    r.resolve(responseObject);
                });
        }
    }).catch(function(error){
        logger.log('error', "Error processing request", {error: error});
        responseObject = { RequestKey:requestKey,EncryptionKey:encryptionKey, Code:2,Data:error, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'error', Reason:'Server error, report the error to the hospital'};
        r.resolve(responseObject);
    });

 return r.promise;
};
 */


