//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('MUHCApp').controller('LoadingController', ['$rootScope','$state', '$scope','UpdateUI', 'UserAuthorizationInfo','UserPreferences', '$q','Patient', 'Messages', '$timeout','LocalStorage','NavigatorParameters','RequestToServer',function ($rootScope,$state, $scope, UpdateUI, UserAuthorizationInfo, UserPreferences, $q, Patient, Messages,$timeout,LocalStorage,NavigatorParameters,RequestToServer){
		modal.show();
		var loadingParameter = NavigatorParameters.getParameters();
		var userAuthorizationInfo = UserAuthorizationInfo.getUserAuthData();
		if(typeof userAuthorizationInfo == 'undefined'||!userAuthorizationInfo) $state.go('init');
		setTimeout(function()
		{
			UpdateUI.init(loadingParameter).then(function()
			{
				modal.hide();
				clearTimeout(timeOut);
				$state.go('Home');	
			});
		},200);
		
		//Timeout to show, alerting user of server problems.
		var timeOut = setTimeout(function(){ 
			console.log(typeof Patient.getFirstName());
			if(typeof Patient.getFirstName()=='undefined'||Patient.getFirstName()===''){
				console.log('Inside alert');
				console.log('we meet again');
				var mod;
				if(ons.platform.isAndroid())
				{
					mod='material';
				}
				modal.hide();
				ons.notification.alert({
					message: 'Problems with server, could not fetch data, try again later',
					modifier: mod,
					callback: function(idx) {
						if(typeof Patient.getFirstName()=='undefined'||Patient.getFirstName()=='')
						{
							$state.go('logOut');
						}else{
							$scope.go('home');
						}
					}
				});
			}
		},80000);
}]);
