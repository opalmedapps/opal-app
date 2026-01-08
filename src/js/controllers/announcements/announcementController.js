// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   announcementController.js
 * Description  :   Manages the individual announcement view
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 */

/**
 *  @ngdoc controller
 *  @description
 *
 *  Manages the individual announcement view. No public functions exist on this controller, it simply activate and renders the necessary announcement object
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IndividualAnnouncementController', IndividualAnnouncementController);

    IndividualAnnouncementController.$inject = [
        '$scope',
        'Navigator',
        'Announcements'
    ];

    /* @ngInject */
    function IndividualAnnouncementController(
        $scope,
        Navigator,
        Announcements
    ) {
        var vm = this;
        vm.announcement = '';

        activate();

        ////////////////

        function activate() {
            bindEvents();

            var parameters = Navigator.getParameters();
            vm.announcement = parameters.Post;
        }

        function bindEvents() {
            let navigator = Navigator.getNavigator();

            // Remove event listeners
            $scope.$on('$destroy', () => navigator.off('prepop'));

            // Reload user profile if announcement was opened via Notifications tab,
            // and profile was implicitly changed.
            navigator.on('prepop', () => Navigator.reloadPreviousProfilePrepopHandler('notifications.html'));
        }
    }
})();
