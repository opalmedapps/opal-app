
//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('MUHCApp').controller('logOutController',['FirebaseService','$rootScope','UserAuthorizationInfo', '$state','$q','RequestToServer','LocalStorage', function(FirebaseService, $rootScope, UserAuthorizationInfo,$state,$q,RequestToServer,LocalStorage){
		console.log(FirebaseService);
		var firebaseLink=new Firebase(FirebaseService.getFirebaseUrl());
		redirectPage().then(setTimeout(function(){location.reload()},100))
		function redirectPage(){
			RequestToServer.sendRequest('Logout');
			firebaseLink.unauth();
			LocalStorage.resetUserLocalStorage();
			FirebaseService.getAuthentication().$unauth();
			var r=$q.defer();
			$state.go('init')
			r.resolve;
			return r.promise;
		}
}]);
