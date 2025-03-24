/*
 * Filename     :   aboutController.js
 * Description  :   Manages the about view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   18 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */


/**
 *  @ngdoc controller
 *  @description
 *
 *  Manages the about view.
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('AboutController', AboutController);

    AboutController.$inject = ['UserPreferences', 'Navigator', 'Params', 'UserHospitalPreferences',
        'Browser', 'DynamicContent'];

    /* @ngInject */
    function AboutController(UserPreferences, Navigator, Params, UserHospitalPreferences, Browser,
                             DynamicContent) {
        const vm = this;
        var navigator = null;

        vm.openUrl = openUrl;
        vm.openTeam = openTeam;
        vm.openTour = openTour;
        vm.allowedModules = {};

        let parameters;
        let isBeforeLogin = true;

        activate();

        ////////////////

        function activate() {

            parameters = Navigator.getParameters();
            navigator = Navigator.getNavigator();

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

        function openUrl(contentKey, openInExternalBrowser = false) {
            const url = DynamicContent.getURL(contentKey);
            openInExternalBrowser ? Browser.openExternal(url) : Browser.openInternal(url);
        }

        /**
         * about.html (Learn About Opal) is called twice: once from init-Screen.html (very first screen) and once from home.html (after logging in)
         */
        function openTour() {
            navigator.pushPage('views/home/tour/tour.html');
        }

        function openTeam() {
            navigator.pushPage(
                './views/templates/content.html',
                {contentType: 'about', title: 'ABOUT_APP'},
            );
        }
    }
})();
