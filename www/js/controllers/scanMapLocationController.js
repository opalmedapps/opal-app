/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
var myApp=angular.module('MUHCApp');
myApp.controller('ScanMapLocationController',['$timeout','$scope','RequestToServer','FirebaseService', 'UpdateUI', 'UserPreferences','MapLocation','NativeNotification',function($timeout,$scope,RequestToServer,FirebaseService,UpdateUI,UserPreferences,MapLocation,NativeNotification ){

	var page=generalNavigator.getCurrentPage();
	var parameter=page.options.param;

	$scope.showLoadingScreen=true;
	RequestToServer.sendRequest('MapLocation',{QRCode:parameter})
	var languagePreference=UserPreferences.getLanguage();
	UpdateUI.update('MapLocation').then(function(data)
	{

		$scope.showLoadingScreen=false;
		$timeout(function(){
				$scope.map = data;

				if(typeof $scope.map !=='undefined')
				{
					if(languagePreference=='EN')
					{
						$scope.map.Name=$scope.map.MapName_EN;
						$scope.map.Description=$scope.map.MapDescription_EN;
					}else if(languagePreference=='FR'){
						$scope.map.Name=$scope.map.MapName_FR;
						$scope.map.Description=$scope.map.MapDescription_FR;
					}
				}
		});
	},function(error)
	{

		NativeNotification.showNotificationAlert('Could not retrieve location, check your internet connection');
		generalNavigator.popPage();

	});
	$scope.openMap=function()
	{
		if(app){
       var ref = cordova.InAppBrowser.open($scope.map.MapUrl, '_blank', 'EnableViewPortScale=yes');
    }else{
       window.open($scope.map.MapUrl);
    }
	}
}]);
