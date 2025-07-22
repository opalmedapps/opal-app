// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import '../../../css/views/ips.view.css';

import bundle from './sample-bundle.json';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IPSController', IPSController);

    IPSController.$inject = ['$scope', '$timeout', 'IPS', 'Navigator'];

    function IPSController($scope, $timeout, IPS, Navigator) {
        const vm = this;

        let navigator;

        vm.displayContent = {};

        // Used by the share popover
        $scope.popoverSharing = undefined;
        $scope.share = share;

        activate();

        function activate() {
            navigator = Navigator.getNavigator();

            bindEvents();
            IPS.setBundle(bundle);
            vm.displayContent = IPS.getIpsContent();
            console.log('Display', vm.displayContent);
        }

        function bindEvents() {
            // Instantiate the sharing popover
            $timeout(async () => {
                console.log('Create popover');
                $scope.popoverSharing = await ons.createPopover('./views/personal/education/share-popover.html', {parentScope: $scope});
            }, 300);

            // On destroy, clean up
            $scope.$on('$destroy', () => {
                console.log('Destroy popover');
                $scope.popoverSharing.destroy;
            });
        }

        /**
         * @description UI-facing function to share a document using cordova's social sharing plugin.
         *              Shows a warning to the user if the document cannot be shared.
         * @param {string} name - The name of the document to share.
         * @param {string} url - The url to the document, either in base64 format or on the web.
         */
        function share(name, url) {
            // TODO create this view
            console.log('Open ./views/personal/ips/ips-share.html');
            navigator.pushPage('./views/personal/ips/ips-share.html');
        }
    }
})();
