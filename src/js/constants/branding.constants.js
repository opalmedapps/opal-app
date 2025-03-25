// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// For more information on this file, see `docs/setup/branding.md`.

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .constant('Branding', {
            // INIT PAGE
            'init-background': {
                id: 'init-background',
                src: 'img/branding/opal/init-background.jpg',
            },
            'init-logo': {
                id: 'init-logo',
                src: 'img/branding/opal/Opal_Name_Logo_Transparent.png',
            },
        });
})();
