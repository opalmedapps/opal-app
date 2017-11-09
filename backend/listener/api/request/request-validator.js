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
		if(this.validateRequestCredentials(requestObject))
		{

			//Gets user password for decrypting
			sqlInterface.getEncryption(requestObject).then(function(rows) {
				if (rows.length > 1 || rows.length === 0) {
					//Rejects requests if username returns more than one password
					r.reject(new OpalResponseError(1, 'Potential Injection Attack, invalid password for encryption',request, 'Invalid credentials'));
				} else {
					let {Password, AnswerText} = rows[0];
					utility.decrypt({req: requestObject.Request, params: requestObject.Parameters},Password,AnswerText)
						.then((dec)=>{
							request.setAuthenticatedInfo(AnswerText, Password, dec.req,dec.params);
							r.resolve(request);
						})
						.catch((err)=>{
							r.reject(new OpalResponseError(2, 'Unable to process request', request, err))
						});
				}
			}).catch((err)=>{
				r.reject(new OpalResponseError(2,  'Unable to process request', request, err));
			});
		}else{
			r.reject(new OpalResponseError(2, 'Unable to process request', request, 'Missing request parameters'));
		}
		return r.promise;
	}

	/***
	 * @name validateRequestCredentials
	 * @description Validates the credentials of a request
	 * @param requestObject
	 * @returns {*}
	 */
	static validateRequestCredentials(requestObject){
		//Must have all the properties of a request
		let prop = ['Request', 'DeviceId', 'Token', 'UserID'];
		return prop.reduce((valid, property)=>{
			if(!valid) return false;
			else return requestObject.hasOwnProperty(property);
		},true);
	}
}
module.exports = RequestValidator;