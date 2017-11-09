/**
 *
 */
class OpalRequest {
	constructor(reqObj, key, fields = null, salt='', pass=''){
		if(fields === null)
		{
			this.type = reqObj.Request;
			this.parameters = reqObj.Parameters
		}else{
			this.type = fields.Request;
			this.parameters = fields.Parameters;
		}
		this.key = key;
		this.auth = {salt: salt,pass: pass};
		this.meta = reqObj; //contains deviceId, token etc..
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
	toJSON() {
		return {requestFields: {Request: this.type, Parameters:this.parameters}, auth:this.auth, meta: this.meta};
	}
	toLegacy(){
		this.meta.Request = this.type;
		this.meta.Parameters = this.parameters;
		return this.meta;
	}
}

module.exports = OpalRequest;