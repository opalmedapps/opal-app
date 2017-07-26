//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp = angular.module('MUHCApp');

myApp.controller('InitSettingsController',function($scope, FirebaseService,$timeout, NavigatorParameters, UserPreferences,RequestToServer)
{
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

    var params = NavigatorParameters.getParameters();
    $scope.navigatorName = params.Navigator;

    $scope.navigator = window[$scope.navigatorName];
    initSettings();

    function initSettings()
    {
        var authData = FirebaseService.getAuthentication().$getAuth();
        $scope.authenticated = !!authData;
        $scope.languageSwitch  = (UserPreferences.getLanguage()=='EN')?false:true;
        $scope.currentYear = new Date().getFullYear();

        if(app){
            cordova.getAppVersion.getVersionNumber(function (version) {
                $timeout(function()
                {
                    $scope.version = version;
                });
            });
        }else{
            $scope.version = '0.0.1';
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
        /*if($scope.authenticated)
         {
         var objectToSend = {};
         objectToSend.NewValue = (value)?'FR':'EN';
         objectToSend.FieldToChange = 'Language';
         RequestToServer.sendRequest('AccountChange', objectToSend);
         }*/

    };

    $scope.goToRateThisApp = function()
    {

    };
    // function settingsSuccess() {
    //
    // }
    //
    // function settingsFail() {
    //
    // }

    // function openSettingsNow() {
    //
    //     if(ons.platform.isAndroid())cordova.plugins.settings.openSetting("application_details",settingsSuccess,settingsFail);
    //     else cordova.plugins.settings.open(settingsSuccess,settingsFail);
    //
    // }
    // $scope.openDeviceSettings = function()
    // {
    //     if(app && typeof cordova.plugins.settings.openSetting !== undefined){
    //         if(ons.platform.isAndroid())
    //         {
    //
    //             openSettingsNow();
    //         }else{
    //             openSettingsNow();
    //         }
    //     }
    // };


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