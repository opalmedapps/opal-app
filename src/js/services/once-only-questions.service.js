// SPDX-FileCopyrightText: Copyright (C) 2026 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .service('OnceOnlyQuestions', OnceOnlyQuestions);

    OnceOnlyQuestions.$inject = ['$filter', 'Params'];

    function OnceOnlyQuestions($filter, Params) {

        // source: https://browser.ihtsdotools.org/?perspective=full&conceptId1=365981007&edition=MAIN/2026-02-01&release=&languages=en
        const TOBACCO_USE_CODES = {
            1: {
                system: "http://snomed.info/sct",
                code: "8392000",
                display: "Non-smoker"
            },
            2: {
                system: "http://snomed.info/sct",
                code: "8517006 ",
                display: "Ex-smoker"
            },
            3: {
                system: "http://snomed.info/sct",
                code: "428041000124106",
                display: "Occasional cigarette smoker",
            },
            4: {
                system: "http://snomed.info/sct",
                code: "230060001",
                display: "Light cigarette smoker",
            },
            5: {
                system: "http://snomed.info/sct",
                code: "56578002",
                display: "Moderate cigarette smoker",
            },
            6: {
                system: "http://snomed.info/sct",
                code: "230063004",
                display: "Heavy cigarette smoker",
            },
            7: {
                system: "http://snomed.info/sct",
                code: "230064005",
                display: "Very heavy cigarette smoker",
            },
            8: {
                system: "http://snomed.info/sct",
                code: "82302008",
                display: "Pipe smoker",
            },
            9: {
                system: "http://snomed.info/sct",
                code: "59978006",
                display: "Cigarette smoker",
            },
        }

        // based on: https://build.fhir.org/ig/HL7/fhir-ips/en/Observation-alcohol-use-example.json.html
        // Common UCUM units: https://terminology.hl7.org/5.5.0/ValueSet-ucum-common.html#logical-definition-cld
        const ALCOHOL_USE_CODES = {
            1: {
                system: "http://snomed.info/sct",
                code: "105542008",
                display: "Current non-drinker of alcohol",
            },
            2: {
                system: "http://loinc.org",
                code: "74013-4",
                display: "Alcoholic drinks per day"
            },
            3: {
                system: "http://loinc.org",
                code: "105992-2",
                display: "Alcoholic drinks per week"
            },
        }

        return {
            getOnceOnlyQuestionnaire: getOnceOnlyQuestionnaire,
            submit: submit,
        }

        /**
         * @description Get once-only questions in a format supported by the questionnaire views.
         */
        function getOnceOnlyQuestionnaire() {
            return {
                allow_questionnaire_feedback: '1',
                created: 1771250400000,
                description: $filter('translate')('ONCE_ONLY_DESCRIPTION'),
                externalId: '-1',
                instruction: '',
                last_updated: Date.now(),
                logo: '',
                nickname: $filter('translate')('ONCE_ONLY_QUESTIONS'),
                patient_id: undefined,
                purpose_id: '7', // Once-only
                qp_ser_num: '-1',
                questionnaire_id: '-1',
                questionnaire_purpose: 'ONCE-ONLY',
                respondent_id: '-1',
                status: Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS.IN_PROGRESS_QUESTIONNAIRE_STATUS,
                sections: [
                    {
                        section_id: '-1',
                        section_instruction: '',
                        section_position: '1',
                        section_title: '',
                        questions: [
                            {
                                allow_question_feedback: '0',
                                optional: '1',
                                orientation: '0',
                                polarity: '0',
                                questionSection_id: '-1',
                                question_display: $filter('translate')('ONCE_ONLY_QUESTION_ALCOHOL_FREQUENCY_SHORT'),
                                question_id: '1',
                                question_position: '1',
                                question_text: $filter('translate')('ONCE_ONLY_QUESTION_ALCOHOL_FREQUENCY'),
                                section_id: '-1',
                                type_id: Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS.RADIOBUTTON_TYPE_ID,
                                patient_answer: {
                                    is_defined: '0',
                                },
                                options: [
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '1',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_ALCOHOL_FREQUENCY_1'),
                                        order: '1',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '2',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_ALCOHOL_FREQUENCY_2'),
                                        order: '2',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '3',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_ALCOHOL_FREQUENCY_3'),
                                        order: '3',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '4',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_ALCOHOL_FREQUENCY_4'),
                                        order: '4',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '5',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_ALCOHOL_FREQUENCY_5'),
                                        order: '5',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                ],
                            },
                            {
                                allow_question_feedback: '0',
                                optional: '1',
                                orientation: '0',
                                polarity: '0',
                                questionSection_id: '-1',
                                question_display: $filter('translate')('ONCE_ONLY_QUESTION_ALCOHOL_AMOUNT_SHORT'),
                                question_id: '2',
                                question_position: '2',
                                question_text: $filter('translate')('ONCE_ONLY_QUESTION_ALCOHOL_AMOUNT'),
                                section_id: '-1',
                                type_id: Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS.TEXTBOX_TYPE_ID,
                                patient_answer: {
                                    is_defined: '0',
                                },

                                options: [
                                    {
                                        char_limit: '3',
                                        option_text: '',
                                        questionId: '-1',
                                    },
                                ],
                            },
                            {
                                allow_question_feedback: '0',
                                optional: '1',
                                orientation: '0',
                                polarity: '0',
                                questionSection_id: '-1',
                                question_display: $filter('translate')('ONCE_ONLY_QUESTION_SMOKING_SHORT'),
                                question_id: '3',
                                question_position: '3',
                                question_text: $filter('translate')('ONCE_ONLY_QUESTION_SMOKING'),
                                section_id: '-1',
                                type_id: Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS.RADIOBUTTON_TYPE_ID,
                                patient_answer: {
                                    is_defined: '0',
                                },
                                options: [
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '1',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_SMOKING_1'),
                                        order: '1',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '2',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_SMOKING_2'),
                                        order: '2',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '3',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_SMOKING_3'),
                                        order: '3',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '4',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_SMOKING_4'),
                                        order: '4',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '5',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_SMOKING_5'),
                                        order: '5',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                    {
                                        ID: '-1',
                                        description: '-1',
                                        option_id: '6',
                                        option_text: $filter('translate')('ONCE_ONLY_QUESTION_SMOKING_6'),
                                        order: '6',
                                        parentTableId: '-1',
                                        questionId: '-1',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
        }

        function submit(questionnaire, patient_uuid) {
            let fhirData = {};

            const frequencyAnswer = questionnaire.sections[0].questions[0].patient_answer;
            const amountAnswer = questionnaire.sections[0].questions[1].patient_answer;
            const smokingAnswer = questionnaire.sections[0].questions[2].patient_answer;

            if (frequencyAnswer.is_defined === '1' && amountAnswer.is_defined === '1') {
                const frequencyCode = ALCOHOL_USE_CODES[frequencyAnswer.answer[0].answer_value];
                const amountValue = parseFloat(amountAnswer.answer[0].answer_value);

                if (!isNaN(amountValue) && isFinite(amountValue)) {
                    fhirData.alcoholUse = {
                        resourceType: 'Observation',
                        id: crypto.randomUUID(),
                        status: 'preliminary',
                        category: [
                            {
                                coding: [
                                    {
                                        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                                        code: 'social-history',
                                        display: 'Social History',
                                    },
                                ],
                            },
                        ],
                        code: {
                            coding: [frequencyCode],
                        },
                        valueQuantity: {
                            value: amountValue,
                            system: "http://unitsofmeasure.org",
                            code: "/d",
                            unit: "per day",
                        }
                    };
                }
            }

            if (smokingAnswer.is_defined === '1') {
                const smokingCode = TOBACCO_USE_CODES[smokingAnswer.answer[0].answer_value];

                fhirData.tobaccoUse = {
                    resourceType: 'Observation',
                    id: crypto.randomUUID(),
                    status: 'preliminary',
                    category: [
                        {
                            coding: [
                                {
                                    system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                                    code: 'social-history',
                                    display: 'Social History',
                                },
                            ],
                        },
                    ],
                    code: {
                        coding: [
                            {
                                system: "http://loinc.org",
                                code: "72166-2",
                                display: "Tobacco smoking status"
                            }
                        ]
                    },
                    valueCodeableConcept: {
                        coding: [smokingCode],
                    },
                };
            }

            if (Object.keys(fhirData).length === 0) {
                console.log("No FHIR data to submit.");
            } else {
                // TODO: replace with actual call to backend
                console.log("Submitting FHIR data:", fhirData);
            }
        }
    }
})();
