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
			//grab the nonce
			var pair = splitValue(object);

			return nacl.util.encodeBase64(nacl.secretbox.open(nacl.util.decodeBase64(pair[1]), nacl.util.decodeBase64(pair[0]), secret));

		}else{
			for (var key in object)
			{
				//console.log(key);
				if (typeof object[key]=='object')
				{
					decryptObject(object[key],secret);
				} else
				{
					if (key==='UserID' || key==='DeviceId') {
                        object[key] = object[key];
                    }
					else
					{

                        //grab the nonce
                        pair = splitValue(object);

                        var value = nacl.secretbox.open(nacl.util.decodeBase64(pair[1]), nacl.util.decodeBase64(pair[0]), secret);
						//console.log(decipherbytes);
						object[key]= nacl.util.encodeBase64(value);
						//console.log(object[key]);
					}
				}
			}
		}
				return object;
	    }
    function encryptObject(object,secret, nonce)
	{
	 	if (typeof object ==='string'){
	 		return nacl.util.encodeBase64(nonce.concat(nacl.secretbox(nacl.util.decodeBase64(object), nonce, secret)));
	 	}else if(typeof object!=='string'&& typeof object!=='object'){
	 		object=String(object);
	 		return nacl.util.encodeBase64(nonce.concat(nacl.secretbox(nacl.util.decodeBase64(object), nonce, secret)));
	 	}else{
			for (var key in object)
			{
				if (typeof object[key]=='object')
			    {
			      encryptObject(object[key], secret, nonce);
			    }else
			    {
			      if (typeof object[key] !=='string') object[key]=String(object[key]);

			      	console.log("encrypted array: " + nacl.secretbox(nacl.util.decodeBase64(object[key]), nonce, secret));
					console.log("encrypted array concat: " + nonce.concat(nacl.secretbox(nacl.util.decodeBase64(object[key]), nonce, secret)));
					console.log("output: " + nacl.util.encodeBase64(nonce.concat(nacl.secretbox(nacl.util.decodeBase64(object[key]), nonce, secret))));

                    object[key] = nacl.util.encodeBase64(nonce.concat(nacl.secretbox(nacl.util.decodeBase64(object[key]), nonce, secret)));
			    }
			}
			return object;
		}
	}

    function splitValue(value) {
		var pair = [];
		pair.push(value.substring(0, nacl.secretbox.nonceLength - 1));
		pair.push(value.substring(nacl.secretbox.nonceLength - 1));
        return pair;
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
			return decryptObject(object, nacl.util.decodeUTF8(encryptionHash.substring(0, nacl.secretbox.keyLength - 1)));
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
            return decryptObject(object, nacl.util.decodeUTF8(key.substring(0, nacl.secretbox.keyLength - 1)));
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
            var nonce = this.generateNonce();
			return encryptObject(object, nacl.util.decodeUTF8(encryptionHash.substring(0, nacl.secretbox.keyLength - 1)), nonce);
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
			console.log("secret length: " + secret.length);
            console.log("required secret length: " + nacl.secretbox.keyLength );


            var nonce = this.generateNonce();
			return encryptObject(object, nacl.util.decodeUTF8(secret.substring(0, nacl.secretbox.keyLength - 1)), nonce);
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
         	return CryptoJS.SHA256(incoming).toString();
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
        },

        generateNonce: function() {
            return nacl.randomBytes(nacl.secretbox.nonceLength)
		}

	};


});
