// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .config(SCEConfiguration);

    SCEConfiguration.$inject = ['$sceDelegateProvider'];

    function SCEConfiguration($sceDelegateProvider) {
        // See: https://stackoverflow.com/questions/41642646/angularjs-errors-blocked-loading-resource-from-url-not-allowed-by-scedelegate
        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads
            'self',
            // Allow loading from IPS viewers (iframe)
            'https://viewer.tcpdev.org/**',
            'https://viewer.commonhealth.org/**',
            'https://ipsviewer.com/**',
        ]);
    }
})();
