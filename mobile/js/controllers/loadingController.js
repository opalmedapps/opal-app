//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('MUHCApp').controller('LoadingController', ['$rootScope','$state', '$scope','UpdateUI', 'UserAuthorizationInfo','UserPreferences', '$q','Patient', 'Messages', '$timeout',function ($rootScope,$state, $scope, UpdateUI, UserAuthorizationInfo, UserPreferences, $q, Patient, Messages,$timeout) {
		console.log('Im doing it');
		modal.show();
			setTimeout(function(){
			console.log('starting upfatye');
			var updateUI=UpdateUI.UpdateSection('All');

			updateUI.then(function(){

					console.log('finishing upfatye');
					$rootScope.refresh=true;
						$state.go('Home');
						modal.hide();
				});
			},5000);

		setTimeout(function(){
			if(typeof Patient.getFirstName()=='undefined'){
				var user=window.localStorage.getItem('UserAuthorizationInfo');
				user=JSON.parse(user);
				storage=window.localStorage.getItem(user.UserName);
				if(storage){
					var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
					if(app){
					{
						console.log('Inside notification!');
					}

				}
			}
		}
		},15000);
}]);
