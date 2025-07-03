// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsAllergyIntolerance', IPSAllergyIntolerance);

    IPSAllergyIntolerance.$inject = [];

    function IPSAllergyIntolerance() {
        return {
            restrict: 'E',
            scope: {
                // "value": "=",
            },
            template: `<div class="panel ips-inner-panel">
                           <div class="panel-body">
                               <div ng-if="statusBadgeText" class="ips-badge">{{ statusBadgeText }}</div>
                               <div class="ips-badge" ng-style="criticalityBadgeStyle">{{ criticalityBadgeText }}</div>
                               
                               <div ng-if="resource.code">
                                   <div ng-if="resource.code.coding">
                                       <div class="ips-badge">{{ codingBadgeText }}</div>

                                       <div ng-if="resource.code.coding[0].display" class="ips-text">
                                           {{ resource.code.coding[0].display }}
                                       </div>
                                   </div>
                                   <div ng-if="resource.code.text" class="ips-text">
                                       <div>{{ resource.code.text }}</div>
                                   </div>
                               </div>
                           </div>
                       </div>`,

            link: function(scope) {
                // TODO fetch data
                const resource = {};
                scope.resource = resource;

                // Set display variables
                scope.statusBadgeText = (resource.clinicalStatus?.coding?.[0].code ?? '')
                                      + (resource.clinicalStatus && resource.verificationStatus ? ' / ' : '')
                                      + (resource.verificationStatus?.coding?.[0].code ?? '');

                scope.criticalityBadgeText = `${resource.type ? `${resource.type} - ` : ''}criticality: ${resource.criticality ?? 'unknown'}`;
                scope.criticalityBadgeStyle = {
                    'background-color': badgeColor(resource.criticality)
                };

                scope.codingBadgeText = `${resource.code.coding[0].system} : ${resource.code.coding[0].code}`;

                function badgeColor(criticality) {
                    if (criticality) {
                        if (criticality === 'high') return '#dc3545';
                        else return '#3584ff';
                    }
                    else return '#7a7a7a';
                }
            }
        }
    }
})();
