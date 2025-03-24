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
            requestQuestionnaireStubFromSerNum: requestQuestionnaireStubFromSerNum,
            requestQuestionnaire: requestQuestionnaire,
            requestQuestionnairePurpose: requestQuestionnairePurpose,
            saveQuestionnaireAnswer: saveQuestionnaireAnswer
        };

        /**
         * @name requestQuestionnaireStubFromSerNum
         * @desc Gets a questionnaire's basic information (questionnaire stub) from OpalDB.
         * @param {string|int} questionnaireSerNum The SerNum of the questionnaire to look up.
         * @returns {Promise<Object>} Resolves to the basic information (questionnaire stub) for the given questionnaire.
         */
        async function requestQuestionnaireStubFromSerNum(questionnaireSerNum) {
            let response = await RequestToServer.sendRequestWithResponse('GetOneItem', {
                category: 'QuestionnaireList',
                language: UserPreferences.getLanguage(),
                serNum: questionnaireSerNum,
            });
            let questionnaireStub = response.Data?.hasOwnProperty('QuestionnaireList') ? response.Data?.QuestionnaireList[0] : undefined;
            if (!questionnaireStub) {
                console.error(response);
                throw `GetOneItem for QuestionnaireList with QuestionnaireSerNum = ${questionnaireSerNum} returned an invalid response`;
            }
            return questionnaireStub;
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
                let response = await RequestToServer.sendRequestWithResponse(api.UPDATE_STATUS, params);
                return {Success: true, Location: 'Server', QuestionnaireSerNum: response?.QuestionnaireSerNum};
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
        async function requestQuestionnaire(answerQuestionnaireID, status){
            let params = {
                'qp_ser_num': answerQuestionnaireID,
                'language': UserPreferences.getLanguage(),
                'status': status,
            };
            let response = await RequestToServer.sendRequestWithResponse(api.GET_QUESTIONNAIRE, params);
            return response?.Data ? response.Data : {};
        }

        /**
         * @name function requestQuestionnairePurpose
         * @desc Asks the listener for the purpose of the given questionnaire
         * @param {string} qp_ser_num the qp_ser_num or answerQuestionnaireId of the questionnaire
         * @returns {Promise} resolves to the questionnaire purpose data
         */
        async function requestQuestionnairePurpose(qp_ser_num) {
            let params = {
                qp_ser_num: qp_ser_num
            };

            try {
                let response = await RequestToServer.sendRequestWithResponse(api.GET_PURPOSE, params);

                // this is in case firebase deletes the property when it is empty
                if (response?.Data) {
                    return response.Data;
                }

                return {};
            } catch (error) {
                console.error('Error in requestQuestionnairePurpose', error);
                return {};
            }
        }
    }
})();
