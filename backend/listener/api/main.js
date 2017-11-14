const q                   = require('q');
const processApiRequest   = require('./processApiRequest.js');
const OpalResponseSuccess = require('./response/response-success');
const OpalResponseError   = require('./response/response-error');
const RequestValidator    = require('./request/request-validator');
const logger              = require('../logs/logger.js');


/**
 * @namespace RequestFormatter
 * @description Module is in charge of taking a request, building response
 * @type {{requestFormatter: requestFormatter, apiRequestFormatter: apiRequestFormatter}}
 */
module.exports = {
	requestFormatter,
	apiRequestFormatter
};

/**
 * requestFormatter
 * @description handles the api requests by formatting the response obtained from the API
 * @param {key, request}
 * @returns {Promise}
 */
function requestFormatter({key,request}) {
	return RequestValidator.validate(key, request)
		.then( opalReq => { //opalReq of type, OpalRequest
			return processApiRequest.processRequest(opalReq.toLegacy()).then((data)=>
			{
				logger.log('debug', 'Successfully processed request: ' + data);
                logger.log('info', 'Successfully processed request');

				let response = new OpalResponseSuccess(data, opalReq);
				return response.toLegacy();
			}).catch((err)=>{
				logger.log('error', 'Error processing request', err);
				let response = new OpalResponseError( 2, 'Server error, report the error to the hospital', opalReq, err);
				return response.toLegacy();
			});
		}).catch( err => {
            logger.log('error', 'Error validating request', err);
            return err.toLegacy();
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
function apiRequestFormatter(requestKey,requestObject) {
    logger.log('debug', 'Reached API request formatter');
	return  requestLegacyWrapper(requestKey, requestObject);
}


