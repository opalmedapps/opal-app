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
                               <!-- TODO what if it's undefined? -->
                               <ips-badge use-dynamic-color="true" criticality="resource.severity.text">{{ severityBadgeText }}</ips-badge>
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

            }
        }
    }
})();
