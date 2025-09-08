// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '../../react/App.js';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('ReactTutorialController', ReactTutorialController);

    ReactTutorialController.$inject = [];

    /* @ngInject */
    function ReactTutorialController() {
        let vm = this;

        activate();

        ////////////////

        function activate() {
            const rootElement = document.getElementById('tutorial-root');
            const root = createRoot(rootElement);
            root.render(
                <StrictMode>
                    <App />
                </StrictMode>
            );
        }
    }
})();
