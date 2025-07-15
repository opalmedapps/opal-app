// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/Patient.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsPatient', IPSPatient);

    IPSPatient.$inject = [];

    function IPSPatient() {
        return {
            restrict: 'E',
            scope: {
                "resource": "=",
            },
            template: `<ips-panel-inner>
                           <ips-panel-outer header-title="{{'IPS_NAME' | translate}}">
                               <ips-name ng-repeat="name in resource.name" resource="name"></ips-name>
                           </ips-panel-outer>
                           <p ng-if="resource.birthDate">{{'IPS_LABEL_BIRTH_DATE' | translate}} {{resource.birthDate | date:'mediumDate'}}</p>
                           <p ng-if="resource.gender">{{'IPS_LABEL_GENDER' | translate}} {{resource.gender}}</p>
                       </ips-panel-inner>`,

            link: function(scope) {
                let resource = scope.resource;
            }
        }
    }
})();
