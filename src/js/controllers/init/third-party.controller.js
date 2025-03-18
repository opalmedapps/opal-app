// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import { marked } from 'marked';

import thirdPartyLicenses from "../../../../THIRDPARTY.md";

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('ThirdPartyController', thirdPartyController);

    thirdPartyController.$inject = ['$filter', 'UserPreferences'];

    /**
     * @description Parses and displays the content of THIRDPARTY.md to make our list of third-party dependencies visible in the app.
     * @author Anton Gladyr, Stacey Beard
     */
    function thirdPartyController($filter, UserPreferences) {
        const vm = this;

        const language = UserPreferences.getLanguage();

        vm.loading = true;

        const customRenderExtension = {
            renderer: {
                // Turn all license text blocks into collapsible sections using <details><summary>
                code(code) {
                    return `
                        <details>
                          <summary>${$filter('translate')('SHOW_LICENSE_TEXT')}</summary>
                          <pre><code>${code}</code></pre>
                        </details>
                    `;
                },
                // Convert all links to open in a new tab (or in an external browser on mobile) using a _blank target
                link(href, title, text) {
                    const titleAttr = title ? ` title="${title}"` : '';
                    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener">${text}</a>`;
                }
            }
        };

        marked.use(customRenderExtension);
        // Configure Marked (GFM for auto-linkifying bare URLs)
        marked.setOptions({ gfm: true });

        // Process the Markdown file into HTML
        let htmlContent = marked(thirdPartyLicenses);

        // If applicable, add a paragraph at the beginning stating that the page has not been translated
        if (language !== 'EN') htmlContent = `<p class="third-party-pre">${$filter('translate')('UNTRANSLATED_PAGE_DISCLAIMER')}</p>
            <hr>`
            + htmlContent;

        vm.content = htmlContent;
        vm.loading = false;
    }
})();
