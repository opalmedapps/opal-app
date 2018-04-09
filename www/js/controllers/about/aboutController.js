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

        vm.openDonation = openDonation;
        vm.openAboutMUHC = openAboutMUHC;
        vm.openCedarsCancerCanter = openCedarsCancerCanter;
        vm.openCedarsCancerFoundation = openCedarsCancerFoundation;
        vm.openCedarsCanSupport = openCedarsCanSupport;
        vm.openCedars = openCedars;
        vm.openTeam = openTeam;
        vm.openAcknowledge = openAcknowledge;

        let parameters;
        let navigatorName;

        activate();

        ////////////////

        function activate() {

            parameters = NavigatorParameters.getParameters();
            navigatorName = parameters.Navigator;

            vm.language = UserPreferences.getLanguage();
        }

        /**
         * @ngdoc method
         * @name openDonation
         * @methodOf MUHCApp.controllers.AboutController
         * @description
         * Guides the user to the Cedar's donation page based on the user's language preference
         */
        function openDonation() {
            $window.open('https://www.cedars.ca/cedars/' + vm.language.toLowerCase() + '/donate/donate_online?designation=radiation-oncology-opal-fund', '_system');
        }

        function openAboutMUHC() {
            if (vm.language === "EN") {
                window.open('https://muhc.ca/homepage/page/about-muhc', '_system');
            } else {
                window.open('https://cusm.ca/homepage/page/propos-du-cusm', '_system');
            }
        }

        function openCedarsCancerCanter() {
            if (vm.language === "EN") {
                window.open('https://muhc.ca/glen/cedars-cancer-centre', '_system');
            } else {
                window.open('https://cusm.ca/glen/page/centre-du-cancer-c%C3%A8dres', '_system');
            }
        }

        function openCedarsCancerFoundation() {
            if (vm.language === "EN") {
                window.open('https://www.cedars.ca/cedars/en/home', '_system');
            } else {
                window.open('https://www.cedars.ca/cedars/fr/home', '_system');
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


        function openCedarsCanSupport() {
            if (vm.language === "EN") {
                window.open('http://www.cansupport.ca/', '_system');
            } else {
                window.open('http://www.cansupport.ca/fr', '_system');
            }
        }
    }
})();

