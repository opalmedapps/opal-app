// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import '../../css/directives/password-input.directive.css';
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive("passwordInput", PasswordInput);

    /**
     * @name PasswordInput
     * @author David Gagne
     * @date 2022-02-02
     * @desc Directive to wrap password input and handle view password functionality
     */
    function PasswordInput() {
        return {
            restrict: 'E',
            scope: true,
            transclude: true,
            template: `
                <div class="password-input--wraper style-4">
                    <div class="input-slot" ng-transclude></div>
                    <ons-icon class="icon" icon={{iconType}} role="button" ng-click="switchInputType($event)" aria-label="{{'SHOW_PASSWORD' | translate}}"></ons-icon>
                </div>
            `,
            link: function (scope) {
                scope.isVisible = false;
                scope.iconType = 'ion-eye';
                scope.switchInputType = (event) => {
                    scope.isVisible = !scope.isVisible;
                    scope.iconType = scope.isVisible ? 'ion-eye-disabled' : 'ion-eye';
                    event.target.parentNode.querySelector('input').type = scope.isVisible ? 'text' : 'password';
                }
            }
        };
    }
})();
