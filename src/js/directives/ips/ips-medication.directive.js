// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/Medication.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsMedication', IPSMedication);

    IPSMedication.$inject = ['$filter'];

    function IPSMedication($filter) {
        return {
            restrict: 'E',
            scope: {
                "resource": "=",
            },
            template: `<div class="panel ips-inner-panel">
                           <div class="panel-body">
                               <div ng-if="resource.code && resource.code.coding">
                                   <ips-badge ng-if="statusBadgeText">{{ codingBadgeText }}</ips-badge>
                               </div>
                           </div>
                       </div>`,

            link: function(scope) {
                console.log('MEDICATION resource:', scope.resource);
                let resource = scope.resource;

                scope.codingBadgeText = `${resource.code?.coding?.[0].system} : ${resource.code?.coding?.[0].code}`;
            }
        }
    }
})();
