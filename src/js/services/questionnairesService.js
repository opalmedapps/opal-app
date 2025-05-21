// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function() {
    'use strict';

    /**
     * @name Questionnaires
     * @desc This is the factory (service) for all the questionnaire related controllers.
     *      The naming for this is not following the convention in order to keep it consistent with the old questionnairesService's naming.
     *      It is also used in cleanUpService.js, notificationsService.js, personalTabController.js
     */

    angular
        .module('OpalApp')
        .factory('Questionnaires', Questionnaires);

    /*
     this factory is named with a s for questionnaire simply to match the existing file name, which is not good
    */
    Questionnaires.$inject = [
        '$sce',
        'Params',
        'QuestionnaireDataService',
        'User',
        'UserAuthorizationInfo',
    ];

    /* @ngInject */
    function Questionnaires($sce, Params, QuestionnaireDataService, User, UserAuthorizationInfo) {
        // constants for DB conventions
        const questionnaireValidStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;
        const questionnaireValidType = Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS;
        const answerSavedInDBValidStatus = Params.ANSWER_SAVED_IN_DB_STATUS;
        const allowedPurpose = Params.QUESTIONNAIRE_PURPOSES;

         // the following are not in the constants file since they concern translation
         const PURPOSE_TITLE_MAP = {
            clinical: 'CLINICAL_QUESTIONNAIRES',
            research: 'RESEARCH_QUESTIONNAIRES',
            consent: 'CONSENT_FORMS',
            default: 'QUESTIONNAIRES',
        };

        const PURPOSE_EMPTY_LIST_MAP = {
            new: {
                clinical: 'QUESTIONNAIRE_NONE_NEW',
                research: 'QUESTIONNAIRE_NONE_NEW',
                consent: 'CONSENT_FORMS_NONE_NEW',
                default: 'QUESTIONNAIRE_NONE_NEW',
            },
            progress: {
                clinical: 'QUESTIONNAIRE_NONE_PROGRESS',
                research: 'QUESTIONNAIRE_NONE_PROGRESS',
                consent: 'CONSENT_FORMS_NONE_PROGRESS',
                default: 'QUESTIONNAIRE_NONE_PROGRESS',
            },
            completed: {
                clinical: 'QUESTIONNAIRE_NONE_COMPLETED',
                research: 'QUESTIONNAIRE_NONE_COMPLETED',
                consent: 'CONSENT_FORMS_NONE_COMPLETED',
                default: 'QUESTIONNAIRE_NONE_COMPLETED',
            }
        };

        const PURPOSE_THANKS_MAP = {
            clinical: 'QUESTIONNAIRE_THANKS',
            research: 'QUESTIONNAIRE_THANKS',
            consent: 'CONSENT_FORM_THANKS',
            default: 'QUESTIONNAIRE_THANKS',
        };

        const PURPOSE_LIST_MAP = {
            clinical: 'QUESTIONNAIRE_GO_BACK_TO_LIST',
            research: 'QUESTIONNAIRE_GO_BACK_TO_LIST',
            consent: 'CONSENT_FORM_GO_BACK_TO_LIST',
            default: 'QUESTIONNAIRE_GO_BACK_TO_LIST',
        }

        const PURPOSE_BEGIN_MAP = {
            clinical: 'QUESTIONNAIRE_BEGIN_INSTRUCTION',
            research: 'QUESTIONNAIRE_BEGIN_INSTRUCTION',
            consent: 'CONSENT_FORM_BEGIN_INSTRUCTION',
            default: 'QUESTIONNAIRE_BEGIN_INSTRUCTION',
        };

        const PURPOSE_RESUME_MAP = {
            clinical: 'QUESTIONNAIRE_RESUME_INSTRUCTION',
            research: 'QUESTIONNAIRE_RESUME_INSTRUCTION',
            consent: 'CONSENT_FORM_RESUME_INSTRUCTION',
            default: 'QUESTIONNAIRE_RESUME_INSTRUCTION',
        };

        const PURPOSE_SUBMIT_BUTTON_MAP = {
            clinical: 'SUBMIT_ANSWERS',
            research: 'SUBMIT_ANSWERS',
            consent: 'SUBMIT_CONSENT',
            default: 'SUBMIT_ANSWERS',
        };

        const PURPOSE_SUBMIT_INSTRUCTION_MAP = {
            clinical: 'QUESTIONNAIRE_SUBMIT_INSTRUCTION',
            research: 'QUESTIONNAIRE_SUBMIT_INSTRUCTION',
            consent: 'CONSENT_FORM_SUBMIT_INSTRUCTION',
            default: 'QUESTIONNAIRE_SUBMIT_INSTRUCTION',
        };

        // constants for the app notifications
        const notifConstants = Params.QUESTIONNAIRE_NOTIFICATION_CONSTANTS;

        // variables for the questionnaire module -- list
        let newQuestionnaires = {};     // keys are the qp_ser_num of questionnaires, contain new questionnaires
        let inProgressQuestionnaires = {};  // keys are the qp_ser_num of questionnaires, contain in progress questionnaires
        let completeQuestionnaires = {};    // keys are the qp_ser_num of questionnaires, contain complete questionnaires

        // variables for the questionnaire module -- one questionnaire
        let currentQuestionnaire = {};
        let carouselItems = [];     // the flattened version of the current questionnaire to be used by the controllers.
                                    // Note that any changes done to the questions in the carousel are reflected back to the currentQuestionnaire since questions is an array and one question is an object.

        // variables for the summary page -- saving answer
        // true if still waiting for an answer to be saved, false otherwise
        let waitingForSavingAnswer = false;

        // Variables for questionnaire notifications
        let currentPurpose = 'default';

        // this is redundant but written for clarity, ordered alphabetically
        return {
            clearAllQuestionnaire: clearAllQuestionnaire,
            findInProgressQuestionIndex: findInProgressQuestionIndex,
            getQuestionnaireBySerNum: getQuestionnaireBySerNum,
            getCarouselItems: () => carouselItems,
            getCurrentQuestionnaire: () => currentQuestionnaire, // getter for the current questionnaire
            getQuestionnaireBackToListByPurpose: (questionnairePurpose = 'default') => PURPOSE_LIST_MAP[questionnairePurpose], //  gets the correct translation key for the questionnaire back to list message. It assumes that the purpose has been validated.
            getQuestionnaireBeginByPurpose: (questionnairePurpose = 'default') => PURPOSE_BEGIN_MAP[questionnairePurpose], // gets the correct translation key for the begin questionnaire instruction. It assumes that the purpose has been validated.
            getQuestionnaireCount: getQuestionnaireCount,
            getQuestionnaireList: getQuestionnaireList,
            getQuestionnaireNoListMessageByPurpose: getQuestionnaireNoListMessageByPurpose,
            getQuestionnaireResumeByPurpose: (questionnairePurpose = 'default') => PURPOSE_RESUME_MAP[questionnairePurpose], // gets the correct translation key for the resume questionnaire instruction. It assumes that the purpose has been validated.
            getQuestionnaireStartUrl: () => notifConstants.QUESTIONNAIRE_URL, // Used by notifications to direct the user to questionnaires
            getQuestionnaireSubmitButtonByPurpose: (questionnairePurpose = 'default') => PURPOSE_SUBMIT_BUTTON_MAP[questionnairePurpose], // gets the correct translation key for the questionnaire submit button. It assumes that the purpose has been validated.
            getQuestionnaireSubmitInstructionByPurpose: (questionnairePurpose = 'default') => PURPOSE_SUBMIT_INSTRUCTION_MAP[questionnairePurpose], // gets the correct translation key for the submit questionnaire instruction. It assumes that the purpose has been validated.
            getQuestionnaireTitleByPurpose: (questionnairePurpose = 'default') => PURPOSE_TITLE_MAP[questionnairePurpose], // gets the correct translation key for the questionnaire title. It assumes that the purpose has been validated.
            getQuestionnaireThankByPurpose: (questionnairePurpose = 'default') => PURPOSE_THANKS_MAP[questionnairePurpose], // gets the correct translation key for the questionnaire thank you message. It assumes that the purpose has been validated.
            isWaitingForSavingAnswer: () => waitingForSavingAnswer,
            updateQuestionnaireStatus: updateQuestionnaireStatus,
            requestQuestionnaireStubFromSerNum: requestQuestionnaireStubFromSerNum,
            formatQuestionnaireStub: formatQuestionnaireStub,
            requestQuestionnaire: requestQuestionnaire,
            requestQuestionnairePurpose: (qp_ser_num) => QuestionnaireDataService.requestQuestionnairePurpose(qp_ser_num), // gets the purpose of a given questionnaire from its qp_ser_num or answerQuestionnaireId
            saveQuestionnaireAnswer: saveQuestionnaireAnswer,
            validateQuestionnairePurpose: (questionnairePurpose) => allowedPurpose.includes(questionnairePurpose.toLowerCase()), // check whether the questionnaire purpose is valid (true if it is valid, false otherwise)
            setQuestionnaireList: setQuestionnaireList,
            updateQuestionnaireList: updateQuestionnaireList,

        };

        /**
         * @name findInProgressQuestionIndex
         * @desc this function is used to find the index of the question for the in progress current questionnaires,
         *      i.e. if in progress, find the place where the user left off at
         *      This is used in 2 locations, namely when an in progress is resumed, or when the user wants to edit a question in the summary page
         * @param {boolean} editQuestion if True, then it is used for when the user comes from the summary page, otherwise, the user is resuming a questionnaire
         * @param {int} sectionIndex the index of the wanted section
         * @param {int} questionIndex the index of the wanted question
         * @return {object} this object contain the startIndex (-1 if all questions are answered), sectionIndex, and the questionIndex
         */
        function findInProgressQuestionIndex(editQuestion, sectionIndex, questionIndex){
            let startIndex = 0; // this variable denotes where to restart the questionnaire

            if (!editQuestion){
                startIndex ++;  // this is for the questionnaire home page index

                for (let i = 0; i < currentQuestionnaire.sections.length; i++){
                    sectionIndex = i;

                    // note: uncomment the following line for when multi-section questionnaires are available in OpalAdmin
                    // startIndex ++;  // add one to index to count for the section in the carousel

                    for (let j = 0; j < currentQuestionnaire.sections[i].questions.length; j++){

                        // end as soon as find a question with no answer
                        if (currentQuestionnaire.sections[i].questions[j].patient_answer.is_defined === '0') {

                            questionIndex = j;

                            i = currentQuestionnaire.sections.length; // this will end the outer loop
                            break;
                        }

                        startIndex ++;
                    }

                    // if all questions have been answered (outer loop completed, inner loop not breaked (i.e. i != sections.length))
                    if (i === currentQuestionnaire.sections.length-1){
                        startIndex = -1;
                    }
                }
            }else{
                // this is coming from the summary page, so be respectful for sectionIndex and questionIndex

                startIndex ++;  // this is for the questionnaire home page index

                for (let i = 0; i < currentQuestionnaire.sections.length; i++){
                    // note: uncomment the following line for when multi-section questionnaires are available in OpalAdmin
                    // startIndex ++;  // this is for the number of sections to reach the wanted section

                    if (i !== sectionIndex){
                        // this is for the number of questions in that section
                        startIndex += currentQuestionnaire.sections[i].questions.length;
                    }else{
                        startIndex += questionIndex;  // this is for the number of questions up to the wanted question
                    }
                }
            }

            return {
                'startIndex': startIndex,
                'sectionIndex': sectionIndex,
                'questionIndex': questionIndex
            };
        }

        /**
         * @desc Finds and returns a questionnaire from one of the three questionnaire lists.
         * @param qpSerNum The qp_ser_num of the questionnaire to find.
         * @returns {object|undefined} The questionnaire, or undefined if it wasn't found.
         */
        function getQuestionnaireBySerNum(qpSerNum) {
            for (let status of Object.values(questionnaireValidStatus)) {
                if (getQuestionnaireMap(status).hasOwnProperty(qpSerNum)) return getQuestionnaireMap(status)[qpSerNum];
            }
        }

        /**
         * @name requestQuestionnaireStubFromSerNum
         * @description Gets the basic information concerning a questionnaire stored in the OpalDB from its SerNum
         *              In particular, gets the qp_ser_num (answerQuestionnaireId) of that questionnaire,
         *              which allows the questionnaire to be found in the questionnaireDB.
         *              This information is also saved to the appropriate list in this service.
         * @param {string|int} questionnaireSerNum The SerNum of the questionnaire to look up.
         * @returns {Promise<Object>} Resolves to the basic information (questionnaire stub) for the given questionnaire.
         */
        async function requestQuestionnaireStubFromSerNum(questionnaireSerNum) {
            let questionnaireStub = await QuestionnaireDataService.requestQuestionnaireStubFromSerNum(questionnaireSerNum);
            // Add the questionnaire stub to this service
            setQuestionnaireList([questionnaireStub], false);
            return questionnaireStub;
        }

        /**
         * @name requestQuestionnaire
         * @desc this function request one single questionnaire from the data service and set it as the current questionnaire
         * @param {int} answerQuestionnaireId this is the qp_ser_num or the answerQuestionnaireId for the DB (unique identifier for a questionnaire sent to a user)
         * @returns {Promise}
         */
        async function requestQuestionnaire(answerQuestionnaireId){

            // if the current questionnaire is requested, return it.
            if (currentQuestionnaire.qp_ser_num === answerQuestionnaireId) return {Success: true, Location: 'App'};

            // re-initiate the current questionnaire related variables
            clearCurrentQuestionnaire();
            const responseQuestionnaire = await QuestionnaireDataService.requestQuestionnaire(answerQuestionnaireId);
            setQuestionnaire(responseQuestionnaire);
            return {Success: true, Location: 'Server'};
        }

        /**
         * @name updateQuestionnaireStatus
         * @desc this function updates the status of a given questionnaire in the app and also in the database.
         *       Note that this function does not do any input check. It is relayed to the helper functions
         * @param {int} answerQuestionnaireId ID of particular questionnaire received by patient
         * @param {int} newStatus the new status to be updated in
         * @param {int} oldStatus the old status of the questionnaire
         * @return {Promise}
         *
         */
        async function updateQuestionnaireStatus(answerQuestionnaireId, newStatus, oldStatus) {
                let userInfo = User.getUserInfo();

                let response = await QuestionnaireDataService.updateQuestionnaireStatus(answerQuestionnaireId, newStatus, userInfo);

                let isFailure = updateAppQuestionnaireStatus(answerQuestionnaireId, newStatus, oldStatus, userInfo);

                if (!isFailure) {
                    throw new Error("Error updating status internal to app");
                }

                return { Success: true, Location: 'Server', QuestionnaireSerNum: response?.QuestionnaireSerNum};
        }

        /**
         * @name saveQuestionnaireAnswer
         * @desc This function saves the answer for a single question (even if it is skipped). The type verification is done in the function called
         * @param {int} answerQuestionnaireId
         * @param {int} sectionId
         * @param {object} question
         * @param {int} isSkipped
         * @returns {Promise}
         */
        function saveQuestionnaireAnswer(answerQuestionnaireId, sectionId, question, isSkipped){

            return new Promise(function(resolve, reject){
                // if the answer has been changed then save it, otherwise ignore
                if (!question.hasOwnProperty("answerChangedFlag") || typeof question.answerChangedFlag === 'undefined' || !question.answerChangedFlag){
                    resolve();
                }

                let questionId = question.question_id;
                let questionSectionId = question.questionSection_id;
                let answerArray = question.patient_answer.answer;
                let questionTypeId = question.type_id;
                let isSuccess = true;

                // the app knows that the answer is invalid, but still would like to save the answer (that the user has answered but not chosen an answer).
                // The app should not submit the questionnaire no matter if the DB has received it or not.
                // This check is here to avoid overwriting the flag saying that the answer is invalid
                if (question.patient_answer.is_defined !== answerSavedInDBValidStatus.ANSWER_INVALID){
                    isSuccess = toggleIsDefinedFlag(question, answerSavedInDBValidStatus.ANSWER_SAVING_WAITING);
                }

                if (!isSuccess){
                    reject({Success: false, Location: '', Error: "Error updating answer status internal to app"});
                }

                // tell the summary page that the answer is waiting to be saved
                waitingForSavingAnswer = true;

                QuestionnaireDataService.saveQuestionnaireAnswer(answerQuestionnaireId, sectionId, questionId, questionSectionId, answerArray, questionTypeId, isSkipped)
                    .then(function (response) {
                        // stop the execution of setTimeout() if we got a response
                        clearTimeout(timeOut);

                        // sync the save answer in app
                        isSuccess = saveAppQuestionnaireAnswer(answerQuestionnaireId, sectionId, questionId, questionSectionId, answerArray, isSkipped);
                        if (!isSuccess){
                            reject({Success: false, Location: '', Error: "Error updating status internal to app"});
                        }

                        waitingForSavingAnswer = false;

                        // verify that the saving answer is successful
                        if (response.hasOwnProperty('Success') && response.Success){

                            // This check is here to avoid overwriting the flag saying that the answer is invalid
                            if (question.patient_answer.is_defined !== answerSavedInDBValidStatus.ANSWER_INVALID){
                                isSuccess = toggleIsDefinedFlag(question, answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED);
                            }

                            if (!isSuccess){
                                reject({Success: false, Location: '', Error: "Error updating answer status internal to app"});
                            }else{
                                resolve({Success: true, Location: 'Server'});
                            }
                        }else{
                            // saving answer non successful

                            // This check is here to avoid overwriting the flag saying that the answer is invalid.
                            // Since the answer is not really valid, we do not really care about the backend status. May be changed later.
                            if (question.patient_answer.is_defined !== answerSavedInDBValidStatus.ANSWER_INVALID){
                                toggleIsDefinedFlag(question, answerSavedInDBValidStatus.ANSWER_SAVING_ERROR);
                            }

                            reject({Success: false, Location: '', Error: response});
                        }
                    })
                    .catch(function (error) {
                        // stop the execution of setTimeout() if we got a response
                        clearTimeout(timeOut);

                        waitingForSavingAnswer = false;

                        // This check is here to avoid overwriting the flag saying that the answer is invalid.
                        // Since the answer is not really valid, we do not really care about the backend status. May be changed later.
                        if (question.patient_answer.is_defined !== answerSavedInDBValidStatus.ANSWER_INVALID){
                            toggleIsDefinedFlag(question, answerSavedInDBValidStatus.ANSWER_SAVING_ERROR);
                        }

                        let errorToReject = error.hasOwnProperty('Location') ? error : {Success: false, Location: '', Error: error};
                        reject(errorToReject);
                    });

                // timeout for saving answer so we do not wait forever
                const timeOut = setTimeout(function(){
                        waitingForSavingAnswer = false;

                        // This check is here to avoid overwriting the flag saying that the answer is invalid.
                        // Since the answer is not really valid, we do not really care about the backend status. May be changed later.
                        if (question.patient_answer.is_defined !== answerSavedInDBValidStatus.ANSWER_INVALID){
                            toggleIsDefinedFlag(question, answerSavedInDBValidStatus.ANSWER_SAVING_ERROR);
                        }

                        reject({Success: false, Location: 'questionnairesService.js: saveQuestionnaireAnswer', Error: 'timeout'});
                    },
                    answerSavedInDBValidStatus.ANSWER_SAVING_WAITING_TIME);
            });
        }

        /**
         * @name getQuestionnaireNoListMessageByPurpose
         * @desc gets the correct translation key for the message when there is no questionnaires in the list.
         *       It assumes that the purpose has been validated.
         * @param {int} status
         * @param {string} questionnairePurpose
         * @returns {string}
         */
        function getQuestionnaireNoListMessageByPurpose(status, questionnairePurpose = 'default') {
            switch (status) {
                case questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS:
                    return PURPOSE_EMPTY_LIST_MAP.new[questionnairePurpose];

                case questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS:
                    return PURPOSE_EMPTY_LIST_MAP.progress[questionnairePurpose];

                case questionnaireValidStatus.COMPLETED_QUESTIONNAIRE_STATUS:
                    return PURPOSE_EMPTY_LIST_MAP.completed[questionnairePurpose];

                default:
                    return PURPOSE_EMPTY_LIST_MAP.new['default'];
            }
        }

        /**
         * @name getQuestionnaireMap
         * @desc Returns the map of questionnaires according to the given status.
         *       For example, for the "in progress" status, returns the map of in progress questionnaires.
         * @param {number} status - The status for which to get the map of questionnaires.
         * @returns {Object} An object mapping from qp_ser_num to questionnaires (see the service's variables for details).
         */
        function getQuestionnaireMap(status) {
            switch (status) {
                case questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS: return newQuestionnaires;
                case questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS: return inProgressQuestionnaires;
                case questionnaireValidStatus.COMPLETED_QUESTIONNAIRE_STATUS: return completeQuestionnaires;
                default: throw new Error(`Requested questionnaire list for invalid status: ${status}`);
            }
        }

        /**
         * @name getQuestionnaireList
         * @desc This function gets the list of questionnaires according to the status given.
         * @param {Number} status
         * @return {object} The object containing the questionnaires with the given status
         */
        function getQuestionnaireList(status){
            try {
                return Object.values(getQuestionnaireMap(status));
            }
            catch (err) {
                console.error("invalid type of questionnaire requested from questionnairesService.js", err);
                return [];
            }
        }

        /**
         * @name getQuestionnaireCount
         * @desc this public function gives the number of questionnaires which is of the type given
         * @param {int} type the type of questionnaire, i.e. new, progress, completed, in int.
         * @returns {int} the number of questionnaires belonging to that type. If the type is not found, return 0 which will mean that the type has 0 questionnaire
         */
        function getQuestionnaireCount(type){
            try {
                return Object.keys(getQuestionnaireMap(type)).length;
            }
            catch (err) {
                console.error(err);
                return 0;
            }
        }

        /**
         * @name clearAllQuestionnaire
         * @desc this function re-initiate all the questionnaires related variables. Also used in cleanUpService.js
         */
        function clearAllQuestionnaire(){
            newQuestionnaires = {};
            inProgressQuestionnaires = {};
            completeQuestionnaires = {};

            clearCurrentQuestionnaire();
        }


        /**
         * @name setCarouselItems
         * @desc Flatten the current questionnaire object such that the carousel can use it. Also checks for properties.
         *      Note: this assumes that the questionnaire is ordered when sent by the listener
         */
        function setCarouselItems(){
            carouselItems = [];

            // the top level properties are already checked by setQuestionnaire (when we first get the questionnaire)

            // loop through sections
            for (let i = 0; i < currentQuestionnaire.sections.length; i++) {

                // check for properties
                if (!verifySectionProperty(currentQuestionnaire.sections[i])){
                    console.error("ERROR: cannot format carousel item because the section's property is not conforming to the correct format");
                    break;
                    // TODO: error handling: preferably going back to the questionnaire list and display an error message for the user to try again in some amount of time
                }

                // Note: the following should be uncommented for when the questionnaire has more than 1 section in OpalAdmin
                //
                // currentQuestionnaire.sections[i].section_position = parseInt(currentQuestionnaire.sections[i].section_position);
                //
                // // format carousel
                // let sectionObjectForCarousel = {
                //     type: 'section',
                //     position: currentQuestionnaire.sections[i].section_position,
                //     instruction: currentQuestionnaire.sections[i].section_instruction,
                //     title: currentQuestionnaire.sections[i].section_title
                // };
                //
                // carouselItems.push(sectionObjectForCarousel);


                // loop through questions
                for (let j = 0; j < currentQuestionnaire.sections[i].questions.length; j++) {

                    currentQuestionnaire.sections[i].questions[j].type_id = parseInt(currentQuestionnaire.sections[i].questions[j].type_id);

                    // initialize the array for inputting answers if the question is new
                    if (!currentQuestionnaire.sections[i].questions[j].patient_answer.hasOwnProperty('answer')) {
                        currentQuestionnaire.sections[i].questions[j].patient_answer.answer = [];
                    }else if (!Array.isArray(currentQuestionnaire.sections[i].questions[j].patient_answer.answer)){
                        // verify that answer is an array
                        console.error("ERROR: cannot format carousel item because the answers have the wrong format");

                        // TODO: error handling
                    }

                    // check for properties
                    if (!verifyQuestionProperty(currentQuestionnaire.sections[i].questions[j])){

                        console.error("ERROR: cannot format carousel item because the questions do not have the required properties");

                        i = currentQuestionnaire.sections.length;   // break the outer loop too
                        break;  // break inner loop

                        // TODO: error handling: preferably going back to the questionnaire list and display an error message for the user to try again in some amount of time
                    }

                    currentQuestionnaire.sections[i].questions[j].question_position = parseInt(currentQuestionnaire.sections[i].questions[j].question_position);

                    // format carousel for question
                    carouselItems.push(
                        {
                            type: 'question',
                            data: currentQuestionnaire.sections[i].questions[j],
                        }
                    );
                }
            }
        }

        /**
         * @name setQuestionnaire
         * @desc setter for the current questionnaire. It also verifies its outer layer properties. Then it sets the carousel items for the current questionnaire
         * @param questionnaire
         */
        function setQuestionnaire(questionnaire){
            if(verifyQuestionnaireProperty(questionnaire)){
                currentQuestionnaire = questionnaire;
            }else{
                console.error('error in the questionnaire format');
                clearCurrentQuestionnaire();
                // TODO: error handling: preferably going back to the questionnaire list and display an error message for the user to try again in some amount of time
            }

            setCarouselItems();
        }

        /**
         * @name formatQuestionnaireStub
         * @desc Validates and formats a questionnaire stub (as received by the listener).
         *       Questionnaire stubs contain enough information to make up the initial questionnaire list, but don't
         *       contain the complete information for each questionnaire.
         * @param {object} questionnaireStub The questionnaire stub to format and validate.
         * @throws Throws an error if the questionnaire stub is missing any required properties.
         */
        function formatQuestionnaireStub(questionnaireStub){
            // Check for the required properties
            let properties = ['created', 'last_updated', 'nickname', 'qp_ser_num', 'questionnaire_id', 'status', 'respondent_id'];
            properties.forEach(prop => {
                if (!questionnaireStub.hasOwnProperty(prop)) throw new Error(`Questionnaire stub is missing a required property: ${prop}; qp_ser_num = ${questionnaireStub.qp_ser_num}`);
            });

            // Format and validate the questionnaire's integer properties
            const intProperties = ['status', 'respondent_id'];
            intProperties.forEach(prop => {
                const intProp = parseInt(questionnaireStub[prop]);
                if (isNaN(intProp)) throw new Error(`Questionnaire stub's '${prop}' cannot be parsed as an int: ${questionnaireStub[prop]}; qp_ser_num = ${questionnaireStub.qp_ser_num}`);
                questionnaireStub[prop] = intProp;
            });

            // Format and validate the questionnaire's date properties
            const dateProperties = ['completed_date', 'created', 'last_updated'];
            dateProperties.forEach(prop => {
                // Only format date properties that were provided and that haven't been formatted already (must still be strings)
                if (typeof questionnaireStub[prop] === 'string') {
                    const dateProp = Date.parse(questionnaireStub[prop]);
                    if (isNaN(dateProp)) throw new Error(`Questionnaire stub's '${prop}' cannot be parsed as a date: ${questionnaireStub[prop]}; qp_ser_num = ${questionnaireStub.qp_ser_num}`);
                    questionnaireStub[prop] = dateProp;
                }
            });
        }

        /**
         * @name verifyQuestionnaireProperty
         * @desc This private function verify the format and the property of the outer layer of the questionnaire object.
         * @param {object} questionnaire the object to be verified
         * @returns {boolean} false if the questionnaire did not pass the check, true otherwise
         */
        function verifyQuestionnaireProperty(questionnaire){
            // note that the many if statements are indeed redundant, but were written for future error handling according to error cases

            // check for properties
            if (!questionnaire.hasOwnProperty('sections') || !questionnaire.hasOwnProperty('description') || !questionnaire.hasOwnProperty('instruction') ||
                !questionnaire.hasOwnProperty('qp_ser_num') || !questionnaire.hasOwnProperty('nickname') || !questionnaire.hasOwnProperty('questionnaire_id') ||
                !questionnaire.hasOwnProperty('status') || !questionnaire.hasOwnProperty('allow_questionnaire_feedback') || !questionnaire.hasOwnProperty('logo')){
                // allow_questionnaire_feedback is not used for now, but included for future

                return false;
            }

            // set the questionnaire status to an integer for easier comparison
            questionnaire.status = parseInt(questionnaire.status);
            if (isNaN(questionnaire.status) || !Array.isArray(questionnaire.sections)) return false;

            return true;
        }

        /**
         * @name verifySectionProperty
         * @desc verify properties that the section should have.
         * @param {object} section a section of a questionnaire
         * @returns {boolean} if the section matches the format then return true, else false
         */
        function verifySectionProperty(section){
            // note that the many if statements are indeed redundant, but were written for future error handling according to error cases

            if (!section.hasOwnProperty('questions') || !section.hasOwnProperty('section_id') ||
                !section.hasOwnProperty('section_instruction') || !section.hasOwnProperty('section_position') ||
                !section.hasOwnProperty('section_title')){

                return false;
            }

            if (!Array.isArray(section.questions)) return false;
            return true;
        }

        /**
         * @name verifyQuestionProperty
         * @desc verify the properties of questions, as well as the options and answers for it. Also sort the options according to their orders.
         * @param {object} question
         * @returns {boolean} true if pass all checks, false otherwise
         */
        function verifyQuestionProperty(question) {
            // note that the many if statements are indeed redundant, but were written for future error handling according to error cases

            if (!question.hasOwnProperty('allow_question_feedback') ||
                !question.hasOwnProperty('optional') ||
                !question.hasOwnProperty('options') ||
                !question.hasOwnProperty('polarity') ||
                !question.hasOwnProperty('questionSection_id') ||
                !question.hasOwnProperty('question_position') ||
                !question.hasOwnProperty('question_text') ||
                !question.hasOwnProperty('question_display') ||
                !question.hasOwnProperty('section_id') ||
                !question.hasOwnProperty('type_id')){
                // section_id is not really needed, if troublesome delete it from the checklist of properties
                console.error('ERROR: question does not have the required property');

                return false;
            }

            if (isNaN(parseInt(question.type_id))){
                console.error("ERROR: the question's type_id is not valid");
                return false;
            }

            if (!verifyOptionsProperty(question)){
                console.error("ERROR: the question's options does not have the required properties");
                return false;
            }

            if (!verifyPatientAnswerProperty(question)){
                console.error("ERROR: the question's answer does not pass the property check");
                return false;
            }

            return true;
        }

        /**
         * @name verifyPatientAnswerProperty
         * @desc this function is used to verify the properties of the array answer.
         * @param {object} question
         * @returns {boolean} true if no error, false otherwise
         */
        function verifyPatientAnswerProperty(question){
            let isError = false;

            if (!question.hasOwnProperty('patient_answer') ||
                !question.patient_answer.hasOwnProperty('is_defined') ||
                !question.patient_answer.hasOwnProperty('answer') ||
                !Array.isArray(question.patient_answer.answer)){

                return isError;
            }

            if (question.type_id !== questionnaireValidType.CHECKBOX_TYPE_ID && question.type_id !== questionnaireValidType.RADIOBUTTON_TYPE_ID){

                // patient_answer.answer should be initialized when formatting the data
                if (question.patient_answer.answer.length === 0){
                    // this is a question untouched before (i.e. not even in the DB) nor in the current session of the front-end
                    question.patient_answer.answer.push({answer_value:''});
                    return !isError;
                }

                // Now that this question has an answer, verify that there is only one answer, which should be for, as of January 2020, textbox, radio button, slider, time, date questions
                if (question.patient_answer.answer.length !== 1){
                    return isError;
                }
            }

            // this will only loop once except for checkbox and label types
            for (let i = 0; i < question.patient_answer.answer.length; i++){

                // verify that it has the correct property
                if (!question.patient_answer.answer[i].hasOwnProperty('answer_value')){
                    if (parseInt(question.patient_answer.is_defined)){
                        // TODO: this mean backend error or DB is missing information. What should the qplus report to the backend?
                        // this if statement is here since the migration did not migrate the answers along, so most of the questions do not have answer. This should be careful when error handling

                        question.patient_answer.answer[i].answer_value = '';
                    }else {
                        // this means that the question has an answer, but is not defined (i.e. not sent from backend) and do not have an answer_value property. This should not happen
                        return isError;
                    }
                }
            }

            return !isError;
        }

        /**
         * @name verifyOptionsProperty
         * @desc this function is used to verify the properties of the array options and order them according to their order property.
         * @param {object} question
         * @returns {boolean} true if pass all checks, false otherwise
         */
        function verifyOptionsProperty(question){
            let isError = false;

            // verify that options is an array
            if (!Array.isArray(question.options)){
                return isError;
            }

            // textbox needs a special property called char_limit
            if (question.type_id === questionnaireValidType.TEXTBOX_TYPE_ID){
                if(question.options.length !== 1 || !question.options[0].hasOwnProperty('char_limit') || !question.options[0].hasOwnProperty('option_text')){
                    return isError;
                }else{
                    return !isError;
                }
            }

            // check properties for slider
            if (question.type_id === questionnaireValidType.SLIDER_TYPE_ID){
                if (question.options.length !== 1 || !question.options[0].hasOwnProperty('min_value') || !question.options[0].hasOwnProperty('max_value') ||
                    !question.options[0].hasOwnProperty('min_caption') || !question.options[0].hasOwnProperty('max_caption') ||
                    !question.options[0].hasOwnProperty('increment')){
                    // maybe the options must be an array can be transformed into a better error handling than the rest, i.e. transform it into an array
                    // maybe the options.length !== 1 is an overdoing but otherwise the function should not be called (b/c the question is not an array)
                    return isError;
                }else{
                    return !isError;
                }
            }

            // verify properties of the objects in options array
            for (let i = 0; i < question.options.length; i++){
                if(!question.options[i].hasOwnProperty('option_id') || !question.options[i].hasOwnProperty('option_text') || !question.options[i].hasOwnProperty('order')){
                    return isError;
                }

                // 2 additional fields to verify if it is a checkbox question
                if (question.type_id === questionnaireValidType.CHECKBOX_TYPE_ID && (!question.options[i].hasOwnProperty('minAnswer') || !question.options[i].hasOwnProperty('maxAnswer'))){
                    return isError;
                }

                question.options[i].order = parseInt(question.options[i].order);
            }

            // order the option array according to the property order of the object
            // note that this change will reflect back to the calling function(s) since question is an object
            question.options.sort((a,b) => (parseInt(a.order) > parseInt(b.order) ? 1: -1));

            return !isError;
        }

        /**
         * @name updateAppQuestionnaireStatus
         * @desc this function updates the app's status of a single questionnaire received by the patient
         * @param {int} answerQuestionnaireId ID of particular questionnaire received by patient
         * @param {int} newStatus the new status to be updated in
         * @param {int} oldStatus the old status of the questionnaire. If this parameter is non-existent then the function has to check if the questionnaire exist in every object.
         * @return {boolean} true if success, false if failure
         */
        function updateAppQuestionnaireStatus (answerQuestionnaireId, newStatus, oldStatus, userProfile){
            let questionnaire_to_be_updated;

            // verify status
            if (!verifyStatus(newStatus)){
                console.error("ERROR: error in updating the questionnaire status, the status is not valid");
                return false;
            }

            if (!verifyStatus(oldStatus)){
                // find out where the old status is and clean up
                if (newQuestionnaires.hasOwnProperty(answerQuestionnaireId)) {
                    questionnaire_to_be_updated = Object.assign({}, newQuestionnaires[answerQuestionnaireId]);
                    delete newQuestionnaires[answerQuestionnaireId];

                }else if (inProgressQuestionnaires.hasOwnProperty(answerQuestionnaireId)){
                    questionnaire_to_be_updated = Object.assign({}, inProgressQuestionnaires[answerQuestionnaireId]);
                    delete inProgressQuestionnaires[answerQuestionnaireId];

                }else if (completeQuestionnaires.hasOwnProperty(answerQuestionnaireId)){
                    questionnaire_to_be_updated = Object.assign({}, completeQuestionnaires[answerQuestionnaireId]);
                    delete completeQuestionnaires[answerQuestionnaireId];

                }else{
                    console.error("ERROR: error in updating the questionnaire status, it does not exist in the existing questionnaires arrays");
                    return false;
                }
            }else{
                // we know the old status -> clean up old status
                switch (oldStatus) {
                    case questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS:
                        questionnaire_to_be_updated = Object.assign({}, newQuestionnaires[answerQuestionnaireId]);
                        delete newQuestionnaires[answerQuestionnaireId];
                        break;

                    case questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS:
                        questionnaire_to_be_updated = Object.assign({}, inProgressQuestionnaires[answerQuestionnaireId]);
                        delete inProgressQuestionnaires[answerQuestionnaireId];
                        break;

                    case questionnaireValidStatus.COMPLETED_QUESTIONNAIRE_STATUS:
                        questionnaire_to_be_updated = Object.assign({}, completeQuestionnaires[answerQuestionnaireId]);
                        delete completeQuestionnaires[answerQuestionnaireId];
                        break;

                    default:
                        console.error("ERROR: error in updating the questionnaire status, it does not have a valid new status");
                        return false;
                }
            }

            // update the status of the questionnaire
            questionnaire_to_be_updated.status = newStatus;
            questionnaire_to_be_updated.respondent_display_name = `${userProfile.first_name} ${userProfile.last_name}`;

            // re-classify the questionnaire
            switch (newStatus) {
                case questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS:
                    newQuestionnaires[answerQuestionnaireId] = questionnaire_to_be_updated;
                    break;

                case questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS:
                    inProgressQuestionnaires[answerQuestionnaireId] = questionnaire_to_be_updated;
                    break;

                case questionnaireValidStatus.COMPLETED_QUESTIONNAIRE_STATUS:
                    completeQuestionnaires[answerQuestionnaireId] = questionnaire_to_be_updated;
                    break;

                default:
                    console.error("ERROR: error in updating the questionnaire status, it does not have a valid new status");
                    return false;
            }

            // update the current questionnaire status
            if (currentQuestionnaire.qp_ser_num === answerQuestionnaireId && currentQuestionnaire.status === oldStatus){
                currentQuestionnaire.status = newStatus;
            }

            // change the last update time for the current questionnaire
            updateAppQuestionnaireLastUpdated(currentQuestionnaire.qp_ser_num, currentQuestionnaire.status);

            return true;
        }

        /**
         * @name updateAppQuestionnaireLastUpdated
         * @desc This private function helps update the last updated time for the list of questionnaire. The last updated will have ISO 8601 format and have zero UTC offset
         * @param {int} qp_ser_num the qp_ser_num or the answerQuestionnaireId of the questionnaire to be updated
         * @param {number} status the status of the questionnaire to be updated
         * @returns {boolean} true if success, false otherwise
         */
        function updateAppQuestionnaireLastUpdated(qp_ser_num, status){
            try {
                let now = new Date();
                let questionnaires = getQuestionnaireMap(status);
                questionnaires[qp_ser_num].last_updated = now.toISOString();
                return true;
            }
            catch (error) {
                console.error("Error updating a questionnaire's 'last_updated' attribute", error);
                return false;
            }
        }

        /**
         * @name verifyStatus
         * @desc This function verifies if a status is existent for
         * @param {int} status
         * @returns {boolean} true if the status is a valid one for the current implementation, false otherwise.
         */
        function verifyStatus(status){
            // flag for check
            let isStatusCorrect = false;

            // verify for valid status
            for (let allowedStatus in questionnaireValidStatus){
                if (questionnaireValidStatus[allowedStatus] === status){
                    isStatusCorrect = true;
                    break;
                }
            }

            return isStatusCorrect;
        }

        /**
         * @name clearCurrentQuestionnaire
         * @desc This private function re-initiate the current questionnaire
         */
        function clearCurrentQuestionnaire(){
            currentQuestionnaire = {};
        }

        /**
         * @name setQuestionnaireList
         * @desc Processes an array of questionnaires from the listener and saves it in this service.
         *       By default, any previously added questionnaires are overwritten, but this can be disabled to
         *       just add new questionnaires to the existing list.
         * @param {Object[]} questionnaireList - An array of questionnaires, as provided by the listener.
         * @param {boolean} [clearExisting] - Optional, defaults to true; indicates whether to clear away all previously
         *                                    added questionnaires.
         */
        function setQuestionnaireList(questionnaireList, clearExisting=true) {
            // Validate input
            if (!Array.isArray(questionnaireList)) throw new Error('Failed setting or updating questionnaire list; did not get an array from the listener.');

            if (clearExisting) clearAllQuestionnaire();

            questionnaireList.forEach(questionnaire => {
                try {
                    formatQuestionnaireStub(questionnaire);

                    // Delete any existing old copies of the same questionnaire
                    // This ensures that if a questionnaire changes status, the old copy in the other status list is removed
                    for (let status of Object.values(questionnaireValidStatus)) {
                        delete getQuestionnaireMap(status)[questionnaire.qp_ser_num];
                    }

                    // Save the questionnaire in the appropriate map according to its status
                    getQuestionnaireMap(questionnaire.status)[questionnaire.qp_ser_num] = questionnaire;

                    // If the current questionnaire has been updated, clear it to force the contents to be re-downloaded from the server
                    if (currentQuestionnaire.qp_ser_num === questionnaire.qp_ser_num) clearCurrentQuestionnaire();
                }
                catch (err) {
                    console.error('Questionnaire stub failed validation; not including it.', err, questionnaire);
                }
            });
        }

        /**
         * @name updateQuestionnaireList
         * @desc Processes an array of updated questionnaires from the listener and uses it to update this service.
         *             Values with the same qp_ser_num are overwritten; the rest are left untouched.
         * @param {Object[]} updatedQuestionnaireList - An array of new or updated questionnaires, as provided by the listener.
         */
        function updateQuestionnaireList(updatedQuestionnaireList) {
            setQuestionnaireList(updatedQuestionnaireList, false);
        }

        /**
         * @name saveAppQuestionnaireAnswer
         * @desc This function is used to save a question's answer for the current questionnaire inside the app.
         *      Since all the changes done to the carousel questions are reflected to the currentQuestionnaire, we do not need to update the currentQuestionnaire object explicitly.
         *      We still need to update the lastUpdated date and prepare the flat which confirms that the answer being saved into the DB (the flag is_defined)
         * @param {int} answerQuestionnaireId
         * @param {int} sectionId
         * @param {int} questionId
         * @param {int} questionSectionId
         * @param {array} answerArray
         * @param {int} isSkipped
         * @returns {boolean} true if success, false otherwise
         */
        function saveAppQuestionnaireAnswer(answerQuestionnaireId, sectionId, questionId, questionSectionId, answerArray, isSkipped){
            const SUCCESS = true;

            // check if we are saving for the current questionnaire
            if (currentQuestionnaire.qp_ser_num !== answerQuestionnaireId){
                console.error("ERROR: not saving for the current questionnaire");
                return !SUCCESS;
            }

            // Update the questionnaire last updated in the app. Any questionnaire needing answers to be saved should be in progress.
            updateAppQuestionnaireLastUpdated(answerQuestionnaireId, questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS);

            return SUCCESS;
        }

        /**
         * @name toggleIsDefinedFlag
         * @desc this private function serves to modify the flag is_defined for a question's answer
         * @param {object} question the question itself
         * @param {string} status the status to be changed to. This should be one of the valid status for saving answer
         * @returns {boolean} true if success, false otherwise
         */
        function toggleIsDefinedFlag(question, status){
            // verify validity of the status
            let isStatusValid = false;

            for (let validStatus in answerSavedInDBValidStatus){
                if (status === answerSavedInDBValidStatus[validStatus]){
                    isStatusValid = true;
                    break;
                }
            }

            if (!isStatusValid){
                console.error('the status of the saving answer process is invalid');
                return false;
            }

            question.patient_answer.is_defined = status;
            return true;
        }


    }
})();
