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

    IPSController.$inject = ['IPS'];

    function IPSController(IPS) {
        const vm = this;

        vm.displayContent = {}

        activate();

        function activate() {
            IPS.setBundle(bundle);
            vm.displayContent = IPS.getIpsContent();
            console.log('Display', vm.displayContent);
        }
    }
})();
