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
    var encryptionHash = '';


	function decryptObject(object,secret)
	{
		if(typeof object ==='string')
		{
			var decipher_bytes = CryptoJS.AES.decrypt(object, secret);
			object=decipher_bytes.toString(CryptoJS.enc.Utf8);
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
		
	 	if (typeof object ==='string'){
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
			      object[key] = CryptoJS.AES.encrypt(object[key], secret).toString();
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
			return decryptObject(object, encryptionHash);
		},

        /**
         *@ngdoc method
         *@name decryptDataWithKey
         *@methodOf MUHCApp.service:EncryptionService
         *@params {Object} object Object to be decrypted, {String} key fo
         *@description Uses the given key as the decryption hash
         *@return {Object} Returns decrypted object
         **/
        decryptDataWithKey:function(object, key)
        {
            //Decrypt
            return decryptObject(object, key);
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
			return encryptObject(object, encryptionHash);
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
			console.log('OBJECT: ' +  JSON.stringify(object), 'SECRET: ' + secret);
			return encryptObject(object,secret);
		},

        /**
         *@ngdoc method
         *@name setSecurityAns
         *@methodOf MUHCApp.service:EncryptionService
         *@params {String} answer Security answer
         *@description Sets the security answer to be used as the encryption key for all future communication.
         **/
		setSecurityAns: function (answer) {
			securityAnswerHash = answer;
        },

        /**
         *@ngdoc method
         *@name getSecurityAns
         *@methodOf MUHCApp.service:EncryptionService
         *@description Uses the secret parameter as key to encrypt object parameter
         *@return {String} Returns hashed security answer
         **/
		getSecurityAns: function () {
			return securityAnswerHash;
        },

        /**
         *@ngdoc method
         *@name encryptPassword
         *@methodOf MUHCApp.service:EncryptionService
         *@description Encrypts a given password using SHA256
         *@return {String} Returns hashed password
         **/
        hash: function (incoming) {

        	console.log("before: " + incoming);

         	var temp =  CryptoJS.SHA256(incoming).toString();

            console.log("after: " + temp);

            return temp;
        },

        /**
         *@ngdoc method
         *@name setEncryptionHash
         *@methodOf MUHCApp.service:EncryptionService
         *@description Encrypts a given password using SHA512
         *@return {String} Returns hashed password
         **/
        generateEncryptionHash: function () {
            encryptionHash = CryptoJS.PBKDF2(UserAuthorizationInfo.getPassword(), securityAnswerHash, {keySize: 512/32, iterations: 1000}).toString(CryptoJS.enc.Hex);
        }

	};


});
