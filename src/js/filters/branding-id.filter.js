// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .filter('brandingId', BrandingId);

    BrandingId.$inject = ['Branding'];

    function BrandingId(Branding) {
        return (keyword) => {
            let id = Branding[keyword]?.id;
            if (!id) throw `Branding id not configured for resource '${keyword}'`;
            return id;
        }
    }
})();
