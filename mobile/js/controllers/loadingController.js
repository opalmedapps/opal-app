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
				var mod=undefined;
				if(ons.platform.isAndroid())
				{
					mod='material'
				}
				modal.hide();
				if(storage){

				    ons.notification.confirm({
				      message: 'Problems with server, would you like to load your most recent saved data from the device?',
				      modifier: mod,
				      callback: function(idx) {
								console.log('I am in there?')
				        switch (idx) {
				          case 0:
										$state.go('logOut');
				            /*ons.notification.alert({
				              message: 'You pressed "Cancel".',
				              modifier: mod
				            });*/
				            break;
				          case 1:
									modal.show();
									console.log('I am in there?')
									UpdateUI.UpdateOffline('All').then(function(){
										modal.hide();
										$state.go('Home');
									});
				          break;
				        }
				      }
				    });


			}else{
				ons.notification.confirm({
					message: 'Problems with server, could not fetch data, try again later?',
					modifier: mod,
					callback: function(idx) {
						$state.go('logOut');
					}
				});
			}
		}
		},15000);
}]);
