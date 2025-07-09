// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/Dosage.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsDosage', IPSDosage);

    IPSDosage.$inject = [];

    function IPSDosage() {
        return {
            restrict: 'E',
            scope: {
                "resource": "=",
            },
            template: `<div>
                           <div ng-if="resource.text" class="ips-text">
                               {{ "IPS_LABEL_DOSAGE" | translate }} {{ resource.text }}
                           </div>
                           <div ng-if="dosage.asNeededBoolean" class="ips-text">
                               {{ "IPS_LABEL_DOSAGE" | translate }} {{ "IPS_AS_NEEDED" | translate }}
                           </div>
                           <div ng-if="!resource.text && !dosage.asNeededBoolean" class="ips-text">
                               {{ "IPS_LABEL_DOSAGE" | translate }} {{ "IPS_DOSAGE_NONE" | translate }}
                           </div>

                           <!--TODO finish dynamic display-->
                           <div ng-if="(resource.route && resource.route.coding) || resource.doseAndRate || (resource.timing && resource.timing.repeat)"
                                class="ips-table">
                               <table>
                                   <tr>
                                       <th colspan="5">Dosage</th>
                                   </tr>
                                   <tr>
                                       <th>Route</th>
                                       <th>Qty</th>
                                       <th>Unit</th>
                                       <th>Freq. Qty</th>
                                       <th>Freq. Period</th>
                                   </tr>
                                   <tr>
                                       <td>-</td>
                                       <td>-</td>
                                       <td>-</td>
                                       <td>-</td>
                                       <td>-</td>
                                   </tr>
                               </table>
                           </div>
                       </div>`,

            link: function(scope) {
                console.log('MEDICATION STATEMENT resource:', scope.resource);
                let resource = scope.resource;

            }
        }
    }
})();
