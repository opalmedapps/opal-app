
//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('app').controller('logOutController',['Auth','UserAuthorizationInfo','UserDataMutable', '$state','$q', function(Auth, UserAuthorizationInfo,UserDataMutable,$state,$q){
		console.log(Auth);
	//this.firebaseLink.set({logged: 'false'});
		var firebaseLink=new Firebase('https://luminous-heat-8715.firebaseio.com/');
		firebaseLink.child('PatientActivity/'+UserAuthorizationInfo.UserName).set({LogIn: false});
		firebaseLink.child('PatientActivity/'+UserAuthorizationInfo.UserName).set({LogOut: {Value:'true',Date:(new Date()).toString()}});
		firebaseLink.child('Users/'+UserAuthorizationInfo.UserName).set({Logged: 'false'});
		var authData = firebaseLink.getAuth();
		console.log(authData);
		firebaseLink.unauth();
		console.log(authData);

		

		console.log(UserDataMutable);
		delete UserDataMutable;
		delete UserAuthorizationInfo;
		console.log(UserDataMutable);
		console.log(authData);
		
		function redirectPage(){
			Auth.$unauth();
			var r=$q.defer();
			$state.go('logIn')
			r.resolve;
			return r.promise;
		}
		if(authData){
			var redirect=redirectPage();
			redirect.then(setTimeout(function(){location.reload()},100));
		}

		/*if(!authData){
			setTimeout(function(){
				location.reload();
			},500);
			$state.go('logIn.enter');
		}*/
		
		
}]);
