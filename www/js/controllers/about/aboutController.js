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

    AboutController.$inject = ['$window', 'UserPreferences', 'NavigatorParameters'];

    /* @ngInject */
    function AboutController($window, UserPreferences, NavigatorParameters) {
        const vm = this;

        vm.openUrl = openUrl;
        vm.openTeam = openTeam;
        vm.openAcknowledge = openAcknowledge;
        vm.openCedars = openCedars;

        // vm.openDonation = openDonation;
        // vm.openAboutMUHC = openAboutMUHC;
        // vm.openCedarsCancerCenter = openCedarsCancerCenter;
        // vm.openCedarsCancerFoundation = openCedarsCancerFoundation;
        // vm.openCedarsCanSupport = openCedarsCanSupport;

        let parameters;
        let navigatorName;

        activate();

        ////////////////

        function activate() {

            parameters = NavigatorParameters.getParameters();
            navigatorName = parameters.Navigator;

            vm.language = UserPreferences.getLanguage();
        }

        function openUrl(openWhat, openInExternalBrowser = false) {
            let url = '';
            let app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

            switch (openWhat.toLowerCase()) {
                case 'aboutmuhc':
                    url = (vm.language === "EN") ? 'https://muhc.ca/homepage/page/about-muhc' : 'https://cusm.ca/homepage/page/propos-du-cusm';
                    break;
                case 'cedarscancercenter':
                    url = (vm.language === "EN") ? 'https://muhc.ca/glen/cedars-cancer-centre' : 'https://cusm.ca/glen/page/centre-du-cancer-c%C3%A8dres';
                    break;
                case 'cedarscancerfoundation':
                    url = (vm.language === "EN") ? 'https://www.cedars.ca/cedars/en/home' : 'https://www.cedars.ca/cedars/fr/home';
                    break;
                case 'cedarscansupport':
                    url = (vm.language === "EN") ? 'http://www.cansupport.ca/' : 'http://www.cansupport.ca/fr';
                    break;
                case 'donation':
                    url = (vm.language === "EN") ? 'https://www.cedars.ca/cedars/en/donate/donate_online?designation=radiation-oncology-opal-fund' :
                        'https://www.cedars.ca/cedars/fr/donate/donate_online?designation=radiation-oncology-opal-fund';
                    break;
                case 'opalwebsite':
                    url = (vm.language === "EN") ? 'https://www.opalmedapps.com' : 'https://www.opalmedapps.com/fr-selected';
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


        // function openDonation() {
        //     $window.open('https://www.cedars.ca/cedars/' + vm.language.toLowerCase() + '/donate/donate_online?designation=radiation-oncology-opal-fund', '_self');
        // }
        //
        // function openAboutMUHC() {
        //     if (vm.language === "EN") {
        //         window.open('https://muhc.ca/homepage/page/about-muhc', '_self');
        //     } else {
        //         window.open('https://cusm.ca/homepage/page/propos-du-cusm', '_self');
        //     }
        // }
        //
        // function openCedarsCancerCenter() {
        //     if (vm.language === "EN") {
        //         window.open('https://muhc.ca/glen/cedars-cancer-centre', '_self');
        //     } else {
        //         window.open('https://cusm.ca/glen/page/centre-du-cancer-c%C3%A8dres', '_self');
        //     }
        // }
        //
        // function openCedarsCancerFoundation() {
        //     if (vm.language === "EN") {
        //         window.open('https://www.cedars.ca/cedars/en/home', '_self');
        //     } else {
        //         window.open('https://www.cedars.ca/cedars/fr/home', '_self');
        //     }
        // }
        //
        // function openCedarsCanSupport() {
        //     if (vm.language === "EN") {
        //         window.open('http://www.cansupport.ca/', '_self');
        //     } else {
        //         window.open('http://www.cansupport.ca/fr', '_self');
        //     }
        // }


    }
})();

