// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .service('IPS', IPS);

    /**
     * @description Provides functionality to parse International Patient Summary (IPS) FHIR data.
     * @author Stacey Beard
     * @date 2025-07-08
     */
    function IPS() {
        let ips = {};

        const components = [
            "AllergyIntolerance",
            "Condition",
            "Consent",
            "DiagnosticReport",
            "DocumentReference",
            "Encounter",
            "Goal",
            "Immunization",
            "Location",
            "Medication",
            "MedicationRequest",
            "MedicationStatement",
            "Observation",
            "Organization",
            "Patient",
            "Practitioner",
            "Procedure",
            "Occupational Data",
            "Advance Directives",
        ];

        return {
            getIpsContent: getIpsContent,
            getEntry: getEntry,
            setBundle: bundle => ips = bundle,
        };

        // Primary function to traverse a bundle and get data
        // Source: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/viewer/IPSContent.svelte
        function getIpsContent() {
            console.log('PARSE', ips);

            let content = {};
            // let entries = Object.fromEntries(ips.entry?.map((entry) => [entry.id, entry.resource]));
            let compositions = ips.entry?.filter((entry) => entry.resource?.resourceType === 'Composition');
            if (!compositions || !compositions[0]) {
                return content;
            }
            let patient = ips.entry?.filter((entry) => entry.resource?.resourceType === 'Patient').map((entry) => entry.resource);
            if (patient?.[0]) {
                content ["Patient"] = {
                    section: {},
                    entries: patient,
                    useText: false
                }
            }
            let composition = compositions[0].resource;
            composition.section?.forEach((section) => {
                console.log('SECTION', section);
                let title = (section.title ?? section.code?.coding?.[0].display) ?? "[Untitled section]";
                let entries = section.entry?.map((entry) => {
                    if (entry.reference) {
                        return getEntry(entry.reference);
                    }
                }).filter((entry) => entry !== undefined) ?? [];
                let useText = entries.filter((entry) => entry.resourceType in components).length === 0;

                let sectionContent = {
                    section: section,
                    entries: entries,
                    useText: useText
                };
                content[title] = sectionContent;
            });
            return content;
        }

        // For machine-readable content, use the reference in the Composition.section.entry to retrieve resource from Bundle
        // Source: https://github.com/jddamore/IPSviewer/blob/main/classic/assets/js/renderIPS.js
        function getEntry(fullUrl) {
            let result;
            if (ips.entry) {
                ips.entry.forEach(function (entry) {
                    if (entry.fullUrl.includes(fullUrl)) {
                        // console.log(`match ${fullUrl}`);
                        result = entry.resource;
                    }
                    // Attempt to match based on resource and uuid
                    else {
                        let newMatch = fullUrl
                        if (entry.resource && entry.resource.resourceType) {
                            // remove the resource from reference
                            newMatch = newMatch.replace(entry.resource.resourceType, '');
                            // remove slash
                            newMatch = newMatch.replace(/\//g, '');
                            // console.log(newMatch);
                        }
                        if (entry.fullUrl.includes(newMatch)) {
                            // console.log(`match uuid ${newMatch}`);
                            result = entry.resource;
                        }
                    }
                });
            }
            if (!result) {
                console.log(`missing reference ${fullUrl}`);
                result = {};
            }
            console.log('ENTRY', result);
            return result;
        }
    }
})();
