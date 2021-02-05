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
        'Params'
    ];

    /* @ngInject */
    function QuestionnaireDataService(RequestToServer, Params) {
        const allowedStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;
        const validType = Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS;
        const api = Params.QUESTIONNAIRE_API;

        // this is redundant, but written for clarity, ordered alphabetically
        let requestQuestionnaireDataService = {
            updateQuestionnaireStatus: updateQuestionnaireStatus,
            requestOpalQuestionnaireFromSerNum: requestOpalQuestionnaireFromSerNum,
            requestQuestionnaire: requestQuestionnaire,
            requestQuestionnaireList: requestQuestionnaireList,
            requestQuestionnaireUnreadNumber: requestQuestionnaireUnreadNumber,
            saveQuestionnaireAnswer: saveQuestionnaireAnswer
        };

        return requestQuestionnaireDataService;

        // //////////////


        /**
         * @name requestOpalQuestionnaireFromSerNum
         * @desc this function gets a questionnaire's general information stored in OpalDB from the listener
         * @param {string|int} questionnaireSerNum
         * @returns {Promise}
         */
        function requestOpalQuestionnaireFromSerNum(questionnaireSerNum) {
            // sends to listener
            let params = {
                'questionnaireSerNum': questionnaireSerNum
            };

            return RequestToServer.sendRequestWithResponse(api.GET_OPAL_QUESTIONNAIRE_FROM_SERNUM, params)
                .then(function (response) {
                    // this is in case firebase delete the property when it is empty
                    if (response.hasOwnProperty('Data')) {
                        return response.Data;
                    }
                    return {};
                });
        }

        /**
         * @name updateQuestionnaireStatus
         * @desc this function calls the listener to update the status related to a particular questionnaire received by patient
         * @param {int} answerQuestionnaireId: ID of particular questionnaire received by patient
         * @param {int} newStatus the new status to be updated in
         * @return {Promise}
         */
        function updateQuestionnaireStatus(answerQuestionnaireId, newStatus){

            return new Promise(function(resolve, reject){
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
                    return reject({Success: false, Location: '', Error: error});
                }

                // send to the database
                let params = {
                    'answerQuestionnaire_id': answerQuestionnaireId,
                    'new_status': newStatus,
                };

                return RequestToServer.sendRequestWithResponse(api.UPDATE_STATUS, params)
                    .then(function(response){
                        resolve({Success: true, Location: 'Server'});
                    })
                    .catch(function(err){
                        reject({Success: false, Location: '', Error: err});
                    });
            });
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
        function saveQuestionnaireAnswer(answerQuestionnaireId, sectionId, questionId, questionSectionId, answerArray, questionTypeId, isSkipped){

            return new Promise (function(resolve, reject){
                // flag for property check
                let isTypeCorrect = false;

                // array to prevent the encryption of the answerArray since it is passing by reference
                let answerToSave = [];

                // verify property
                if (!Array.isArray(answerArray)){
                    reject("ERROR: error in saving the questionnaire answer, it does not have a valid answerArray");
                }

                for (let type in validType){
                    if (validType[type] === questionTypeId){
                        isTypeCorrect = true;
                        break;
                    }
                }
                if (!isTypeCorrect){
                    reject("ERROR: error in saving the questionnaire answer, it does not have a valid typeID");
                }

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
                    'is_skipped': isSkipped
                };

                return RequestToServer.sendRequestWithResponse(api.SAVE_ANSWER, params)
                // this is for sendRequestWithResponse, but now the response is only success or failure
                    .then(function (response) {
                        resolve({Success: true, Location: 'Server'});
                    })
                    .catch(function (error) {
                        reject({Success: false, Location: '', Error: error});
                    });
            })
        }

        /**
         * @name requestQuestionnaireList
         * @desc Asks the listener for the list of questionnaires under a specific category this user has
         * @param {string} questionnaireCategory the category of questionnaires requested
         * @returns {Promise} resolves to an array of questionnaires if success
         */
        function requestQuestionnaireList(questionnaireCategory) {
            let params = {
                category: questionnaireCategory
            };

            return RequestToServer.sendRequestWithResponse(api.GET_LIST, params)
                .then(function (response) {
                    // this is in case firebase deletes the property when it is empty
                    if (response.hasOwnProperty('Data')) {
                        return response.Data;
                    }
                    return [];
                });
        }

        /**
         * @name requestQuestionnaire
         * @desc this function gets one particular questionnaire's data from the listener
         * @param {int} answerQuestionnaireID ID of that particular questionnaire
         * @returns {Promise} resolves to the questionnaire's data if success
         */
        function requestQuestionnaire(answerQuestionnaireID){
            // Parameters
            let params = {
                'qp_ser_num': answerQuestionnaireID,
            };

            return RequestToServer.sendRequestWithResponse(api.GET_QUESTIONNAIRE, params)
                .then(function (response) {
                    // this is in case firebase deletes the property when it is empty
                    if (response.hasOwnProperty('Data')) {
                        return response.Data;
                    }
                    return {};
                });
        }

          /**
         * @name requestQuestionnaireUnreadNumber
         * @desc Asks the listener for the number of unread (e.g. 'New') questoinnaires under a specific category for this user
         * @param {string} questionnaireCategory the category of questionnaires requested
         * @returns {Promise} resolves to the number of unread questionnaires data
         */
        function requestQuestionnaireUnreadNumber(questionnaireCategory) {
            let params = {
                category: questionnaireCategory
            };
            return RequestToServer.sendRequestWithResponse(api.GET_NUMBER_UNREAD, params)
                .then(function (response) {
                    // this is in case firebase deletes the property when it is empty
                    if (response.hasOwnProperty('Data')) {
                        return response.Data;
                    }
                    return {numberUnread: "0"};
                });
        }
    }
})();

