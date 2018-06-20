//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('InitSettingsController', InitSettingsController);

    InitSettingsController.$inject = [
        'FirebaseService', 'NavigatorParameters', 'UserPreferences', 'Constants', '$timeout', '$window'
    ];

    /* @ngInject */
    function InitSettingsController(FirebaseService, NavigatorParameters, UserPreferences, Constants, $timeout, $window) {

        var vm = this;
        var params;
        vm.changeLanguage = changeLanguage;
        vm.openPageLegal = openPageLegal;
        vm.goToFeedback = goToFeedback;
        vm.secureYourDeviceNotice = secureYourDeviceNotice;

        var parameters;
        var navigatorName;

        activate();

        /////////////////////////

        function activate(){
            params = NavigatorParameters.getParameters();
            vm.navigatorName = params.Navigator;
            vm.navigator = $window[vm.navigatorName];

            navigatorName = params.Navigator;

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
                cordova.getAppVersion.getVersionNumber().then(function (version) {
                    $timeout(function(){
                        vm.version = version;
                    });
                });
            }else{
                $timeout(function(){
                    vm.version = '1.2.0';
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
        //     vm.navigator.pushPage('views/settings/secure-device.html');
        //     vm.navigator.pushPage('./views/templates/content.html', {contentType: 'secureyourdevice'});
            window[navigatorName].pushPage('/views/templates/content.html', {contentType: 'secureyourdevice'});
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
