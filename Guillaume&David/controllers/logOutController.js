
//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('app').controller('logOutController',['Auth', '$state', function(Auth, $state){
		console.log(Auth);
	//this.firebaseLink.set({logged: 'false'});
		Auth.$unauth();
		$state.go('logIn');


}]);
