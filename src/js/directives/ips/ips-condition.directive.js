// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/Condition.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsCondition', IPSCondition);

    IPSCondition.$inject = ['$filter'];

    function IPSCondition($filter) {
        return {
            restrict: 'E',
            scope: {
                "resource": "=",
            },
            template: `<div class="panel ips-inner-panel">
                           <div class="panel-body">
                               <ips-badge ng-if="statusBadgeText">{{ statusBadgeText }}</ips-badge>
                               <ips-badge use-dynamic-color="true" criticality="resource.severity.text">{{ severityBadgeText }}</ips-badge>
                               
                               <div ng-if="resource.category && resource.category[0]">
                                   <div ng-if="resource.category[0].coding">
                                       <ips-badge>{{ categoryBadgeText }}</ips-badge>

                                       <div ng-if="resource.category[0].coding[0].display" class="ips-text">
                                           {{ resource.category[0].coding[0].display }}
                                       </div>
                                   </div>
                                   <div ng-if="resource.category[0].text" class="ips-text">
                                       <div>{{ resource.category[0].text }}</div>
                                   </div>
                               </div>

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
                               </div>

                               <div ng-if="site" class="ips-text">
                                   {{ 'IPS_LABEL_SITE' | translate }} {{ site }}
                               </div>
                               
                               <div ng-if="resource.onsetDateTime" class="ips-text">
                                   {{ 'IPS_LABEL_SINCE' | translate }} {{ resource.onsetDateTime }}
                               </div>
                               
                               <div ng-if="resource.recordedDate" class="ips-text">
                                   {{ 'IPS_LABEL_RECORDED' | translate }} {{ resource.recordedDate }}
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
                scope.severityBadgeText = `${$filter('translate')('IPS_LABEL_SEVERITY')} ${resource.severity?.text ?? 'unknown'}`;
                scope.categoryBadgeText = `${resource.category?.[0].coding?.[0].system} : ${resource.category?.[0].coding?.[0].code}`;
                scope.codingBadgeText = `${resource.code.coding?.[0].system} : ${resource.code.coding?.[0].code}`;

                scope.site = resource.bodySite?.[0]?.coding?.[0]?.display;
            }
        }
    }
})();
