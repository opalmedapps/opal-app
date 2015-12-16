var myApp=angular.module('MUHCApp');
myApp.service('LocalStorage',['UserAuthorizationInfo', function(UserAuthorizationInfo){
	return {
		WriteToLocalStorage:function(section, data)
		{
			if(section=='All')
			{
				 window.localStorage.setItem(UserAuthorizationInfo.UserName, JSON.stringify(data));
			}else{
				var storage=window.localStorage.getItem(UserAuthorizationInfo.UserName);
				storage=JSON.parse(storage);
				storage[section]=data;
				window.localStorage.setItem(UserAuthorizationInfo.UserName,JSON.stringify(storage));
			}

		},
		ReadLocalStorage:function(section)
		{
			if(section=='All')
			{
				 var user=window.localStorage.getItem('UserAuthorizationInfo');
				 user=JSON.parse(user);
				 storage=window.localStorage.getItem(user.UserName);
				 return JSON.parse(storage);
			}else{
				var user=window.localStorage.getItem('UserAuthorizationInfo');
				user=JSON.parse(user);
				storage=window.localStorage.getItem(user.UserName);
				storage=JSON.parse(storage);
				return storage[section];
			}
		}



	};


}]);
