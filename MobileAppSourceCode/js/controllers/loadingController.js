//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('MUHCApp').controller('LoadingController', ['$rootScope','$state', '$scope','UpdateUI', 'UserAuthorizationInfo','UserPreferences', '$q',function ($rootScope,$state, $scope, UpdateUI, UserAuthorizationInfo, UserPreferences, $q) {
		console.log('Im doing it');
	    var updateUI=UpdateUI.UpdateUserFields();
	    updateUI.then(function(){
	        $state.go('Home');
	    });

}]);
