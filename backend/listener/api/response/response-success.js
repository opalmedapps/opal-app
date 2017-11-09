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
		data.Code = this.code;
		data.EncryptionKey = reqObj.auth.pass;
		data.Salt =  reqObj.auth.salt;
		data.Headers = {RequestKey:reqObj.requestKey,RequestObject:reqObj.toLegacy()};
		return data;
	}
}
module.exports = OpalResponseSuccess;
