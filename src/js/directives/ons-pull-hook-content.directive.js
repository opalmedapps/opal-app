// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive("onsPullHookContent", onsPullHookContent);

    onsPullHookContent.$inject = [];

    /**
     * @name onsPullHookContent
     * @author Stacey Beard
     * @date 2021-11-05
     * @description Fills out the contents of an ons-pull-hook (the icons shown at each stage of the refresh process).
     *              This directive should be used as the direct child of an <ons-pull-hook>.
     *              Note: <ons-pull-hook> itself cannot be added to this directive, as it must be the direct child
     *                    of the page to work (not the child of a directive).
     */
    function onsPullHookContent() {
        let directive = {
            restrict: 'E',
            scope: { },
            template: `<!-- The following content is only visible if this directive is wrapped in an ons-pull-hook -->
                       <span ng-if="loaderState() === 'initial'">
                           <ons-icon style="color: grey" size="25px" icon="fa-spinner"></ons-icon>
                       </span>
                       <span ng-if="loaderState() === 'preaction'">
                           <ons-icon style="color: #2196F3" size="25px" icon="fa-spinner"></ons-icon>
                       </span>
                       <span ng-if="loaderState() === 'action'">
                           <ons-icon style="color: #2196F3" size="25px" icon="fa-spinner" spin="true"></ons-icon>
                       </span>
            `,
            link: (scope, element) => {
                scope.loaderState = loaderState;

                /**
                 * @description Gets and returns the state of the ons-pull-hook that is a direct parent of
                 *              this directive, if it exists.
                 * @returns {string} The state of the ons-pull-hook (e.g. initial, preaction, action),
                 *                   or null if a parent ons-pull-hook is not found.
                 */
                function loaderState() {
                    return element[0].parentElement.getAttribute("state");
                }
            },
        };
        return directive;
    }
})();
