// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/MedicationStatement.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsMedicationStatement', IPSMedicationStatement);

    IPSMedicationStatement.$inject = ['IPS'];

    function IPSMedicationStatement(IPS) {
        return {
            restrict: 'E',
            scope: {
                "resource": "=",
            },
            template: `<div class="panel ips-inner-panel">
                           <div class="panel-body">
                               <ips-badge ng-if="resource.status" use-dynamic-color="true" status="resource.status">{{ resource.status }}</ips-badge>
<!--                                   {#if resource.medicationCodeableConcept}-->
<!--                                     {#if resource.medicationCodeableConcept.coding}  -->
<!--                                       <Badge color="primary">{resource.medicationCodeableConcept.coding[0].system} : {resource.medicationCodeableConcept?.coding[0].code}</Badge>-->
<!--                                       <br>-->
<!--                                       {#if resource.medicationCodeableConcept.coding[0].display}-->
<!--                                         <strong>{resource.medicationCodeableConcept.coding[0].display}</strong><br>-->
<!--                                       {:else if resource.medicationCodeableConcept.text}-->
<!--                                         <strong>{resource.medicationCodeableConcept.text}</strong><br>-->
<!--                                       {/if}-->
<!--                                     {:else if resource.medicationCodeableConcept.text}-->
<!--                                       {#if resource.status}-->
<!--                                         <br>-->
<!--                                       {/if}-->
<!--                                       <strong>{resource.medicationCodeableConcept.text}</strong><br>-->
<!--                                     {/if}-->
<!--                                   {/if}-->

                               <div ng-if="medication">
                                   <ips-medication resource="medication"></ips-medication>
                               </div>
                               <div ng-if="resource.medicationReference && resource.medicationReference.display" class="ips-text">
                                   {{ resource.medicationReference?.display }}
                               </div>

                               <div ng-if="resource.reasonReference && resource.reasonReference[0].display" class="ips-text">
                                   {{ resource.reasonReference[0].display }}
                               </div>

                               <ips-dosage ng-if="resource.dosage" resource="resource.dosage[0]"></ips-dosage>

                               <div ng-if="resource.effectivePeriod" class="ips-text">
                                   {{ "IPS_LABEL_EFFECTIVE" | translate }} {{ resource.effectivePeriod.start || '??'}} – {{ resource.effectivePeriod.end || '??'}}
                               </div>
                               <div ng-if="resource.effectiveDateTime">
                                   {{ "IPS_LABEL_DATE" | translate }} {{ resource.effectiveDateTime }}
                               </div>
                           </div>
                       </div>`,

            link: function(scope) {
                console.log('MEDICATION STATEMENT resource:', scope.resource);
                let resource = scope.resource;

                if (resource.medicationReference) {
                    if (resource.contained?.[0]?.resourceType === 'Medication') {
                        // If the medication is contained in the resource
                        scope.medication = resource.contained[0];
                    } else if (resource.medicationReference?.reference) {
                        // If the medication is referenced
                        scope.medication = IPS.getEntry(resource.medicationReference.reference);
                    }
                }
                console.log('Found medication', scope.medication);

                scope.codingBadgeText = `${resource.code?.coding?.[0].system} : ${resource.code?.coding?.[0].code}`;
            }
        }
    }
})();
