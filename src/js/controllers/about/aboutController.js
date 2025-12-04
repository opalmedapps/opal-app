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
        vm.openTechnicalLegal = () => navigator.pushPage('views/init/technical-legal.html');
        vm.openTour = () => navigator.pushPage('views/home/tour/tour.html');

        let parameters;

        activate();

        ////////////////

        function activate() {
            parameters = Navigator.getParameters();
            navigator = Navigator.getNavigator();

            vm.language = UserPreferences.getLanguage();
        }

        function openUrl(contentKey, openInExternalBrowser = false) {
            const url = DynamicContent.getURL(contentKey);
            openInExternalBrowser ? Browser.openExternal(url) : Browser.openInternal(url);
        }
    }
})();
