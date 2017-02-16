//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.service:EncryptionService
*@requires MUHCApp.service:UserAuthorizationInfo
*@description Provides an API to encrypt and decrypt objects, arrays, or strings.
**/
myApp.service('EncryptionService',function(UserAuthorizationInfo){

	var securityAnswerHash = '';


	function decryptObject(object,secret)
	{
		if(typeof object =='string')
		{
			var decipherbytes = CryptoJS.AES.decrypt(object, secret);
			object=decipherbytes.toString(CryptoJS.enc.Utf8);
		}else{
			for (var key in object)
			{
				//console.log(key);
				if (typeof object[key]=='object')
				{
					decryptObject(object[key],secret);
				} else
				{
					if (key=='UserID')
					{
						object[key]=object[key];
					}else if(key=='DeviceId')
					{
						object[key]=object[key];
					}
					else
					{
						var decipherbytes = CryptoJS.AES.decrypt(object[key], secret);
						//console.log(decipherbytes);
						object[key]=decipherbytes.toString(CryptoJS.enc.Utf8);
						//console.log(object[key]);
					}
				}
			}
		}
				return object;
	    }
    function encryptObject(object,secret)
	{
		
	 	if (typeof object=='string'){
	 		return CryptoJS.AES.encrypt(object, secret).toString();
	 		//var encryptedString=ciphertext.toString();

	 		//return encryptedString;
	 	}else if(typeof object!=='string'&& typeof object!=='object'){
	 		object=String(object);
	 		var encryptedString = CryptoJS.AES.encrypt(object, secret).toString();
	 		//var encryptedString=ciphertext.toString();
	 		console.log(encryptedString);
	 		return encryptedString;
	 	}else{
			for (var key in object)
			{
				if (typeof object[key]=='object')
			    {
			      encryptObject(object[key],secret);
			    }else
			    {
			      if (typeof object[key] !=='string') object[key]=String(object[key]);
			      object[key] = CryptoJS.AES.encrypt(object[key],secret ).toString();
			      //object[key]=ciphertext.toString();
			    }
			}

			return object;
		}
	}
	return{
		/**
		*@ngdoc method
		*@name decryptData
		*@methodOf MUHCApp.service:EncryptionService
		*@params {Object} object Object to be decrypted
		*@description Uses the hashed of the password from the {@link MUHCApp.service:UserAuthorizationInfo  UserAuthorizationInfo} service as key to decrypt object parameter
    	*@return {Object} Returns decrypted object
		**/
		decryptData:function(object)
		{
			//Decrypt
			return decryptObject(object,securityAnswerHash);
		},
		/**
		*@ngdoc method
		*@name encryptData
		*@methodOf MUHCApp.service:EncryptionService
		*@params {Object} object Object to be encrypted
		*@description Uses the hashed of the password from the {@link MUHCApp.service:UserAuthorizationInfo  UserAuthorizationInfo} service as key to encrypt object parameter
    	*@return {Object} Returns encrypted object
		**/
		encryptData:function(object)
		{
			return encryptObject(object,securityAnswerHash);
		},
		/**
		*@ngdoc method
		*@name decryptWithKey
		*@methodOf MUHCApp.service:EncryptionService
		*@params {Object} object Object to be decrypted
		*@params {String} secret Key for decrypting
		*@description Uses the secret parameter as key to decrypt object parameter
    	*@return {Object} Returns decrypted object
		**/
		decryptWithKey:function(object,secret)
		{
			return decryptObject(object,secret);
		},
		/**
		*@ngdoc method
		*@name encryptWithKey
		*@methodOf MUHCApp.service:EncryptionService
		*@params {Object} object Object to be encrypted
		*@params {String} secret Key for encrypting
		*@description Uses the secret parameter as key to encrypt object parameter
    	*@return {Object} Returns encrypted object
		**/
		encryptWithKey:function(object, secret)
		{
			return encryptObject(object,secret);
		},

		setSecurityAns: function (answer) {
			securityAnswerHash = answer;
        },

		getSecurityAns: function () {
			return securityAnswerHash;
        }

	};


});
