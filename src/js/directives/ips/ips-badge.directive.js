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
                status: '=?',
                useDynamicColor: '@?',
            },
            template: `<div class="ips-badge" ng-style="badgeStyle">
                           <ng-transclude></ng-transclude>
                       </div>`,

            link: function(scope) {

                scope.useDynamicColor = Boolean(scope.useDynamicColor);

                scope.badgeStyle = {
                    'background-color': badgeColor()
                };

                function badgeColor() {
                    let important = '#dc3545';
                    let normal = '#3584ff';
                    let inactive = '#7a7a7a';

                    if (!scope.useDynamicColor) return normal;

                    if (scope.criticality) {
                        if (scope.criticality === 'high') return important;
                        else return normal;
                    }
                    else if (scope.status) {
                        if (['stopped', 'unknown'].includes(scope.status)) return inactive;
                        else return normal;
                    }
                    else return inactive;
                }
            }
        }
    }
})();
