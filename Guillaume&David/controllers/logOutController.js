
//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('app').controller('logOutController',['Auth','UserAuthorizationInfo', '$state', function(Auth, UserAuthorizationInfo,$state){
		console.log(Auth);
	//this.firebaseLink.set({logged: 'false'});
		var firebaseLink=new Firebase('https://luminous-heat-8715.firebaseio.com/users/'+UserAuthorizationInfo.UserName+'/fields');
		Auth.$unauth();
		firebaseLink.set({logged: 'false'});
		$state.go('logIn');


}]);
