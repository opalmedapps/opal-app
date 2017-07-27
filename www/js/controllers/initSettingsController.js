//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp = angular.module('MUHCApp');

myApp.controller('InitSettingsController',function($scope, FirebaseService,$timeout, NavigatorParameters, UserPreferences,RequestToServer)
{
    var params = NavigatorParameters.getParameters();
    $scope.navigatorName = params.Navigator;

    $scope.navigator = window[$scope.navigatorName];
    initSettings();

    function initSettings()
    {
        var authData = FirebaseService.getAuthentication().$getAuth();
        $scope.authenticated = !!authData;
        $scope.languageSwitch  = (UserPreferences.getLanguage().toUpperCase() !== 'EN');
        $scope.currentYear = new Date().getFullYear();

        if(document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1){
            cordova.getAppVersion.getVersionNumber(function (version) {
                $timeout(function()
                {
                    $scope.version = version;
                });
            });
        }else{
            $scope.version = '0.4.0';
        }
    }
    $scope.changeLanguage = function(value)
    {

        if(value)
        {
            UserPreferences.setLanguage('FR');
        }else{
            UserPreferences.setLanguage('EN');
        }
    };

    $scope.goToRateThisApp = function()
    {

    };


    $scope.openPageLegal = function(type)
    {
        if(type === 0)
        {
            NavigatorParameters.setParameters({type:type, title:'Terms of Use',Navigator:$scope.navigatorName});
            $scope.navigator.pushPage('./views/init/init-legal.html');
        }else{
            NavigatorParameters.setParameters({type:type, title:'Privacy Policy',Navigator:$scope.navigatorName});
            $scope.navigator.pushPage('./views/init/init-legal.html');

        }

    };




});

myApp.controller('LegalController',function(){

});