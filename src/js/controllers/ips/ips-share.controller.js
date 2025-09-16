// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import QRCode from 'qrcode';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IPSShareController', IPSShareController);

    IPSShareController.$inject = ['Browser', 'Navigator'];

    function IPSShareController(Browser, Navigator) {
        const vm = this;

        vm.ipsLinkData = '';
        vm.ipsLink = '';
        vm.qrCodeData = '';

        vm.openIpsLink = openIpsLink;

        activate();

        async function activate() {
            let parameters = Navigator.getParameters();
            vm.ipsLinkData = parameters.ipsLinkData;
            vm.ipsLink = parameters.ipsLink;

            try {
                vm.qrCodeData = await QRCode.toDataURL(vm.ipsLink);
            }
            catch (err) {
                console.error(err);
            }
        }

        /**
         * @description Opens the IPS outside of the app in an external viewer.
         */
        function openIpsLink() {
            Browser.openExternal(vm.ipsLink);
        }
    }
})();
