import { marked } from 'marked';

import thirdPartyLicenses from "../../../../THIRDPARTY.md";

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('AcknowledgementsController', acknowledgementsController);

    acknowledgementsController.$inject = [];

    /**
     * @description Parses and displays the content of THIRDPARTY.md to make our list of third-party dependencies visible in the app.
     * @author Anton Gladyr, Stacey Beard
     */
    function acknowledgementsController() {
        const vm = this;
        vm.loading = true;

        const customRenderExtension = {
            renderer: {
                // Turn all license text blocks into collapsible sections using <details><summary>
                code(code) {
                    return `
                        <details>
                          <summary>Show license text</summary>
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
        vm.content = marked(thirdPartyLicenses);
        vm.loading = false;
    }
})();
