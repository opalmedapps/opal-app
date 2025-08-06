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

        let ipsLinkData = undefined;
        let navigator;
        let viewers = [
            'https://viewer.tcpdev.org/',
            'https://ipsviewer.com/',
        ]
        let viewerIndex = 0;

        vm.alertType = Params.alertTypeDanger;
        vm.loading = false;
        vm.loadingError = false;
        vm.showFrame = false;

        vm.ipsLink = () => viewers[viewerIndex] + '#' + ipsLinkData;
        vm.share = share;
        vm.switchViewer = switchViewer;

        activate();

        function activate() {
            vm.loading = true;
            vm.showFrame = false;

            $timeout(async () => {
                navigator = Navigator.getNavigator();

                const patient_uuid = ProfileSelector.getActiveProfile()?.patient_uuid;
                const requestParams = Params.API.ROUTES.IPS;
                const formattedParams = {
                    ...requestParams,
                    url: requestParams.url.replace('<PATIENT_UUID>', patient_uuid),
                };

                try {
                    // TODO handle 404
                    let result = await RequestToServer.apiRequest(formattedParams);
                    ipsLinkData = result.data;
                    console.log('Link', vm.ipsLink(), result);
                    vm.showFrame = true;
                }
                catch (error) {
                    console.error(error);
                    vm.loadingError = true;
                }
                finally {
                    vm.loading = false;
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
                ipsLinkData: ipsLinkData,
                ipsLink: vm.ipsLink(),
            });
        }

        function switchViewer() {
            viewerIndex = viewerIndex + 1;
            if (viewerIndex >= viewers.length) viewerIndex = 0;
        }
    }
})();
