// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import '../../../css/views/ips.view.css';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IPSController', IPSController);

    IPSController.$inject = ['$scope', '$timeout', 'Navigator', 'Params', 'ProfileSelector', 'RequestToServer'];

    function IPSController($scope, $timeout, Navigator, Params, ProfileSelector, RequestToServer) {
        const vm = this;

        let navigator;

        let testData = [
            {
                viewer: 'https://viewer.tcpdev.org/',
            },
            {
                viewer: 'https://ipsviewer.com/',
            },
        ]

        vm.showFrame = false;

        // TODO test data
        vm.ipsDataIndex = 0;
        vm.ipsDataSelected = undefined;
        vm.ipsLink = () => testData[vm.ipsDataIndex].viewer + '#' + vm.ipsDataSelected;
        vm.switchViewer = switchViewer;

        vm.share = share;

        activate();

        function activate() {
            vm.showFrame = false;

            $timeout(async () => {
                navigator = Navigator.getNavigator();

                const patient_uuid = ProfileSelector.getActiveProfile()?.patient_uuid || 'fc55f9127bb44544854a1bf4ebb41aed';
                const requestParams = Params.API.ROUTES.IPS;
                const formattedParams = {
                    ...requestParams,
                    url: requestParams.url.replace('<PATIENT_UUID>', patient_uuid) + vm.ipsDataIndex,
                };

                try {
                    console.log('Call API with index', vm.ipsDataIndex);
                    let result = await RequestToServer.apiRequest(formattedParams);
                    console.log('Result API', result.data);
                    vm.ipsDataSelected = result.data;
                    console.log(result);
                    console.log('Link', vm.ipsLink());
                    vm.showFrame = true;
                }
                catch (error) {
                    console.error(error);
                }
            });
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
            vm.ipsDataIndex = vm.ipsDataIndex + 1;
            if (vm.ipsDataIndex >= testData.length) vm.ipsDataIndex = 0;
            activate();
        }
    }
})();
