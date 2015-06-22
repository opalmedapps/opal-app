
//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('app').controller('logOutController',['Auth','UserAuthorizationInfo','UserDataMutable', '$state','$q', function(Auth, UserAuthorizationInfo,UserDataMutable,$state,$q){
		console.log(Auth);
	//this.firebaseLink.set({logged: 'false'});
		var firebaseLink=new Firebase('https://luminous-heat-8715.firebaseio.com/users/'+UserAuthorizationInfo.UserName+'/fields');
		Auth.$unauth();
		var authData = firebaseLink.getAuth();
		console.log(authData);
		firebaseLink.unauth();
		console.log(authData);

		firebaseLink.set({logged: 'false'});
		console.log(UserDataMutable);
		delete UserDataMutable;
		delete UserAuthorizationInfo;
		console.log(UserDataMutable);
		Firebase.goOffline();
		console.log(authData);
		function redirectPage(){
			var r=$q.defer();
			$state.go('logIn.enter')
			r.resolve;
			return r.promise;
		}
		if(!authData){
			var redirect=redirectPage();
			redirect.then(location.reload());
		}

		/*if(!authData){
			setTimeout(function(){
				location.reload();
			},500);
			$state.go('logIn.enter');
		}*/
		
		
}]);
