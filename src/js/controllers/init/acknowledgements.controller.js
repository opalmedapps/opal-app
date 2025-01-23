// See: https://ondrejsevcik.com/blog/building-perfect-markdown-processor-for-my-blog

import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify';
import remarkLinkify from 'remark-linkify-regex';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import thirdPartyLicenses from "../../../../THIRDPARTY.md";

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('AcknowledgementsController', acknowledgementsController);

    acknowledgementsController.$inject = [];

    function acknowledgementsController() {
        let vm = this;

        // Source: https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
        let urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&\/=]*)/;

        activate();

        function activate() {
            // Parse the third party license markdown file to convert it to HTML
            const result = unified()
                // Take markdown as input and turn it into an MD syntax tree
                .use(remarkParse)
                // Turn all license text headings into collapsible sections using <details><summary>
                .use(remarkCollapseAll, {type: 'code', summaryText: 'Show license text'})
                // Parse all links to be clickable
                .use(remarkLinkify(urlRegex))
                // Switch from MD syntax tree to HTML syntax tree (remark -> rehype)
                .use(remarkRehype, {
                    // Necessary to support HTML embeds (see next plugin)
                    allowDangerousHtml: true,
                })
                // Support HTML embedded inside markdown, such as <details><summary>
                .use(rehypeRaw)
                // Convert all links to open in a new tab (or in an external browser on mobile)
                .use(rehypeOpenLinksExternally)
                // Serialize syntax tree to HTML
                .use(rehypeStringify)
                // And finally, process the input
                .processSync(thirdPartyLicenses);

            vm.content = result.value;
        }

        /**
         * @description Remark plugin that scans the syntax tree to wrap all target nodes in a <details><summary> block.
         *              Only operates on first-level nodes in the tree.
         *              Inspired by https://github.com/Rokt33r/remark-collapse
         * @param {object} opts The options passed to the plugin.
         * @param {string} opts.summaryText The text displayed in each new <summary> block.
         * @param {string} opts.type The type of target node to identify.
         *                           All nodes of this type will be wrapped in a <details><summary> block.
         * @returns {function} A remark plugin function.
         */
        function remarkCollapseAll(opts) {
            let nodeType = opts.type;
            let summaryText = opts.summaryText;

            return function (rootNode) {
                let nodeArray = rootNode.children;

                // Iterate through all the nodes
                for (let i = 0; i < nodeArray.length; i++) {
                    let node = nodeArray[i];

                    // If the current node matches the target type, wrap it in a <details> block
                    if (node.type === nodeType) {
                        // Open <details> and add <summary></summary>
                        nodeArray.splice(i, 0, {
                            type: 'html',
                            value: '<details>',
                        });
                        nodeArray.splice(i + 1, 0, {
                            type: 'html',
                            value: '<summary>',
                        });
                        nodeArray.splice(i + 2, 0, {
                            type: 'text',
                            value: summaryText,
                        });
                        nodeArray.splice(i + 3, 0, {
                            type: 'html',
                            value: '</summary>',
                        });
                        // Leave the target node at i + 4
                        // Close the <details> block
                        nodeArray.splice(i + 5, 0, {
                            type: 'html',
                            value: '</details>',
                        });
                        // Resume iterating after these new nodes
                        i = i + 5;
                    }
                }
            }
        }

        /**
         * @description Rehype plugin that recursively scans the syntax tree to modify all <a> tags
         *              to open in a new tab (or in an external browser on mobile).
         * @returns {function} A rehype plugin function.
         */
        function rehypeOpenLinksExternally() {
            function execute(rootNode) {
                if (rootNode.children) rootNode.children.forEach(node => {
                    if (node.type === 'element' && node.tagName === 'a') {
                        node.properties.target = '_blank'; // Open in a new tab
                    }
                    // Recursively execute the replacement on the children nodes
                    execute(node);
                })
            }
            return execute;
        }
    }
})();
