(function() {
    'use strict';

    /**
     * dataService for questionnaire
     * refactor logic for interacting with data to hide this from outside caller and make it easier to change,
     * also easier to test when we do have testing scripts
     * This should be only used for questionnaire and once we modularized questionnaire it should go with it.
     * Note: we cannot modularize now due to requiring RequestToServer (circular dependencies).
     *      This file's separation from questionnairesService will help to isolate that logic.
     */

    angular
        .module('MUHCApp')
        .factory('QuestionnaireDataService', QuestionnaireDataService);

    QuestionnaireDataService.$inject = [
        'RequestToServer',
        'Params',
        'UserPreferences',
    ];

    /* @ngInject */
    function QuestionnaireDataService(RequestToServer, Params, UserPreferences) {
        const allowedStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;
        const validType = Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS;
        const api = Params.QUESTIONNAIRE_API;

        // this is redundant, but written for clarity, ordered alphabetically
        return {
            updateQuestionnaireStatus: updateQuestionnaireStatus,
            requestOpalQuestionnaireFromSerNum: requestOpalQuestionnaireFromSerNum,
            requestQuestionnaire: requestQuestionnaire,
            saveQuestionnaireAnswer: saveQuestionnaireAnswer
        };

        /**
         * @name requestOpalQuestionnaireFromSerNum
         * @desc this function gets a questionnaire's general information stored in OpalDB from the listener
         * @param {string|int} questionnaireSerNum
         * @returns {Promise}
         */
        async function requestOpalQuestionnaireFromSerNum(questionnaireSerNum) {
            const response = await RequestToServer.sendRequestWithResponse(api.GET_OPAL_QUESTIONNAIRE_FROM_SERNUM, {questionnaireSerNum});
            return response.hasOwnProperty('Data') ? response.Data : {};
        }

        /**
         * @name updateQuestionnaireStatus
         * @desc this function calls the listener to update the status related to a particular questionnaire received by patient
         * @param {int} answerQuestionnaireId: ID of particular questionnaire received by patient
         * @param {int} newStatus the new status to be updated in
         * @return {Promise}
         */
        async function updateQuestionnaireStatus(answerQuestionnaireId, newStatus, userProfile){
            // flag for property check
            let isStatusCorrect = false;

            // verify property
            for (let status in allowedStatus){
                if (allowedStatus[status] === newStatus){
                    isStatusCorrect = true;
                    break;
                }
            }

            if (!isStatusCorrect){
                let error = "ERROR: error in updating the questionnaire status, it does not have a valid new status";
                throw {Success: false, Location: '', Error: error};
            }

            
            // send to the database
            let params = {
                'answerQuestionnaire_id': answerQuestionnaireId,
                'new_status': newStatus,
                'user_display_name': `${userProfile.first_name} ${userProfile.last_name}`,
            };

            try {
                await RequestToServer.sendRequestWithResponse(api.UPDATE_STATUS, params);
                return {Success: true, Location: 'Server'}
            } catch (error) {
                throw {Success: false, Location: '', Error: error}
            }
        }

        /**
         * @name saveQuestionnaireAnswer
         * @desc This function saves the answer for a single question (even if it is skipped)
         * @param {int} answerQuestionnaireId ID of particular questionnaire received by patient
         * @param {int} sectionId ID of particular section of the question answered
         * @param {int} questionId ID of the question answered
         * @param {int} questionSectionId unique ID between the question and the section
         * @param {array} answerArray Array of answers
         * @param {int} questionTypeId ID of the question type
         * @param {int} isSkipped is this question skipped or not
         * @returns {Promise}
         */
        async function saveQuestionnaireAnswer(answerQuestionnaireId, sectionId, questionId, questionSectionId, answerArray, questionTypeId, isSkipped){
            // flag for property check
            let isTypeCorrect = false;

            // array to prevent the encryption of the answerArray since it is passing by reference
            let answerToSave = [];
            if (!Array.isArray(answerArray)) throw new Error('ERROR: error in saving the questionnaire answer, it does not have a valid answerArray');

            for (let type in validType){
                if (validType[type] === questionTypeId){
                    isTypeCorrect = true;
                    break;
                }
            }
            if (!isTypeCorrect) throw new Error('ERROR: error in saving the questionnaire answer, it does not have a valid typeID');

            // this is to prevent the encryption of the answerArray since it is passing by reference
            answerArray.forEach(function (ans) {
                answerToSave.push(Object.assign({}, ans));
            });

                // sends to listener
                let params = {
                    'answerQuestionnaire_id': answerQuestionnaireId,
                    'section_id': sectionId,
                    'question_id': questionId,
                    'questionSection_id': questionSectionId,
                    'answer': answerToSave,
                    'question_type_id': questionTypeId,
                    'is_skipped': isSkipped,
                    'language': UserPreferences.getLanguage(),
                };

            try {
                await RequestToServer.sendRequestWithResponse(api.SAVE_ANSWER, params);
                return {Success: true, Location: 'Server'};
            } catch (error) {
                throw {Success: false, Location: '', Error: error};
            }
        }

        /**
         * @name requestQuestionnaire
         * @desc this function gets one particular questionnaire's data from the listener
         * @param {int} answerQuestionnaireID ID of that particular questionnaire
         * @returns {Promise} resolves to the questionnaire's data if success
         */
        async function requestQuestionnaire(answerQuestionnaireID){
            let params = {
                'qp_ser_num': answerQuestionnaireID,
                'language': UserPreferences.getLanguage(),
            };

            let response = await RequestToServer.sendRequestWithResponse(api.GET_QUESTIONNAIRE, params);
            return response.hasOwnProperty('Data') ? response.Data : {};
        }
    }
})();
