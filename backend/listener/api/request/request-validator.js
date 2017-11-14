/**
 *  Opal Imports
 */
const OpalRequest = require('./request');
const OpalResponseError = require('../response/response-error');
const sqlInterface = require('../sqlInterface');
const utility = require('../../utility/utility');
/**
 * Library imports
 */
const q = require('q');
/**
 * @class RequestValidator
 * @description Obtains request, decrypts
 */
class RequestValidator {

	/**
	 * validate
	 * @param requestKey
	 * @param requestObject
	 */
	static validate(requestKey, requestObject)
	{
		const r = q.defer();
		let request = new OpalRequest(requestObject, requestKey);

		let validation = this.validateRequestCredentials(request);
		if(validation.isValid)
		{
			//Gets user password for decrypting
			sqlInterface.getEncryption(requestObject).then(function(rows) {
				if (rows.length > 1 || rows.length === 0) {
					//Rejects requests if username returns more than one password
					r.reject(new OpalResponseError(1, 'Potential Injection Attack, invalid password for encryption', request, 'Invalid credentials'));
				} else {

					let {Password, AnswerText} = rows[0];
					utility.decrypt({req: request.type, params: request.parameters},Password,AnswerText)
						.then((dec)=>{
							request.setAuthenticatedInfo(AnswerText, Password, dec.req,dec.params);
							r.resolve(request);
						})
						.catch((err)=>{
							r.reject(new OpalResponseError(2, 'Unable to process request', request, err));
						});
				}
			}).catch((err)=>{
				r.reject(new OpalResponseError(2,  'Unable get user encryption', request, err));
			});
		}else{
			r.reject(new OpalResponseError(2, 'Unable to process request', request, 'Missing request parameters: ' + validation.errors));
		}
		return r.promise;
	}

	/***
	 * @name validateRequestCredentials
	 * @description Validates the credentials of a request
	 * @param request
	 * @returns {*}
	 */
	static validateRequestCredentials(request){
		if(!request.meta || !request.type) return false;
		//Must have all the properties of a request
		let prop = ['DeviceId', 'Token', 'UserID','Timestamp','UserEmail'];
		let errors = [];

		let isValid = prop.reduce((valid, property)=>{
			if(!valid) return false;
			else {
				if(!request.meta.hasOwnProperty(property)) errors.push(property);
				return request.meta.hasOwnProperty(property);
            }
		},true);

		return {isValid: isValid, errors: errors}
	}
}
module.exports = RequestValidator;