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
		return {Code: this.code, Reason: this.data, Headers:{RequestKey: this.reqObj.key, RequestObject: this.reqObj.toLegacy()
				}, EncryptionKey: this.reqObj.auth.pass, Salt: this.reqObj.auth.salt};
	}
}
module.exports = OpalResponseError;
