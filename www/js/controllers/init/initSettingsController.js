//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('InitSettingsController', InitSettingsController);

    InitSettingsController.$inject = [
        'FirebaseService', 'NavigatorParameters', 'UserPreferences', 'Constants', '$timeout'
    ];

    /* @ngInject */
    function InitSettingsController(FirebaseService, NavigatorParameters, UserPreferences, Constants, $timeout) {

        var vm = this;
        var params;
        vm.changeLanguage = changeLanguage;
        vm.openPageLegal = openPageLegal;
        vm.goToRateThisApp = goToRateThisApp;

        activate();

        /////////////////////////

        function activate(){
            params = NavigatorParameters.getParameters();
            vm.navigatorName = params.Navigator;
            vm.navigator = window[vm.navigatorName];

            initSettings();
        }

        function initSettings()
        {
            var authData = FirebaseService.getAuthentication().$getAuth();
            vm.authenticated = !!authData;
            vm.languageSwitch  = (UserPreferences.getLanguage().toUpperCase() !== 'EN');
            $timeout(function() {
                vm.currentYear = new Date().getFullYear();
            });

            if(Constants.app){
                cordova.getAppVersion.getVersionNumber(function (version) {
                    vm.version = version;
                });
            }else{
                $timeout(function(){
                    vm.version = '0.5.0';
                })
            }
        }

        function changeLanguage (value)
        {

            if(value)
            {
                UserPreferences.setLanguage('FR');
            }else{
                UserPreferences.setLanguage('EN');
            }
        }

        function goToRateThisApp()
        {

        }


        function openPageLegal(type)
        {
            if(type === 0)
            {
                NavigatorParameters.setParameters({type:type, title:'Terms of Use',Navigator:vm.navigatorName});
                vm.navigator.pushPage('./views/init/init-legal.html');
            }else{
                NavigatorParameters.setParameters({type:type, title:'Privacy Policy',Navigator:vm.navigatorName});
                vm.navigator.pushPage('./views/init/init-legal.html');

            }

        }
    }
})();
