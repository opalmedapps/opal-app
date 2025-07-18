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
                color: '@?',
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
                    const colors = {
                        alert: '#dc3545',
                        normal: '#3584ff',
                        inactive: '#7a7a7a',
                        active: '#4aba5f',
                    };

                    const statuses = {
                        active: [
                            'active',
                        ],
                        alert: [

                        ],
                        inactive: [
                            'ended',
                            'stopped',
                            'completed',
                            'cancelled',
                            'entered-in-error',
                            'unknown',
                        ],
                        normal: [
                            'on-hold',
                            'draft',
                        ],
                    };

                    if (scope.color) return colors[scope.color];
                    if (!scope.useDynamicColor) return colors.normal;

                    // TODO Temp
                    Object.entries(statuses).forEach(([color, statusList]) => {
                        if (statusList.includes(scope.status || scope.criticality)) return colors[color];
                    })

                    if (scope.criticality) {
                        if (scope.criticality === 'high') return colors.alert;
                        else return colors.normal;
                    }
                    else if (scope.status) {
                        if (['stopped', 'unknown'].includes(scope.status)) return colors.inactive;
                        else return colors.normal;
                    }
                    else return colors.inactive;
                }
            }
        }
    }
})();
