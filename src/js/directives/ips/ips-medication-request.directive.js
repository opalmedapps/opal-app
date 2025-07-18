// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/MedicationRequest.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsMedicationRequest', IPSMedicationRequest);

    IPSMedicationRequest.$inject = ['IPS'];

    function IPSMedicationRequest(IPS) {
        return {
            restrict: 'E',
            scope: {
                "resource": "=",
            },
            template: `<ips-panel-inner>
                           <ips-badge ng-if="resource.intent" color="inactive">{{resource.intent}}</ips-badge>
                           <!-- See: https://build.fhir.org/medicationrequest-definitions.html#MedicationRequest.status -->
                           <ips-badge ng-if="resource.status" use-dynamic-color="true" status="resource.status">{{resource.status}}</ips-badge>

                           <!-- TODO duplicate -->
                           <p ng-if="resource.medicationCodeableConcept">
                               <!-- TODO coding -->
                               <div ng-if="resource.medicationCodeableConcept.coding">TODO coding</div>
                               <div ng-if="resource.medicationCodeableConcept.text">
                                   <div>{{resource.medicationCodeableConcept.text}}</div>
                               </div>
                           </p>

                           <p ng-if="medication">
                               <ips-medication resource="medication"></ips-medication>
                           </p>
                           <p ng-if="resource.medicationReference && resource.medicationReference.display">
                               {{resource.medicationReference?.display}}
                           </p>

                           <p ng-if="resource.validityPeriod">
                               {{"IPS_LABEL_VALID" | translate}} {{resource.validityPeriod.start || '??'}} – {{resource.validityPeriod.end || '??'}}
                           </p>
                           <p ng-if="resource.authoredOn">
                               {{"IPS_LABEL_AUTHORED" | translate}} {{resource.authoredOn.split('T')[0]}}
                           </p>

                           <ips-dosage ng-if="resource.dosageInstruction" resource="resource.dosageInstruction[0]"></ips-dosage>
                       </ips-panel-inner>`,

            link: function(scope) {
                console.log('MEDICATION REQUEST resource:', scope.resource);
                let resource = scope.resource;

                scope.medication = IPS.getMedication(resource);

                scope.codingBadgeText = `${resource.code?.coding?.[0].system} : ${resource.code?.coding?.[0].code}`;
            }
        }
    }
})();
