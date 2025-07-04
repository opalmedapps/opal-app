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
            template: `<div class="panel ips-inner-panel">
                           <div class="panel-body">
                               <div class="ips-text" ng-if="patientName">{{patientName}}</div>
                               <div class="ips-text" ng-if="resource.birthDate">{{'IPS_LABEL_BIRTH_DATE' | translate}} {{resource.birthDate | date:'mediumDate'}}</div>
                               <div class="ips-text" ng-if="resource.gender">{{'IPS_LABEL_GENDER' | translate}} {{resource.gender}}</div>
                           </div>
                       </div>`,

            link: function(scope) {
                let resource = scope.resource;

                // Set display variables
                let name = resource.name[0] ?? resource.name;
                let nameList = [].concat(name.prefix).concat(name.given).concat(name.family).filter(word => !!word)
                scope.patientName = nameList.join(' ');
            }
        }
    }
})();
