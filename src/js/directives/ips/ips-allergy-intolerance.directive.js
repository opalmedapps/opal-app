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
            template: `<ips-panel-inner>
                           <ips-badge ng-if="statusBadgeText">{{statusBadgeText}}</ips-badge>
                           <ips-badge use-dynamic-color="true" criticality="resource.criticality">{{criticalityBadgeText}}</ips-badge>

                           <div ng-if="resource.code">
                               <div ng-if="resource.code.coding">
                                   <ips-badge>{{codingBadgeText}}</ips-badge>

                                   <p ng-if="resource.code.coding[0].display">
                                       {{resource.code.coding[0].display}}
                                   </p>
                               </div>
                               <p ng-if="resource.code.text">{{resource.code.text}}</p>
                               <p ng-if="resource.onsetDateTime">{{"IPS_LABEL_SINCE"|translate}} {{resource.onsetDateTime}}</p>
                           </div>
                       </ips-panel-inner>`,

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
