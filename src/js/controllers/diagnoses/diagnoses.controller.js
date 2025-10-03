// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from "react-dom/client";
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
    scale: 1.6,
});

import DiagnosesComponent from "../../react/Diagnoses.js";

(function () {
    angular
        .module('OpalApp')
        .controller('DiagnosesController', DiagnosesController);

    /* @ngInject */
    DiagnosesController.$inject = ['Diagnoses'];

    function DiagnosesController(Diagnoses) {

        activate();

        ////////////////

        function activate() {
            const rootElement = document.getElementById('diagnoses-root');
            const root = createRoot(rootElement);
            root.render(
                <StrictMode>
                    <MantineProvider theme={theme}>
                        <DiagnosesComponent diagnoses={Diagnoses.getDiagnoses()} />
                    </MantineProvider>
                </StrictMode>
            );
        }
    }
})();
