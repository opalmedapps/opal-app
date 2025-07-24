// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import '../../../css/views/ips.view.css';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IPSController', IPSController);

    IPSController.$inject = ['$scope', '$timeout', 'Navigator'];

    function IPSController($scope, $timeout, Navigator) {
        const vm = this;

        let navigator;

        // TODO test data
        vm.ipsData1 = '#shlink:/eyJ1cmwiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc2Vhbm5vL3NoYy1kZW1vLWRhdGEvbWFpbi9pcHMvSVBTX0lHLWJ1bmRsZS0wMS1lbmMudHh0IiwiZmxhZyI6IkxVIiwia2V5IjoicnhUZ1lsT2FLSlBGdGNFZDBxY2NlTjh3RVU0cDk0U3FBd0lXUWU2dVg3USIsImxhYmVsIjoiRGVtbyBTSEwgZm9yIElQU19JRy1idW5kbGUtMDEifQ';
        vm.ipsData2 = '#shlink:/eyJ1cmwiOiJodHRwczovL3NtYXJ0LWhlYWx0aC1saW5rcy1zZXJ2ZXIuY2lyZy53YXNoaW5ndG9uLmVkdS9hcGkvc2hsL2FZY2JqLW9wNDJldDNzTXVwSUdyY1dvQ3JJWklqeTlleHUwWm8wUnlnSW8iLCJmbGFnIjoiIiwia2V5IjoibndJRTRYMGxjYU1ubzl6UHdhRHJ1djVkUDlURDZFN2JIcmF1OXI5S2xEUSIsImxhYmVsIjoiU0hMIGZyb20gMjAyMy0wOS0xMCBlUGF0aWVudERhdmUgIzJiIn0';
        vm.ipsDataSelected = vm.ipsData1;
        vm.ipsLink = () => vm.ipsViewerSelected + vm.ipsDataSelected;
        vm.ipsViewer1 = 'https://viewer.tcpdev.org/';
        vm.ipsViewer2 = 'https://ipsviewer.com/';
        vm.ipsViewerSelected = vm.ipsViewer1;
        vm.switchViewer = switchViewer;

        vm.share = share;

        activate();

        function activate() {
            navigator = Navigator.getNavigator();
        }

        /**
         * @description UI-facing function to share a document using cordova's social sharing plugin.
         *              Shows a warning to the user if the document cannot be shared.
         * @param {string} name - The name of the document to share.
         * @param {string} url - The url to the document, either in base64 format or on the web.
         */
        function share(name, url) {
            navigator.pushPage('./views/personal/ips/ips-share.html', {
                ipsData: vm.ipsDataSelected,
                ipsLink: vm.ipsLink(),
            });
        }

        function switchViewer() {
            vm.ipsViewerSelected = vm.ipsViewerSelected === vm.ipsViewer1 ? vm.ipsViewer2 : vm.ipsViewer1;
            vm.ipsDataSelected = vm.ipsDataSelected === vm.ipsData1 ? vm.ipsData2 : vm.ipsData1;
        }
    }
})();
