// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import { marked } from 'marked';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('ReleaseNotesController', releaseNotesController);

    releaseNotesController.$inject = ['$filter', 'DynamicContent'];

    /**
     * @description Parses and displays the app's release notes to make them available to users.
     * @author Stacey Beard
     */
    function releaseNotesController($filter, DynamicContent) {

        const vm = this;

        activate();

        /////////////////////////

        async function activate() {
            let releaseNotes;
            vm.loading = true;

            try {
                releaseNotes = await downloadReleaseNotes();

                // Process the file into HTML
                vm.content = marked(releaseNotes);
            }
            catch(error) {
                console.error(error);
                vm.error = true;
            }
            finally {
                vm.loading = false;
            }
        }

        async function downloadReleaseNotes() {
            const url = DynamicContent.getURL('releaseNotes');
            let response = await DynamicContent.loadFromURL(url);
            return response.data;
        }
    }
})();
