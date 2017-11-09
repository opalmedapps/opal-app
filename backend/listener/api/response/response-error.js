const OpalResponse = require('./response');
/**
 * @class OpalResponseError;
 * @type {exports.OpalResponseError}
 */

class OpalResponseError extends OpalResponse {

	constructor(code, data, reqObj, errorBack){
		super(code, data, reqObj);
		this.errorBackend = errorBack;
	}
	toJSON(){
		return {code: this.code, errorBackend:this.errorBackend, errorUser: this.data};
	}
	toLegacy() {
		return {Code: this.code, Reason: this.data, Headers:{RequestKey:reqObj.key, RequestObject:reqObj.toLegacy()
				}, EncryptionKey: reqObj.auth.key, Salt: reqObj.auth.salt};
	}
}
module.exports = OpalResponseError;
