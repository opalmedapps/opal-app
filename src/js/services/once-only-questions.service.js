// SPDX-FileCopyrightText: Copyright (C) 2026 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// TODO: If a user removes a radio button answer that was previously saved, they won't see the "You have unsaved answers" message
// TODO: The dependency between the two alcohol questions might not be clear to users. If they answer the second question when not required, their answer gets deleted without a warning.
//       Consider finding a way to make the answer to the second question invalid depending on what they answered in the first question.

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .service('OnceOnlyQuestions', OnceOnlyQuestions);

    OnceOnlyQuestions.$inject = ['$filter', 'NativeNotification', 'Params', 'RequestToServer'];

    function OnceOnlyQuestions($filter, NativeNotification, Params, RequestToServer) {

        const STATUS = Params.ANSWER_SAVED_IN_DB_STATUS;

        // See: https://loinc.org/72166-2
        const SMOKING_STATUS_CODE = "72166-2";

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
                display: "Cigar smoker",
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
                system: "http://snomed.info/sct",
                code: "228276006",
                display: "Occasional drinker",
            },
            3: {
                system: "http://loinc.org",
                code: "105992-2",
                display: "Alcoholic drinks per week"
            },
            4: {
                system: "http://loinc.org",
                code: "74013-4",
                display: "Alcoholic drinks per day"
            },
        }

        return {
            getOnceOnlyQuestionnaire: getOnceOnlyQuestionnaire,
            submit: submit,
        }

        /**
         * @description Evaluates whether a once-only question has been answered.
         * @param {object} patientAnswer The question.patient_answer attribute for a question.
         */
        function isDefinedAnswer(patientAnswer) {
            return [STATUS.ANSWER_SAVED_CONFIRMED, STATUS.ANSWER_CHANGED_ONCE_ONLY].includes(patientAnswer.is_defined)
                && patientAnswer.answer.length > 0;
        }

        /**
         * @description Get once-only questions in a format supported by the questionnaire views.
         * @param {string} patient_uuid UUID of the patient for which to get the once-only questionnaire.
         */
        async function getOnceOnlyQuestionnaire(patient_uuid) {
            // See: https://stackoverflow.com/questions/3746725/how-to-create-an-array-containing-1-n
            const arrayUpTo = length => [...Array(length).keys()].map(i => i+1);

            const QUESTIONNAIRE = {
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
                                    ...(
                                        arrayUpTo(4).map(i => {
                                            return {
                                                ID: '-1',
                                                description: '-1',
                                                option_id: i.toString(),
                                                option_text: $filter('translate')(`ONCE_ONLY_QUESTION_ALCOHOL_FREQUENCY_${i}`),
                                                order: i.toString(),
                                                parentTableId: '-1',
                                                questionId: '-1',
                                            };
                                        })
                                    ),
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
                                    ...(
                                        arrayUpTo(9).map(i => {
                                            return {
                                                ID: '-1',
                                                description: '-1',
                                                option_id: i.toString(),
                                                option_text: $filter('translate')(`ONCE_ONLY_QUESTION_SMOKING_${i}`),
                                                order: i.toString(),
                                                parentTableId: '-1',
                                                questionId: '-1',
                                            };
                                        })
                                    ),
                                ],
                            },
                        ],
                    },
                ],
            };

            let questionnaire = structuredClone(QUESTIONNAIRE);
            let result = await retrieve(patient_uuid);

            if (result && result.social_history) {
                let [alcoholAnswer, alcoholAmount] = fhirToAlcoholData(result.social_history);

                if (alcoholAnswer) {
                    questionnaire.sections[0].questions[0].patient_answer.is_defined = STATUS.ANSWER_SAVED_CONFIRMED;
                    questionnaire.sections[0].questions[0].patient_answer.answer = [{
                        answer_value: alcoholAnswer,
                        answer_option_text: $filter('translate')(`ONCE_ONLY_QUESTION_ALCOHOL_FREQUENCY_${alcoholAnswer}`)
                    }]
                }

                if (alcoholAmount) {
                    questionnaire.sections[0].questions[1].patient_answer.is_defined = STATUS.ANSWER_SAVED_CONFIRMED;
                    questionnaire.sections[0].questions[1].patient_answer.answer = [{
                        answer_value: alcoholAmount,
                    }]
                }

                let smokingAnswer = fhirToSmokingData(result.social_history);

                if (smokingAnswer) {
                    questionnaire.sections[0].questions[2].patient_answer.is_defined = STATUS.ANSWER_SAVED_CONFIRMED;
                    questionnaire.sections[0].questions[2].patient_answer.answer = [{
                        answer_value: smokingAnswer,
                        answer_option_text: $filter('translate')(`ONCE_ONLY_QUESTION_SMOKING_${smokingAnswer}`),
                    }]
                }
            }

            return questionnaire;
        }

        /**
         * @description Extracts data about alcohol consumption from a once-only questionnaire and formats it as FHIR data.
         * @param questionnaire The once-only questionnaire from which to extract answers.
         * @returns {*} FHIR Observation - Social History Alcohol Use
         */
        function alcoholDataToFhir(questionnaire) {
            const frequencyAnswer = questionnaire.sections[0].questions[0].patient_answer;

            // If no frequency answer was given, cannot format data
            if (!isDefinedAnswer(frequencyAnswer)) return;

            const frequencyCode = ALCOHOL_USE_CODES[frequencyAnswer.answer[0].answer_value];
            const amountAnswer = questionnaire.sections[0].questions[1].patient_answer;
            const amountValue = amountAnswer.is_defined === STATUS.ANSWER_CHANGED_ONCE_ONLY ? parseFloat(amountAnswer.answer[0].answer_value) : undefined;

            // In cases where the user has chosen a weekly or daily alcohol consumption amount and provided a number, format it as a valueQuantity
            // See: https://build.fhir.org/ig/HL7/fhir-ips/en/Observation-alcohol-use-example.json.html
            const perWeek = frequencyCode.display.includes('week');
            const perDay = frequencyCode.display.includes('day');

            let valueQuantity;

            if (!isNaN(amountValue) && isFinite(amountValue)) {
                if (perWeek) valueQuantity = {
                    valueQuantity: {
                        value: amountValue,
                        system: "http://unitsofmeasure.org",
                        code: "/wk",
                        unit: "per week",
                    }
                }
                else if (perDay) valueQuantity = {
                    valueQuantity: {
                        value: amountValue,
                        system: "http://unitsofmeasure.org",
                        code: "/d",
                        unit: "per day",
                    }
                }
            }

            return {
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
                ...valueQuantity,
            };
        }

        function fhirToAlcoholData(socialHistory) {
            const codeToKey = Object.entries(ALCOHOL_USE_CODES).reduce((acc, [key, value]) => {
                acc[value.code] = key;
                return acc;
            }, {});

            for (const key in socialHistory) {
                const observation = socialHistory[key];

                let code = observation.code.coding[0].code;
                let amount = observation.valueQuantity?.value;

                if (code in codeToKey) {
                    return [codeToKey[code], amount];
                }
            }

            return [null, null];
        }

        /**
         * @description Extracts data about smoking habits from a once-only questionnaire and formats it as FHIR data.
         * @param questionnaire The once-only questionnaire from which to extract answers.
         * @returns {*} FHIR Observation - Social History Tobacco Use
         */
        function smokingDataToFhir(questionnaire) {
            const smokingAnswer = questionnaire.sections[0].questions[2].patient_answer;

            // If no smoking answer was given, cannot format data
            if (!isDefinedAnswer(smokingAnswer)) return;

            const smokingCode = TOBACCO_USE_CODES[smokingAnswer.answer[0].answer_value];

            return {
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
                            code: SMOKING_STATUS_CODE,
                            display: "Tobacco smoking status"
                        }
                    ]
                },
                valueCodeableConcept: {
                    coding: [smokingCode],
                },
            };
        }

        function fhirToSmokingData(socialHistory) {
            const codeToKey = Object.entries(TOBACCO_USE_CODES).reduce((acc, [key, value]) => {
                acc[value.code] = key;
                return acc;
            }, {});

            for (const key in socialHistory) {
                const observation = socialHistory[key];
                let code = observation.code.coding[0].code;

                if (code == SMOKING_STATUS_CODE) {
                    let valueCode = observation.valueCodeableConcept.coding[0].code;

                    if (valueCode in codeToKey) {
                        return codeToKey[valueCode];
                    }
                }
            }

            return null;
        }

        async function retrieve(patient_uuid) {
            const requestParams = Params.API.ROUTES.ONCE_ONLY.GET;
            const formattedParams = {
                ...requestParams,
                url: requestParams.url.replace('<PATIENT_UUID>', patient_uuid),
            };

            try {
                let result = await RequestToServer.apiRequest(formattedParams);
                return result.data;
            }
            // TODO move error handling to the controller
            catch (error) {
                if (error.response.status_code !== '404') {
                    console.error('Error retrieving existing once-only answers', error);
                    NativeNotification.showNotificationAlert($filter('translate')('SERVER_ERROR_ALERT'));
                }
            }

            return {};
        }

        async function submit(questionnaire, patient_uuid) {
            let socialHistory = [
                alcoholDataToFhir(questionnaire),
                smokingDataToFhir(questionnaire),
            ].filter(entry => entry !== undefined);

            const requestParams = Params.API.ROUTES.ONCE_ONLY.PUT;
            const formattedParams = {
                ...requestParams,
                url: requestParams.url.replace('<PATIENT_UUID>', patient_uuid),
            };

            try {
                // Submit answers to the backend
                await RequestToServer.apiRequest(formattedParams, {
                    social_history: socialHistory,
                });

                // Mark answers that exist as successfully saved
                questionnaire.sections.forEach(section => {
                    section.questions.forEach(question => {
                        if (question.patient_answer.is_defined !== '0') {
                            question.patient_answer.is_defined = STATUS.ANSWER_SAVED_CONFIRMED;
                        }
                    });
                });
            }
            // TODO move error handling to the controller
            catch (error) {
                console.error('Error submitting once-only answers', error);
                NativeNotification.showNotificationAlert($filter('translate')('QUESTIONNAIRE_SAVE_ERROR'));
            }
        }
    }
})();
