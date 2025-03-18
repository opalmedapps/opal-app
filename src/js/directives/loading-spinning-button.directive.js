// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive("loadingSpinningButton", loadingSpinningButton);

    loadingSpinningButton.$inject = [];

    /**
     * @name loadingSpinningButton
     * @author Stacey Beard
     * @date 2022-04-08
     * @description Refresh button that spins and is un-clickable while it executes.
     *              Accepts a function (that returns a Promise), which is executed when clicking the button.
     */
    function loadingSpinningButton() {
        let directive = {
            restrict: 'E',
            scope: {
                // Async function called when the button is clicked. While this function runs, the button spins and cannot be re-clicked.
                "clickFunction": "=",

                // Boolean variable that indicates if the button should be disabled (and greyed out)
                "disable": "=?",
            },
            template: `<ons-toolbar-button ng-click="executeClickFunction()" ng-disabled="disable">
                           <ons-icon ng-class="{'glyphicon-refresh-animate': spin}" icon="ion-ios-refresh-empty" size="2x" style="color: #4F81BB"></ons-icon>
                       </ons-toolbar-button>
            `,
            link: scope => {
                scope.executeClickFunction = executeClickFunction;
                scope.spin = false;

                /**
                 * @description Wrapper for the clickFunction that blocks the button and makes it spin while executing.
                 */
                async function executeClickFunction() {
                    // If the button is already active (spinning) or disabled, it cannot be clicked
                    if (scope.spin || scope.disable) return;

                    scope.spin = true;
                    if (scope.clickFunction) await scope.clickFunction();
                    scope.spin = false;
                }
            },
        };
        return directive;
    }
})();
