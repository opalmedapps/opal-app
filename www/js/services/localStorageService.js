//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.service:LocalStorage
*@requires $firebaseAuth
*@requires MUHCApp.service:UserAuthorizationInfo
*@requires MUHCApp.service:EncryptionService
*@description API to interact with the saved data storage for the patient.
**/
myApp.service('LocalStorage',['UserAuthorizationInfo', 'EncryptionService',function(UserAuthorizationInfo,EncryptionService){
	function readLocalStorage(section)
	{
		var user = '';
		if(section=='All')
		{
			user=window.localStorage.getItem('UserAuthorizationInfo');
			 user=JSON.parse(user);
			 storage=window.localStorage.getItem(user.UserName);
			 console.log(storage);
			 storage = JSON.parse(storage);
			 console.log(storage);
			 EncryptionService.decryptData(storage);
			 return storage;
		}else{
			user=window.localStorage.getItem('UserAuthorizationInfo');
			user=JSON.parse(user);
			storage=window.localStorage.getItem(user.UserName);
			storage=JSON.parse(storage);
			EncryptionService.decryptData(storage);
			return storage[section];
		}
	}

	return {
		   /**
		*@ngdoc method
		*@name WriteToLocalStorage
		*@methodOf MUHCApp.service:LocalStorage
		*@param {String} section Patient section to write to
		*@param {Object} data Object to write to that particular patient section. i.e. 'Documents', 'Announcements'
		*@description Writes the data parameter to that section in the patient storage encrypting all the data saved in the process.
		**/
		WriteToLocalStorage:function(section, data)
		{
			//Make copy of data
			temp = angular.copy(data);

			//Convert into string
			temp = JSON.stringify(temp);

			//Parse 
			temp = JSON.parse(temp);
			//Encrypt data
			temp = EncryptionService.encryptData(temp);

			//If section is all, replace all the data storage for user
			if(section=='All')
			{
				 window.localStorage.setItem(UserAuthorizationInfo.getUsername(), JSON.stringify(temp));
			}else{
				//Otherwise replace only the section
				var storage=window.localStorage.getItem(UserAuthorizationInfo.getUsername());
				storage=JSON.parse(storage);
				//If there isnt a section, write a new object to it.
				if(!storage)
				{
					var object={};
					object[section]=temp;
					window.localStorage.setItem(UserAuthorizationInfo.getUsername(),JSON.stringify(object));

				}else{
					storage[section]=temp;
					window.localStorage.setItem(UserAuthorizationInfo.getUsername(),JSON.stringify(storage));
				}
			}

		},
		/**
		*@ngdoc method
		*@name isUserDataDefined
		*@methodOf MUHCApp.service:LocalStorage
   		*@returns {Boolean} Returns value depending on whether the storage for the user exists.
		**/
		isUserDataDefined:function()
		{
			var storage=window.localStorage.getItem(UserAuthorizationInfo.getUsername());
			//console.log(Object.keys(storage));
				if(!storage||typeof storage=='undefined'){
					return false;
				}else{
					return true;
				}
		},
		/**
		*@ngdoc method
		*@name ReadLocalStorage
		*@methodOf MUHCApp.service:LocalStorage
		*@param {String} section Section for patient data in localStorage
		*@description Reads section from localStorage, decrypts and returns decrypted object by using the hashed of password.
   		*@returns {Object} Returns decrypted object representing that section in localStorage
		**/
		ReadLocalStorage:function(section)
		{
			return readLocalStorage(section);
		},
		/**
		*@ngdoc method
		*@name updateLocalStorageAfterPasswordChange
		*@methodOf MUHCApp.service:LocalStorage
		*@description Updates the whole storage by encrypting all information with the new password.
		**/
		updateLocalStorageAfterPasswordChange:function(oldPassword, newPassword)
		{
			console.log(oldPassword,newPassword);
			var user=window.localStorage.getItem('UserAuthorizationInfo');
			user=JSON.parse(user);
			storage=window.localStorage.getItem(user.UserName);
			storage = JSON.parse(storage);
			storage = EncryptionService.decryptWithKey(storage,oldPassword);
			storage = EncryptionService.encryptWithKey(storage,CryptoJS.SHA256(newPassword).toString());
			window.localStorage.setItem(user.UserName,JSON.stringify(storage));
		},
		/**
		*@ngdoc method
		*@name resetUserLocalStorage
		*@methodOf MUHCApp.service:LocalStorage
		*@description Deletes all the user fields in local storage
		**/
		resetUserLocalStorage:function()
		{
			window.localStorage.removeItem('UserAuthorizationInfo');
			window.localStorage.removeItem(UserAuthorizationInfo.getUsername());
			window.localStorage.removeItem(UserAuthorizationInfo.getUsername()+'/Timestamps');
			
		}



	};


}]);
