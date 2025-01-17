// See: https://ondrejsevcik.com/blog/building-perfect-markdown-processor-for-my-blog

import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import thirdParty from "../../../../THIRDPARTY.md";

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('AcknowledgementsController', acknowledgementsController);

    acknowledgementsController.$inject = [];

    function acknowledgementsController() {
        let vm = this;

        const result = unified()
            // Take Markdown as input and turn it into MD syntax tree
            .use(remarkParse)
            // Turn all license text headings into collapsible sections using <details><summary>
            .use(remarkCollapseAll, {headerName: 'License', level: 3})
            // Switch from MD syntax tree to HTML syntax tree (remark -> rehype)
            .use(remarkRehype, {
                // Necessary to support HTML embeds (see next plugin)
                allowDangerousHtml: true,
            })
            // Support HTML embedded inside markdown, such as <details><summary>
            .use(rehypeRaw)
            // Serialize syntax tree to HTML
            .use(rehypeStringify)
            // And finally, process the input
            .processSync(thirdParty);

        vm.content = result.value;

        // Inspired by https://github.com/Rokt33r/remark-collapse, but converts all target headings to <details> instead of just one
        function remarkCollapseAll(opts) {
            let level = opts.level;
            let headerName = opts.headerName;

            return function (rootNode) {
                let nodeArray = rootNode.children;
                let insertInProgress = false;

                // Iterate through all the nodes
                for (let i = 0; i < nodeArray.length; i++) {
                    let node = nodeArray[i];

                    // If we're currently inserting a <details> block, check if it's time to close it
                    // A <details> block should be closed upon reaching a heading of the same or lower level
                    if (insertInProgress && node.type === 'heading' && node.depth <= level) {
                        // Close the <details> block
                        nodeArray.splice(i, 0, {
                            type: 'html',
                            value: '</details>'
                        });
                        insertInProgress = false;
                        // Resume iterating after this new node
                        i = i + 1;
                    }
                    // Check if it's time to open a <details> block, upon finding a heading of the right level and name
                    else if (node.type === 'heading' && node.depth === level && node.children[0].type === 'text' && node.children[0].value === headerName) {
                        // Open <details> and add <summary></summary>
                        nodeArray.splice(i + 1, 0, {
                            type: 'html',
                            value: '<details>'
                        });
                        nodeArray.splice(i + 2, 0, {
                            type: 'html',
                            value: '<summary>'
                        });
                        nodeArray.splice(i + 3, 0, {
                            type: 'text',
                            value: 'Open details' // TODO
                        });
                        nodeArray.splice(i + 4, 0, {
                            type: 'html',
                            value: '</summary>'
                        });
                        // Resume iterating after these new nodes
                        i = i + 4;
                        // Special case: if the next iteration will reach the end of the list, close the <details> block immediately
                        if (i + 1 >= nodeArray.length) {
                            nodeArray.splice(i, 0, {
                                type: 'html',
                                value: '</details>'
                            });
                        }
                        else insertInProgress = true; // Indicates that the <details> block has not yet been closed
                    }
                }
            }
        }
    }
})();
