// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('LicenseController', licenseController);

    licenseController.$inject = ['DynamicContent'];

    /**
     * @description Names the license that applies to our source code, and provides a link to users.
     * @author Stacey Beard
     */
    function licenseController(DynamicContent) {
        const vm = this;

        vm.licenseLink = DynamicContent.getURL('license');
    }
})();
