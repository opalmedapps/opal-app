// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/AllergyIntolerance.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsAllergyIntolerance', IPSAllergyIntolerance);

    IPSAllergyIntolerance.$inject = ['$filter'];

    function IPSAllergyIntolerance($filter) {
        return {
            restrict: 'E',
            scope: {
                "resource": "=",
            },
            template: `<div class="panel ips-inner-panel">
                           <div class="panel-body">
                               <ips-badge ng-if="statusBadgeText">{{ statusBadgeText }}</ips-badge>
                               <ips-badge use-dynamic-color="true" criticality="resource.criticality">{{ criticalityBadgeText }}</ips-badge>

                               <div ng-if="resource.code">
                                   <div ng-if="resource.code.coding">
                                       <ips-badge>{{ codingBadgeText }}</ips-badge>

                                       <div ng-if="resource.code.coding[0].display" class="ips-text">
                                           {{ resource.code.coding[0].display }}
                                       </div>
                                   </div>
                                   <div ng-if="resource.code.text" class="ips-text">
                                       <div>{{ resource.code.text }}</div>
                                   </div>
                                   <div ng-if="resource.onsetDateTime" class="ips-text">{{ "IPS_LABEL_SINCE"|translate }} {{ resource.onsetDateTime }}</div>
                               </div>
                           </div>
                       </div>`,

            link: function(scope) {
                let resource = scope.resource;

                // Set display variables
                scope.statusBadgeText = (resource.clinicalStatus?.coding?.[0].code ?? '')
                                      + (resource.clinicalStatus && resource.verificationStatus ? ' / ' : '')
                                      + (resource.verificationStatus?.coding?.[0].code ?? '');

                // TODO 'unknown'
                scope.criticalityBadgeText = `${resource.type ? `${resource.type} - ` : ''}${$filter('translate')('IPS_LABEL_CRITICALITY')} ${resource.criticality ?? 'unknown'}`;

                scope.codingBadgeText = `${resource.code.coding[0].system} : ${resource.code.coding[0].code}`;
            }
        }
    }
})();
