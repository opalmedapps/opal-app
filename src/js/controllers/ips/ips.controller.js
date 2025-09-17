// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import '../../../css/views/ips.view.css';
import ipsViewers from '../../constants/ips-viewers.constants.js';

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
        let viewerIndex = 0;

        vm.alertType = Params.alertTypeDanger;
        vm.loading = false;
        vm.loadingError = false;
        vm.showFrame = false;

        vm.ipsLink = () => ipsViewers[viewerIndex] + '#' + ipsLinkData;
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
                    let result = await RequestToServer.apiRequest(formattedParams);
                    ipsLinkData = result.data;
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

        function share() {
            navigator.pushPage('./views/personal/ips/ips-share.html', {
                ipsLinkData: ipsLinkData,
                ipsLink: vm.ipsLink(),
            });
        }

        function switchViewer() {
            viewerIndex = viewerIndex + 1;
            if (viewerIndex >= ipsViewers.length) viewerIndex = 0;
        }
    }
})();
