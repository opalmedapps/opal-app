// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import '../../../css/views/ips.view.css';

import bundle from './sample-bundle.json';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IPSController', IPSController);

    IPSController.$inject = [];

    function IPSController() {
        const vm = this;

        let headerLength = 0;

        vm.displayContent = {
            allergies: [],
        }

        activate();

        function activate() {
            update(bundle);
            console.log(vm.displayContent);
        }

        // Primary function to traverse the Bundle and get data
        // Calls the render function to display contents
        // Source: https://github.com/jddamore/IPSviewer/blob/main/classic/assets/js/renderIPS.js
        function update(ips) {
            for (let i = 0; i < ips.entry.length; i++) {
                let entry = ips.entry[i];
                if (!entry.resource) console.log(entry);
                if (entry.resource.resourceType === "Composition") {
                    let composition = entry.resource;
                    let patient = {};
                    if (composition.custodian && composition.custodian.reference) {
                        console.log(composition.custodian.reference);
                        composition.custodian = getEntry(ips, composition.custodian.reference);
                    }
                    else {
                        console.log('no custodian reference');
                        composition.custodian = {};
                    }
                    if (composition.subject && composition.subject.reference) {
                        console.log(composition.subject.reference);
                        patient = getEntry(ips, composition.subject.reference);
                    }
                    else console.log('no subject reference');
                    render("Composition", composition, "composition");
                    console.log('Patient Card');
                    if (patient) {
                        console.log(patient)
                        render("Patient", {patient: [patient]}, "patient");
                    }
                    let alertMissingComposition = false;
                    for (let j = 0; j < composition.section.length; j++) {
                        let section = composition.section[j];
                        if (!section || !section.code || !section.code.coding || !section.code.coding[0]) {
                            alertMissingComposition = true;
                            console.log('Section is missing coding information');
                        }
                        else if (section.code.coding[0].code === "11450-4") {
                            console.log('Problems Section', j);
                            section.problems = [];
                            if (section.entry) {
                                section.entry.forEach(function (problem) {
                                    console.log(problem.reference)
                                    section.problems.push(getEntry(ips, problem.reference));
                                });
                            }
                            render("Problems", section, "problems", j);
                        }
                        else if (section.code.coding[0].code === "48765-2") {
                            console.log('Allergies Section', j);
                            section.allergies = [];
                            if (section.entry) {
                                section.entry.forEach(function (allergy) {
                                    console.log(allergy.reference)
                                    let allergy2 = getEntry(ips, allergy.reference);
                                    if (!allergy2.category) allergy2.category = [' '];
                                    if (!allergy2.type) allergy2.type = ' ';
                                    section.allergies.push(allergy2);
                                });
                            }
                            render("Allergies", section, "allergies", j);
                        }

                        else if (section.code.coding[0].code === "10160-0") {
                            console.log('Medications Section', j);
                            section.medications = [];
                            if (section.entry) {
                                section.entry.forEach(function (medication) {
                                    console.log(medication.reference);
                                    // while variable name is Statement, this may be either MedicationStatement or MedicationRequest
                                    let statement = getEntry(ips, medication.reference);
                                    let medicationReference;
                                    // First check if the medication is contained
                                    if (statement.contained && statement.contained[0] && statement.contained[0].resourceType === 'Medication') {
                                        medicationReference = statement.contained[0];
                                    }
                                    // Either MedicationRequest or MedicationStatement may have a reference to Medication
                                    else if (statement.medicationReference && statement.medicationReference.reference) medicationReference = getEntry(ips, statement.medicationReference.reference);
                                    else if (statement.medicationCodeableConcept) medicationReference = { code: statement.medicationCodeableConcept };
                                    else medicationReference = { code: { coding: [{ system: '', display: '', code: '' }] } }
                                    // Fallback to display of reference if empty
                                    if (!medicationReference.code && statement.medicationReference.display) {
                                        medicationReference = { code: { coding: [{ system: '', display: statement.medicationReference.display, code: '' }] } }
                                    }
                                    // MedicationStatement has dosage while MedicationRequest has dosageInstruction. Use alias to simplify template
                                    if (statement.dosageInstruction) statement.dosage = statement.dosageInstruction;
                                    section.medications.push({
                                        statement: statement,
                                        medication: medicationReference
                                    });
                                });
                            }
                            render("Medications", section, "medications", j);
                        }
                        else if (section.code.coding[0].code === "11369-6") {
                            console.log('Immunizations Section', j);
                            section.immunizations = [];
                            if (section.entry) {
                                section.entry.forEach(function (immunization) {
                                    console.log(immunization.reference);
                                    section.immunizations.push(getEntry(ips, immunization.reference));
                                });
                            }
                            render("Immunizations", section, "immunizations", j);
                        }
                        else if (section.code.coding[0].code === "30954-2") {
                            console.log('Observations Section', j);
                            section.observations = [];
                            if (section.entry) {
                                section.entry.forEach(function (observation) {
                                    console.log(observation.reference);
                                    let thisResult = getEntry(ips, observation.reference);
                                    section.observations.push(thisResult);
                                    if (thisResult.hasMember) {
                                        for (let k = 0; k < thisResult.hasMember.length; k++) {
                                            if (thisResult.hasMember[k].reference) section.observations.push(getEntry(ips, thisResult.hasMember[k].reference));
                                        }
                                    }
                                });
                            }
                            render("Observations", section, "observations", j);
                        }
                        else if (section.code.coding[0].code === "42348-3") {
                            console.log('Advance Directives Section', j);
                            section.ad = [];
                            if (section.entry) {
                                section.entry.forEach(function (ad) {
                                    console.log(ad.reference);
                                    section.ad.push(getEntry(ips, ad.reference));
                                });
                                render("AdvanceDirectives", section, "advanceDirectives", j);
                            }
                        }
                        else {
                            console.log(`Section with code: ${section.code.coding[0].code} not rendered since no template, section: ${j}`);
                            render("Other", section, "Other", j);
                        }
                    }
                    if (alertMissingComposition) alert('Missing coding information in Composition resource. Rendering may be incomplete.')
                }
            }
            //don't need to do anything if the header is not shown
            if (headerLength === 1) {
                console.error('Not implemented');
                // checks(ips)
            }
        }

        // For machine-readable content, use the reference in the Composition.section.entry to retrieve resource from Bundle
        // Source: https://github.com/jddamore/IPSviewer/blob/main/classic/assets/js/renderIPS.js
        function getEntry(ips, fullUrl) {
            let result;
            if (ips.entry) {
                ips.entry.forEach(function (entry) {
                    if (entry.fullUrl.includes(fullUrl)) {
                        console.log(`match ${fullUrl}`);
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
                            console.log(`match uuid ${newMatch}`);
                            result = entry.resource;
                        }
                    }
                });
            }
            if (!result) {
                console.log(`missing reference ${fullUrl}`);
                result = {};
            }
            return result;
        }

        // Update the data in viewer based on mode and data
        // Source: https://github.com/jddamore/IPSviewer/blob/main/classic/assets/js/renderIPS.js
        function render(templateName, data, targetLocation, sectionCount) {
            console.log('Render', templateName, data, targetLocation, sectionCount);
            vm.displayContent[targetLocation] = data[targetLocation];
            return;

            let entryCheck = 0;
            if (targetLocation === "Other") {
                $("#OtherSections").append(`<div class="col-md-12 output data" id="Other${sectionCount}"></div>`)
            }
            if (templateName === 'Patient') {
                if (!data.custodian) data.custodian = {};
                if (!data.custodian.name) data.custodian.name = '[NOT FOUND]';
                if (!data.custodian.address || !data.custodian.address[0]) {
                    data.custodian.address = [{ city: '', country: '' }];
                }
                entryCheck = 1;
            }
            else if (data.entry) {
                entryCheck = data.entry.length
            }
            if (mode === "Entries" && templateName !== "Other") {
                let jqxhr = $.get("classic/templates/" + templateName + ".html", function () { })
                    .done(function (template) {
                        // console.log(template);
                        console.log(data);
                        let templateResult = ''
                        try {
                            templateResult = Sqrl.Render(template, data);
                        }
                        catch(e) {
                            console.log(`error in rendering template ${templateName}`, e);
                        }
                        $("#" + targetLocation).html(templateResult);
                    }).fail(function (e) {
                        console.log("error in getting template", e);
                    });
            }
            else {
                // if the mode was intended as Entries and narrative fallback used, display message
                if (mode === "Entries") $("#renderMessage").attr("style", "display:inline");
                else $("#renderMessage").hide();
                let content = { titulo: data.title, div: "No text defined.", index: sectionCount };
                if (!content.titulo) content.titulo = data.resourceType;
                if (data.text) content.div = data.text.div;
                console.log(content);
                let jqxhr = $.get("classic/templates/Text.html", function () { })
                    .done(function (template) {
                        let templateResult = ''
                        try {
                            templateResult = Sqrl.Render(template, content);
                        }
                        catch(e) {
                            console.log(`error in rendering template ${templateName}`, e);
                        }
                        if (targetLocation !== "Other") $("#" + targetLocation).html(templateResult);
                        else {
                            // console.log(`#Other${sectionCount}`);
                            // console.log(templateResult);
                            $(`#Other${sectionCount}`).html(templateResult);
                        }
                    }).fail(function (e) {
                        console.log("error in getting template", e);
                    });
            }
        }
    }
})();
