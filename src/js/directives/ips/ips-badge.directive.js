// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsBadge', IPSBadge);

    IPSBadge.$inject = [];

    function IPSBadge() {
        return {
            restrict: 'E',
            // Used to display the text inside the badge
            transclude: true,
            scope: {
                criticality: '=?',
                useDynamicColor: '@?',
            },
            template: `<div class="ips-badge" ng-style="badgeStyle">
                           <ng-transclude></ng-transclude>
                       </div>`,

            link: function(scope) {

                scope.useDynamicColor = Boolean(scope.useDynamicColor);

                scope.badgeStyle = scope.useDynamicColor ? {
                    'background-color': badgeColor(scope.criticality)
                } : {};

                function badgeColor(criticality) {
                    if (criticality) {
                        if (criticality === 'high') return '#dc3545';
                        else return '#3584ff';
                    }
                    else return '#7a7a7a'
                }
            }
        }
    }
})();
