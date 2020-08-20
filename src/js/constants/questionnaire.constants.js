(function() {
    'use strict';

    /**
     * This is a angular constant to store all the constants related to questionnaires
     *
     * This file is injected into the Params (src/js/app.values.js) and the constants are accessed from there
     *
     * Note: Change this will probably break the questionnaire
     */
    angular
        .module('MUHCApp')
        .constant('QuestionnaireConstants', {
            QUESTIONNAIRE_DB_TYPE_CONVENTIONS: {
                'DATE_TYPE_ID': 7,
                'TIME_TYPE_ID': 6,
                'LABEL_TYPE_ID': 5,
                'RADIOBUTTON_TYPE_ID': 4,
                'SLIDER_TYPE_ID': 2,
                'CHECKBOX_TYPE_ID': 1,
                'TEXTBOX_TYPE_ID': 3
            },
            QUESTIONNAIRE_DB_STATUS_CONVENTIONS: {
                'NEW_QUESTIONNAIRE_STATUS': 0,
                'IN_PROGRESS_QUESTIONNAIRE_STATUS': 1,
                'COMPLETED_QUESTIONNAIRE_STATUS': 2
            },
            QUESTIONNAIRE_API: {
                'UPDATE_STATUS': 'QuestionnaireUpdateStatus',
                'SAVE_ANSWER': 'QuestionnaireSaveAnswer',
                'GET_LIST': 'QuestionnaireList',
                'GET_QUESTIONNAIRE': 'Questionnaire'
            },
            QUESTIONNAIRE_NOTIFICATION_CONSTANTS: {
                'QUESTIONNAIRE_URL': './views/personal/questionnaires/questionnairesList.html',
                'QUESTIONNAIRE_NAME': 'New Questionnaire'
            },
            QUESTIONNAIRE_DISPLAY_STRING: {
                'NON_EXISTING_ANSWER': 'N/A'
            },
            ANSWER_SAVED_IN_DB_STATUS: {
                'ANSWER_SAVED_CONFIRMED':'1',
                'ANSWER_INVALID':'-3',
                'ANSWER_SAVING_WAITING':'-1',
                'ANSWER_SAVING_ERROR':'-2',
                'ANSWER_CHANGED': '2',
                'ANSWER_SAVING_WAITING_TIME': 30000
            },
        });
})();
