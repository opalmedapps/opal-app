// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import QRCode from 'qrcode';
import ipsViewer from "../../constants/ips-viewer.constants.js";

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IPSPreviewShareController', IPSPreviewShareController);

    IPSPreviewShareController.$inject = ['$timeout', 'Browser', 'Navigator', 'Params', 'ProfileSelector', 'RequestToServer'];

    function IPSPreviewShareController($timeout, Browser, Navigator, Params, ProfileSelector, RequestToServer) {
        const vm = this;

        /**
         * @description SMART Health Link data for the IPS, which usually follows # in the URL when passed to an IPS viewer.
         */
        let ipsLinkData;

        vm.alertType = Params.alertTypeDanger;
        vm.loading = false;
        vm.loadingError = false;
        vm.qrCodeData = '';
        vm.showContent = false;

        vm.ipsLink = () => ipsViewer + '#shlink:/' + ipsLinkData;
        vm.openIpsExternally = () => Browser.openExternal(vm.ipsLink());

        activate();

        async function activate() {
            vm.loading = true;

            $timeout(async () => {
                try {
                    ipsLinkData = await downloadIps();
                    vm.qrCodeData = await QRCode.toDataURL(vm.ipsLink());

                    vm.showContent = true;
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
         * @description Requests the IPS from the backend.
         * @returns {Promise<void>} Resolves with the downloaded IPS data, or rejects with an error.
         */
        async function downloadIps() {
            const patient_uuid = ProfileSelector.getActiveProfile()?.patient_uuid;
            const requestParams = Params.API.ROUTES.IPS;
            const formattedParams = {
                ...requestParams,
                url: requestParams.url.replace('<PATIENT_UUID>', patient_uuid),
            };

            let result = await RequestToServer.apiRequest(formattedParams);
            if (!result?.data?.payload) throw 'IPS request endpoint did not return an SH Link payload at the expected location';
            return result.data.payload;
        }
    }
})();
