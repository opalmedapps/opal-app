/**
 *
 */
class OpalRequest {
	constructor(reqObj, key, salt='', pass=''){
		this.type = reqObj.Request;
		this.parameters = reqObj.Parameters;
		this.key = key;
		this.auth = {salt: salt,pass: pass};
		this.meta = reqObj; //contains deviceId, token, UserEmail etc..
		delete reqObj.Request;
		delete reqObj.Parameters;
	}

	setAuthenticatedInfo(salt, pass, type, params)
	{
		this.auth.salt = salt;
		this.auth.pass = pass;
		this.type = type;
		this.params = params;
	}
	toLegacy(){
		this.meta.Request = this.type;
		this.meta.Parameters = this.parameters;
		return this.meta;
	}
}

module.exports = OpalRequest;