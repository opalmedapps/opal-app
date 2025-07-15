// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/Medication.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsMedication', IPSMedication);

    IPSMedication.$inject = [];

    function IPSMedication() {
        return {
            restrict: 'E',
            scope: {
                "resource": "=",
            },
            template: `<div>
                           <p ng-if="resource.code && resource.code.coding">
                               <ips-badge>{{codingBadgeText}}</ips-badge>
                           </p>

                           <p ng-if="resource.code && resource.code.text">
                               {{resource.code.text}}
                           </p>

                           <!-- TODO codingMap -->
                           <p ng-if="resource.code && resource.code.coding" ng-repeat="coding in resource.code.coding track by $index">
                               <div ng-if="coding.display">
                                   {{coding.display}}
                               </div>
                           </p>
                           <!-- TODO {#if resource.ingredient} -->
                       </div>`,

            link: function(scope) {
                console.log('MEDICATION resource:', scope.resource);
                let resource = scope.resource;

                scope.codingBadgeText = `${resource.code.coding?.[0].system} : ${resource.code.coding?.[0].code}`;
            }
        }
    }
})();
