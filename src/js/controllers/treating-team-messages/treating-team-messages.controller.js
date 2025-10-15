// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, MantineProvider } from '@mantine/core';

// TODO make reusable
const theme = createTheme({
    scale: 1.6,
});

import TreatingTeamMessagesComponent from '../../react/TreatingTeamMessages.js';

(function () {
    angular
        .module('OpalApp')
        .controller('TreatingTeamMessagesController', TreatingTeamMessagesController);

    /* @ngInject */
    TreatingTeamMessagesController.$inject = ['TxTeamMessages', 'UpdateUI'];

    function TreatingTeamMessagesController(TxTeamMessages, UpdateUI) {

        activate();

        ////////////////

        function activate() {
            const rootElement = document.getElementById('treating-team-messages-root');
            const root = createRoot(rootElement);
            root.render(
                <StrictMode>
                    <MantineProvider theme={theme}>
                        <TreatingTeamMessagesComponent treatingTeamMessagesService={TxTeamMessages} updateUIService={UpdateUI} />
                    </MantineProvider>
                </StrictMode>
            );
        }
    }
})();
