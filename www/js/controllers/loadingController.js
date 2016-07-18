//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('MUHCApp').controller('LoadingController', ['$rootScope','$state', '$scope','UpdateUI', 'UserAuthorizationInfo','UserPreferences', '$q','Patient', 'Messages', '$timeout','LocalStorage',function ($rootScope,$state, $scope, UpdateUI, UserAuthorizationInfo, UserPreferences, $q, Patient, Messages,$timeout,LocalStorage){
		$timeout(function()
		{
			modal.show();
		});
		
		if(LocalStorage.isUserDataDefined())
		{
			$timeout(function()
			{
				UpdateUI.init().then(function(){
					$rootScope.refresh=true;
						$state.go('Home');
						modal.hide();
				});
			},200);
		}else{
			UpdateUI.init().then(function(){
			$rootScope.refresh=true;
				$state.go('Home');
				modal.hide();
			});
		}
		setTimeout(function(){
			console.log(typeof Patient.getFirstName());
			if(typeof Patient.getFirstName()=='undefined'||Patient.getFirstName()==''){
				console.log('Inside alert');
				console.log('we meet again');
				var mod=undefined;
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
		},40000);
}]);
