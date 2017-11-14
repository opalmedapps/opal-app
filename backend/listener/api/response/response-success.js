const OpalResponse = require('./response');
/**
 * @class OpalResponseSuccess
 *
 */
class OpalResponseSuccess extends OpalResponse {
	constructor(data, reqObj) {
		super(3,data,reqObj);
	}
	toLegacy() {
		this.data.Code = this.code;
		this.data.EncryptionKey = this.reqObj.auth.pass;
		this.data.Salt =  this.reqObj.auth.salt;
		this.data.Headers = {RequestKey:this.reqObj.key,RequestObject:this.reqObj.toLegacy()};
		return this.data;
	}
}
module.exports = OpalResponseSuccess;
