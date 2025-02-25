// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import { marked } from 'marked';

import license from "../../../../LICENSE";

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('LicenseController', licenseController);

    licenseController.$inject = ['$filter', 'UserPreferences'];

    /**
     * @description Parses and displays the content of LICENSE to make it visible in the app.
     * @author Stacey Beard
     */
    function licenseController($filter, UserPreferences) {
        const vm = this;

        const language = UserPreferences.getLanguage();

        const customRenderExtension = {
            renderer: {
                // Parse all indented blocks, which would by default be shown as code
                code(token) {
                    console.log(token);
                    // If the block starts with at least two indentations (8 spaces), it should be centered with line breaks preserved
                    if (token.startsWith('        ')) return `<p style="text-align: center">${token.replaceAll('\n', '<br>')}</p>`;

                    // If the block starts with a URL indicator, display it as a link
                    if (token.match(/^\s*http/)) return `<p><a href="${token}" target="_blank">${token}</a></p>`;

                    // In all other cases, display the block as a blockquote
                    else return `<blockquote>${token}</blockquote>`;
                }
            }
        };

        // Configure marked
        marked.use(customRenderExtension);
        marked.setOptions({ gfm: true });

        // Process the file, interpreting it as markdown, into HTML
        let htmlContent = marked(license);

        // Add a small margin at the top of the license content
        htmlContent = `<div style="margin-top: 10px">${htmlContent}</div>`;

        // If applicable, add a paragraph at the beginning stating that the page has not been translated
        if (language !== 'EN') htmlContent = `<p class="untranslated-disclaimer">${$filter('translate')('UNTRANSLATED_PAGE_DISCLAIMER')}</p>
            <hr>`
            + htmlContent;

        vm.content = htmlContent;
    }
})();
