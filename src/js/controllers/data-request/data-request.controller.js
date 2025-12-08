// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('DataRequestController', DataRequestController);

    DataRequestController.$inject = ['$translatePartialLoader', 'Navigator', 'User'];

    function DataRequestController($translatePartialLoader, Navigator, User) {
        const vm = this;

        let smartHealthRequest;
        let firstName, lastName;

        vm.dateOfBirth = '';
        vm.name = '';
        vm.ramq = '';

        vm.shareData = shareData;

        activate();

        function activate() {
            Navigator.setNavigator(initNavigator);
            smartHealthRequest = Navigator.getParameters().smartHealthRequest;
            console.log('smartHealthRequest', smartHealthRequest);

            $translatePartialLoader.addPart('all-views');

            // Collect patient information to share
            // Name
            let userInfo = User.getUserInfo();
            firstName = userInfo.first_name;
            lastName = userInfo.last_name;
            vm.name = firstName + ' ' + lastName;

            // DOB and RAMQ (in a non-demo implementation, collect real information from the backend)
            vm.dateOfBirth = '1990-12-01';
            vm.ramq = lastName.slice(0, 3).toUpperCase() + firstName.charAt(0).toUpperCase() + '90920101';
        }

        function shareData() {
            const returnUrl = smartHealthRequest.client_id.split('redirect_uri:')[1];
            const dcqlQuery = smartHealthRequest.dcql_query;

            // TODO currently assumes the patient wants to share everything
            const shareInsurance = true;
            const shareClinical = true;
            const shareQuestionnaires = []
            dcqlQuery.credentials.forEach(cred => shareQuestionnaires[cred.id] = true);

            // Code from: jmandel/smart-health-checkin-demo > ./demo/source-flexpa/src/App.tsx
            const qItems = dcqlQuery.credentials.filter(cred => cred.meta.questionnaire || cred.meta.questionnaireUrl);
            const initialValues = {};

            qItems.forEach(item => {
                initialValues[item.id] = {};

                // Pre-fill values
                if (item.questionnaire?.item) {
                    item.questionnaire.item.forEach(q => {
                        if (q.linkId === '1') initialValues[item.id][q.linkId] = vm.name;
                        else if (q.linkId === '2') initialValues[item.id][q.linkId] = vm.dateOfBirth;
                        else if (q.linkId === '3') initialValues[item.id][q.linkId] = 'Hypertension';
                        else if (q.linkId === '4') initialValues[item.id][q.linkId] = 'Lisinopril';
                        else if (q.linkId === '5') initialValues[item.id][q.linkId] = 'Penicillin';
                    });
                }
            });

            const questionnaireValues = initialValues;

            const vp_token = {};
            const smart_artifacts = [];
            const artifactCache = new Map();

            const addArtifact = data => {
                const hash = JSON.stringify(data);
                if (artifactCache.has(hash)) return artifactCache.get(hash);
                const index = smart_artifacts.length;
                smart_artifacts.push(data);
                artifactCache.set(hash, index);
                return index;
            };

            dcqlQuery.credentials.forEach(cred => {
                const meta = cred.meta || {};
                const profile = meta.profile;
                const questionnaire = meta.questionnaire;

                let resourceType = null;
                if (profile) {
                    const match = profile.match(/StructureDefinition\/([A-Za-z0-9-]+)/);
                    if (match) {
                        const def = match[1];
                        if (def.includes('Coverage')) resourceType = 'Coverage';
                        else if (def.toLowerCase().includes('patient')) resourceType = 'Patient';
                        else resourceType = def;
                    }
                }
                if (questionnaire) resourceType = 'QuestionnaireResponse';

                let isShared = false;
                if (resourceType === 'Coverage') isShared = shareInsurance;
                else if (resourceType === 'Patient') isShared = shareClinical;
                else if (resourceType === 'QuestionnaireResponse') isShared = shareQuestionnaires[cred.id] ?? false;

                if (!isShared) return;

                const resources = [];

                if (resourceType === 'Coverage') {
                    resources.push({
                        resourceType: 'Coverage',
                        id: 'coverage-1',
                        status: 'active',
                        subscriberId: vm.ramq,
                        beneficiary: { reference: 'Patient/patient-1', display: vm.name },
                        payor: [{ display: "Régie de l'assurance maladie du Québec" }],
                        class: [{ type: { coding: [{ code: 'group' }] }, value: 'RAMQ-' + (new Date()).getFullYear() }],
                    });
                } else if (resourceType === 'Patient') {
                    resources.push({
                        resourceType: 'Patient',
                        id: 'patient-1',
                        name: [{ text: vm.name, family: lastName, given: [firstName] }],
                        birthDate: vm.dateOfBirth,
                    });
                } else if (resourceType === 'QuestionnaireResponse') {
                    const values = questionnaireValues[cred.id] || {};
                    const items = Object.entries(values)
                        .filter(([, v]) => v)
                        .map(([linkId, value]) => ({
                            linkId,
                            answer: [{ valueString: value }]
                        }));

                    resources.push({
                        resourceType: 'QuestionnaireResponse',
                        status: 'completed',
                        item: items
                    });
                }

                const presentations = resources.map(res => ({
                    artifact: addArtifact({ type: 'fhir_resource', data: res })
                }));

                vp_token[cred.id] = presentations;
            });

            const redirectUrl = `${returnUrl}#vp_token=${encodeURIComponent(JSON.stringify(vp_token))}&smart_artifacts=${encodeURIComponent(JSON.stringify(smart_artifacts))}&state=${encodeURIComponent(smartHealthRequest.state)}`;
            console.log(redirectUrl);
            location.href = redirectUrl;
        }
    }
})();
