// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .filter('brandingSrc', BrandingSrc);

    BrandingSrc.$inject = ['Branding'];

    function BrandingSrc(Branding) {
        return (keyword) => {
            let src = Branding[keyword]?.src;
            if (!src) throw `Branding source not configured for resource '${keyword}'`;
            return src;
        }
    }
})();
