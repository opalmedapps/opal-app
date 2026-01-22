// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Created by PhpStorm.
 * User: rob
 * Date: 2017-09-20
 * Time: 3:26 PM
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IndividualTxTeamMessageController', IndividualTxTeamMessageController);

    IndividualTxTeamMessageController.$inject = ['$scope', '$timeout', 'Navigator', 'ProfileSelector'];

    /* @ngInject */
    function IndividualTxTeamMessageController($scope, $timeout, Navigator, ProfileSelector) {
        let vm = this;
        let navigator;

        activate();

        ////////////////////

        function activate(){
            navigator = Navigator.getNavigator();
            let parameters = Navigator.getParameters();

            bindEvents();

            $timeout(function(){
                vm.message = parameters.Post;
                vm.FirstName = ProfileSelector.getFirstName();
            });
        }

        function bindEvents() {
            // Remove event listeners
            $scope.$on('$destroy', () => navigator.off('prepop'));

            // Reload user profile if treating team message was opened via Notifications page,
            // and profile was implicitly changed.
            navigator.on('prepop', () => Navigator.reloadPreviousProfilePrepopHandler('notifications.html'));
        }
    }
})();
