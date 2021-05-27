/*
 * Filename     :   aboutController.js
 * Description  :   Manages the about view. Only controls the link to the Cedar's donation page.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   18 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */


/**
 *  @ngdoc controller
 *  @name MUHCApp.controllers: AboutController
 *  @description
 *
 *  Manages the about view.
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('AboutController', AboutController);

    AboutController.$inject = ['$window', 'UserPreferences', 'NavigatorParameters', 'Params', 'UserHospitalPreferences'];

    /* @ngInject */
    function AboutController($window, UserPreferences, NavigatorParameters, Params, UserHospitalPreferences) {
        const vm = this;

        vm.openUrl = openUrl;
        vm.openTeam = openTeam;
        vm.openAcknowledge = openAcknowledge;
        vm.openCedars = openCedars;
        vm.allowedModules = {};

        let parameters;
        let navigatorName;
        let isBeforeLogin = true;

        activate();

        ////////////////

        function activate() {

            parameters = NavigatorParameters.getParameters();
            navigatorName = parameters.Navigator;

            /**
             * about.html (Learn About Opal) is called twice: once from init-Screen.html (very first screen) and once from home.html (after logging in)
             * Different modules are enabled depending on whether it is called before or after login
             * the parameter isBeforeLogin determines whether the page is called before login or after
             * if the parameter isBeforeLogin is not passed, default to true
             */
            if (parameters.hasOwnProperty('isBeforeLogin')){
                isBeforeLogin = parameters.isBeforeLogin;
            }

            // set the modules which are allowed to display depending on whether the user has logged in or not
            if (isBeforeLogin){
                vm.allowedModules = UserHospitalPreferences.getAllowedModulesBeforeLogin();
            } else {
                vm.allowedModules = UserHospitalPreferences.getHospitalAllowedModules();
            }

            vm.language = UserPreferences.getLanguage();
        }

        function openUrl(openWhat, openInExternalBrowser = false) {
            let url = '';
            let app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

            switch (openWhat.toLowerCase()) {
                case Params.aboutMuhcCase:
                    url = (vm.language === "EN") ? Params.aboutMuhcUrl.aboutMuhcUrlEn : Params.aboutMuhcUrl.aboutMuhcUrlFr;
                    break;
                case Params.cedarsCancerCenterCase:
                    url = (vm.language === "EN") ? Params.cedarsCancerCenterUrl.cedarsCancerCenterUrlEn : Params.cedarsCancerCenterUrl.cedarsCancerCenterUrlFr;
                    break;
                case Params.cedarsCancerFoundationCase:
                    url = (vm.language === "EN") ? Params.cedarsCancerFoundationUrl.cedarsCancerFoundationUrlEn : Params.cedarsCancerFoundationUrl.cedarsCancerFoundationUrlFr;
                    break;
                case Params.cedarsCancerSupportCase:
                    url = (vm.language === "EN") ? Params.cedarsCanSupportUrl.cedarsCanSupportUrlEn : Params.cedarsCanSupportUrl.cedarsCanSupportUrlFr;
                    break;
                case Params.donationCase:
                    url = (vm.language === "EN") ? Params.donationUrl.donationUrlEn : Params.donationUrl.donationUrlFr;
                    break;
                case Params.opalWebsiteCase:
                    url = (vm.language === "EN") ? Params.opalWebsiteUrl.opalWebsiteUrlEn : Params.opalWebsiteUrl.opalWebsiteUrlFr;
                    break;
                default:
                    break;
            }

            if (!app) {
                window.open(url, '_blank');
            } else if (openInExternalBrowser) {
                cordova.InAppBrowser.open(url, '_system');   // _system: opens in External Browser (Safari, etc...) on the device
            } else {
                cordova.InAppBrowser.open(url, '_blank', 'location=yes');  // Opens inside the app
            }

         }

        /**
         * navigatorName = 'initNavigator' or 'homeNavigator'
         * navigatorName = 'initNavigator' when about.html is called from init-Screen.html (initScreenController)
         * navigatorName = 'homeNavigator' when about.html is called from home.html (homeController)
         *
         * about.html (Learn About Opal) is called twice: once from init-Screen.html (very first screen) and once from home.html (after logging in)
         */
        function openTeam() {
            window[navigatorName].pushPage('views/templates/content.html', {contentType: 'hig'});
        }

        function openAcknowledge() {
            window[navigatorName].pushPage('./views/templates/content.html', {contentType: 'acknowledgements'});
        }

        function openCedars() {
            window[navigatorName].pushPage('views/home/about/cedars.html');
        }
    }
})();

