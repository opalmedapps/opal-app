const q                 = require('q');
const processApiRequest = require('./processApiRequest.js');
const OpalResponseSuccess = require('./response/response-success');
const OpalResponseError = require('./response/response-error');
const RequestValidator = require('./request/request-validator');
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
 * apiRequestFormatter
 * @description handles the api requests by formatting the response obtained from the API
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
			}).catch( err => {
				let response = new OpalResponseError( 2, 'Server error, report the error to the hospital',
									opalReq,err);
				return response.toLegacy();
			});
		}).catch( err => {
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
	return  requestLegacyWrapper(requestKey, requestObject);
};


