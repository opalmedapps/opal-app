var myApp=angular.module('MUHCApp');
myApp.service('EncryptionService',function(UserAuthorizationInfo){
	function decryptObject(object)
	    {
				var secret=UserAuthorizationInfo.getPassword();

				if(typeof object =='string')
				{
					var decipherbytes = CryptoJS.AES.decrypt(object, secret);
					object=decipherbytes.toString(CryptoJS.enc.Utf8);
				}else{
					for (var key in object)
					{
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
								object[key]=decipherbytes.toString(CryptoJS.enc.Utf8);
							}
						}
					}
				}
				return object;
				/*
				var secret=UserAuthorizationInfo.getPassword();
		       	for (var key in object)
		       	{
			        if (typeof object[key]=='object')
			        {
			        	decryptObject(object[key],secret);
			        }else
			        {
								if(object[key]!='')
								{
									try {
										var decipherbytes = CryptoJS.AES.decrypt(object[key], secret);
										object[key]=decipherbytes.toString(CryptoJS.enc.Utf8)
										}
										catch(err) {
										    console.log(err);
										}

								}
			        }
		       	}

		 	 return object;*/
	    };
    function encryptObject(object)
	{
		var secret=UserAuthorizationInfo.getPassword();
	 	if (typeof object=='string'){
	 		var ciphertext = CryptoJS.AES.encrypt(object, secret);
	 		var encryptedString=ciphertext.toString();

	 		return encryptedString;
	 	}else if(typeof object!=='string'&& typeof object!=='object'){
	 		object=String(object);
	 		var ciphertext = CryptoJS.AES.encrypt(object, secret);
	 		var encryptedString=ciphertext.toString();
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
			      var ciphertext = CryptoJS.AES.encrypt(object[key],secret );
			      object[key]=ciphertext.toString();
			    }
			}

			return object;
		}
	};
	return{
		decryptData:function(object,secret)
	    {
	    	return decryptObject(object,secret);
	    },
    encryptData:function(object,secret)
   {
   	return encryptObject(object,secret);
	},
	decryptWithKey:function(object,secret)
	{
			for (var key in object)
			{
				if (typeof object[key]=='object')
				{
					decryptObject(object[key],secret);
				}else
				{
					if(object[key]!='')
					{
						try {
							var decipherbytes = CryptoJS.AES.decrypt(object[key], secret);
							object[key]=decipherbytes.toString(CryptoJS.enc.Utf8)
							}
							catch(err) {
									console.log(err);
							}

					}
				}
			}

	 return object;
	}



	}


});
