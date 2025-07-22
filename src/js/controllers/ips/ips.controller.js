// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import '../../../css/views/ips.view.css';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IPSController', IPSController);

    IPSController.$inject = ['$scope', '$timeout', 'IPS', 'Navigator'];

    function IPSController($scope, $timeout, IPS, Navigator) {
        const vm = this;

        let navigator;

        vm.ipsLink = 'https://viewer.tcpdev.org/#shlink:/eyJ1cmwiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc2Vhbm5vL3NoYy1kZW1vLWRhdGEvbWFpbi9pcHMvSVBTX0lHLWJ1bmRsZS0wMS1lbmMudHh0IiwiZmxhZyI6IkxVIiwia2V5IjoicnhUZ1lsT2FLSlBGdGNFZDBxY2NlTjh3RVU0cDk0U3FBd0lXUWU2dVg3USIsImxhYmVsIjoiRGVtbyBTSEwgZm9yIElQU19JRy1idW5kbGUtMDEifQ';

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
            navigator.pushPage('./views/personal/ips/ips-share.html');
        }
    }
})();
