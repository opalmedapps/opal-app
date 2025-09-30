// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import ipsViewerUrl from '../constants/ips-viewer.constants.js';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .config(SCEConfiguration);

    SCEConfiguration.$inject = ['$sceDelegateProvider'];

    /**
     * @description Configures the application's trusted URLS via https://docs.angularjs.org/api/ng/provider/$sceDelegateProvider
     */
    function SCEConfiguration($sceDelegateProvider) {
        // See: https://stackoverflow.com/questions/41642646/angularjs-errors-blocked-loading-resource-from-url-not-allowed-by-scedelegate
        $sceDelegateProvider.trustedResourceUrlList([
            // Allow same origin resource loads
            'self',
        ].concat(
            // Allow loading from the IPS viewer (iframe)
            ipsViewerUrl + '**'
        ));
    }
})();
