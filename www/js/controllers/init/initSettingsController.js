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
        vm.goToFeedback = goToFeedback;
        vm.secureYourDeviceNotice = secureYourDeviceNotice;

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

        function goToFeedback()
        {
            vm.navigator.pushPage('views/general/feedback/feedback.html');
        }

        function secureYourDeviceNotice()
        {
        //    TODO
            vm.navigator.pushPage('views/settings/secure-device.html');
        }

        function openPageLegal(type)
        {
            if(type === 'TOU')
            {
                NavigatorParameters.setParameters({type:type, title:'Terms of Use', Navigator:vm.navigatorName});
                vm.navigator.pushPage('./views/init/init-legal.html');
            }else{
                NavigatorParameters.setParameters({type:type, title:'Privacy Policy', Navigator:vm.navigatorName});
                vm.navigator.pushPage('./views/init/init-legal.html');

            }

        }
    }
})();
