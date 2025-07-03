// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/AllergyIntolerance.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsAllergyIntolerance', IPSAllergyIntolerance);

    IPSAllergyIntolerance.$inject = [];

    function IPSAllergyIntolerance() {
        return {
            restrict: 'E',
            scope: {
                // "value": "=",
            },
            template: `<div class="panel ips-inner-panel">
                           <div class="panel-body">
                               <div ng-if="statusBadgeText" class="ips-badge">{{ statusBadgeText }}</div>
                               <div class="ips-badge" ng-style="criticalityBadgeStyle">{{ criticalityBadgeText }}</div>
                               
                               <div ng-if="resource.code">
                                   <div ng-if="resource.code.coding">
                                       <div class="ips-badge">{{ codingBadgeText }}</div>

                                       <div ng-if="resource.code.coding[0].display" class="ips-text">
                                           {{ resource.code.coding[0].display }}
                                       </div>
                                   </div>
                                   <div ng-if="resource.code.text" class="ips-text">
                                       <div>{{ resource.code.text }}</div>
                                   </div>
                               </div>
                           </div>
                       </div>`,

            link: function(scope) {
                // TODO fetch data
                const resource = {
                    "resourceType": "AllergyIntolerance",
                    "id": "72884cad-ebe6-4f43-a51a-2f978275f132",
                    "text": {
                        "status": "generated",
                        "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><p><b>identifier</b>: id: 3a462598-009c-484a-965c-d6b24a821424</p><p><b>clinicalStatus</b>: <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical active}\">Active</span></p><p><b>verificationStatus</b>: <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/allergyintolerance-verification confirmed}\">Confirmed</span></p><p><b>type</b>: allergy</p><p><b>category</b>: medication</p><p><b>criticality</b>: high</p><p><b>code</b>: <span title=\"Codes: {http://snomed.info/sct 373270004}\">Substance with penicillin structure and antibacterial mechanism of action (substance)</span></p><p><b>patient</b>: <a href=\"#Patient_2b90dd2b-2dab-4c75-9bb9-a355e07401e8\">See above (Patient/2b90dd2b-2dab-4c75-9bb9-a355e07401e8)</a></p><p><b>onset</b>: 2010</p></div>"
                    },
                    "identifier": [
                        {
                            "system": "urn:oid:1.2.3.999",
                            "value": "3a462598-009c-484a-965c-d6b24a821424"
                        }
                    ],
                    "clinicalStatus": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                "code": "active"
                            }
                        ]
                    },
                    "verificationStatus": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                                "code": "confirmed"
                            }
                        ]
                    },
                    "type": "allergy",
                    "category": [
                        "medication"
                    ],
                    "criticality": "high",
                    "code": {
                        // text: "Testing"
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "373270004",
                                "display": "Substance with penicillin structure and antibacterial mechanism of action (substance)"
                            }
                        ]
                    },
                    "patient": {
                        "reference": "Patient/2b90dd2b-2dab-4c75-9bb9-a355e07401e8"
                    },
                    "onsetDateTime": "2010"
                };
                scope.resource = resource;

                // Set display variables
                scope.statusBadgeText = (resource.clinicalStatus?.coding?.[0].code ?? '')
                                      + (resource.clinicalStatus && resource.verificationStatus ? ' / ' : '')
                                      + (resource.verificationStatus?.coding?.[0].code ?? '');

                scope.criticalityBadgeText = `${resource.type ? `${resource.type} - ` : ''}criticality: ${resource.criticality ?? 'unknown'}`;
                scope.criticalityBadgeStyle = {
                    'background-color': badgeColor(resource.criticality)
                };

                scope.codingBadgeText = `${resource.code.coding[0].system} : ${resource.code.coding[0].code}`;

                function badgeColor(criticality) {
                    if (criticality) {
                        if (criticality === 'high') return '#dc3545';
                        else return '#3584ff';
                    }
                    else return '#7a7a7a';
                }
            }
        }
    }
})();
