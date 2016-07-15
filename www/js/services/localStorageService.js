var myApp=angular.module('MUHCApp');
myApp.service('LocalStorage',['UserAuthorizationInfo', 'EncryptionService',function(UserAuthorizationInfo,EncryptionService){
	function readLocalStorage(section)
	{
		if(section=='All')
		{
			 var user=window.localStorage.getItem('UserAuthorizationInfo');
			 user=JSON.parse(user);
			 storage=window.localStorage.getItem(user.UserName);

			 storage = JSON.parse(storage);
			 console.log(storage);
			 EncryptionService.decryptData(storage);
			 console.log('asdas');
			 return storage;
		}else{
			var user=window.localStorage.getItem('UserAuthorizationInfo');
			user=JSON.parse(user);
			storage=window.localStorage.getItem(user.UserName);
			storage=JSON.parse(storage);
			EncryptionService.decryptData(storage);
			return storage[section];
		}
	}

	return {
		WriteToLocalStorage:function(section, data)
		{
			temp = angular.copy(data);
			temp = JSON.stringify(temp);

			temp = JSON.parse(temp);
			temp = EncryptionService.encryptData(temp);
			if(section=='All')
			{
				 window.localStorage.setItem(UserAuthorizationInfo.UserName, JSON.stringify(temp));
			}else{
				var storage=window.localStorage.getItem(UserAuthorizationInfo.UserName);
				storage=JSON.parse(storage);

				if(!storage)
				{
					var object={};
					object[section]=temp;
					window.localStorage.setItem(UserAuthorizationInfo.UserName,JSON.stringify(object));

				}else{
					storage[section]=temp;
					window.localStorage.setItem(UserAuthorizationInfo.UserName,JSON.stringify(storage));
				}
			}

		},
		isUserDataDefined:function()
		{
			var storage=window.localStorage.getItem(UserAuthorizationInfo.UserName);
				if(!storage||typeof storage=='undefined'){
					return false;
				}else{
					return true;
				}
		},
		ReadLocalStorage:function(section)
		{
			return readLocalStorage(section);
		},
		resetUserLocalStorage:function()
		{
			window.localStorage.removeItem('UserAuthorizationInfo');
			window.localStorage.removeItem(UserAuthorizationInfo.UserName);
			window.localStorage.removeItem(UserAuthorizationInfo.UserName+'/Timestamps');
		}



	};


}]);
