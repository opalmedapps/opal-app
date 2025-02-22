// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   aboutController.js
 * Description  :   Manages the about view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   18 Apr 2017
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
        vm.openTechnicalLegal = () => navigator.pushPage('views/init/technical-legal.html');
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
             * about.html (About Opal) is called twice: once from init-Screen.html (very first screen) and once from home.html (after logging in)
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
