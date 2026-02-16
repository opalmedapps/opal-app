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

        return {
            getOnceOnlyQuestionnaire: getOnceOnlyQuestionnaire,
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
    }
})();
