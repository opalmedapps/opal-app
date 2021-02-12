(function() {
    'use strict';

    /**
     * @name Questionnaires
     * @desc This is the factory (service) for all the questionnaire related controllers.
     *      The naming for this is not following the convention in order to keep it consistent with the old questionnairesService's naming.
     *      It is also used in cleanUpService.js, notificationsService.js, personalTabController.js
     */

    angular
        .module('MUHCApp')
        .factory('Questionnaires', Questionnaires);

    /*
     this factory is named with a s for questionnaire simply to match the existing file name, which is not good
    */
    Questionnaires.$inject = [
        '$sce',
        'Params',
        'QuestionnaireDataService',
    ];

    /* @ngInject */
    function Questionnaires($sce, Params, QuestionnaireDataService) {
        // constants for DB conventions
        const questionnaireValidStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;
        const questionnaireValidType = Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS;
        const answerSavedInDBValidStatus = Params.ANSWER_SAVED_IN_DB_STATUS;
        const allowedCategory = Params.QUESTIONNAIRE_CATEGORIES;

        // the following are not in the constants file since they concern translation
        const CATEGORY_TITLE_MAP = {
            clinical: 'CLINICAL_QUESTIONNAIRES',
            research: 'RESEARCH_QUESTIONNAIRES',
            consent: 'CONSENT_FORMS',
            default: 'QUESTIONNAIRES',
        };

        const CATEGORY_EMPTY_LIST_MAP = {
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

        const CATEGORY_THANKS_MAP = {
            clinical: 'QUESTIONNAIRE_THANKS',
            research: 'QUESTIONNAIRE_THANKS',
            consent: 'CONSENT_FORM_THANKS',
            default: 'QUESTIONNAIRE_THANKS',
        };

        const CATEGORY_LIST_MAP = {
            clinical: 'QUESTIONNAIRE_GO_BACK_TO_LIST',
            research: 'QUESTIONNAIRE_GO_BACK_TO_LIST',
            consent: 'CONSENT_FORM_GO_BACK_TO_LIST',
            default: 'QUESTIONNAIRE_GO_BACK_TO_LIST',
        }

        const CATEGORY_BEGIN_MAP = {
            clinical: 'QUESTIONNAIRE_BEGIN_INSTRUCTION',
            research: 'QUESTIONNAIRE_BEGIN_INSTRUCTION',
            consent: 'CONSENT_FORM_BEGIN_INSTRUCTION',
            default: 'QUESTIONNAIRE_BEGIN_INSTRUCTION',
        };

        const CATEGORY_RESUME_MAP = {
            clinical: 'QUESTIONNAIRE_RESUME_INSTRUCTION',
            research: 'QUESTIONNAIRE_RESUME_INSTRUCTION',
            consent: 'CONSENT_FORM_RESUME_INSTRUCTION',
            default: 'QUESTIONNAIRE_RESUME_INSTRUCTION',
        };
        
        const CATEGORY_SUBMIT_BUTTON_MAP = {
            clinical: 'SUBMITANSWERS',
            research: 'SUBMITANSWERS',
            consent: 'SUBMITCONSENT',
            default: 'SUBMITANSWERS',
        };

        const CATEGORY_SUBMIT_INSTRUCTION_MAP = {
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
        let waitingForSavingAnswer = false;

        // Variables for questionnaire notifications
        let currentCategory = 'default';
        let numberOfUnreadQuestionnaires = {
            clinical: 0,
            research: 0,
            consent: 0,
            default: 0,
        }

        // this is redundant but written for clarity, ordered alphabetically
        let service = {
            clearAllQuestionnaire: clearAllQuestionnaire,
            findInProgressQuestionIndex: findInProgressQuestionIndex,
            getCarouselItems: getCarouselItems,
            getCurrentQuestionnaire: getCurrentQuestionnaire,
            getNumberOfUnreadQuestionnairesByCategory: getNumberOfUnreadQuestionnairesByCategory,
            getQuestionnaireBackToListByCategory: getQuestionnaireBackToListByCategory,
            getQuestionnaireBeginByCategory: getQuestionnaireBeginByCategory,
            getQuestionnaireCount: getQuestionnaireCount,
            getQuestionnaireList: getQuestionnaireList,
            getQuestionnaireNoListMessageByCategory: getQuestionnaireNoListMessageByCategory,
            getQuestionnaireResumeByCategory: getQuestionnaireResumeByCategory,
            getQuestionnaireStartUrl: getQuestionnaireStartUrl,
            getQuestionnaireSubmitButtonByCategory: getQuestionnaireSubmitButtonByCategory,
            getQuestionnaireSubmitInstructionByCategory: getQuestionnaireSubmitInstructionByCategory,
            getQuestionnaireTitleByCategory: getQuestionnaireTitleByCategory,
            getQuestionnaireThankByCategory: getQuestionnaireThankByCategory,
            isWaitingForSavingAnswer: isWaitingForSavingAnswer,
            updateQuestionnaireStatus: updateQuestionnaireStatus,
            requestOpalQuestionnaireFromSerNum: requestOpalQuestionnaireFromSerNum,
            requestQuestionnaire: requestQuestionnaire,
            requestQuestionnaireList: requestQuestionnaireList,
            requestQuestionnaireUnreadNumber: requestQuestionnaireUnreadNumber,
            saveQuestionnaireAnswer: saveQuestionnaireAnswer,
            validateQuestionnaireCategory: validateQuestionnaireCategory,
        };

        return service;

        // //////////////
        /*
            Public functions
         */

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
         * @name requestQuestionnaireList
         * @desc this function is requesting the list of questionnaires from questionnaireDataService and
         *       process this list to set the questionnaire list variables
         * @param {string} questionnaireCategory the category of questionnaires requested
         * @returns {Promise}
         */
        function requestQuestionnaireList(questionnaireCategory) {
            // re-initiate all the questionnaire related variables
            clearAllQuestionnaire();

            currentCategory = questionnaireCategory;

            return QuestionnaireDataService.requestQuestionnaireList(questionnaireCategory)
                .then(function(responseQuestionnaireList){
                    setQuestionnaireList(responseQuestionnaireList);
                    // Update number of unread questionnaires of current category for notifications
                    numberOfUnreadQuestionnaires[questionnaireCategory] = getNumberOfUnreadQuestionnaires();

                    return {Success: true, Location: 'Server'};
                });
        }

        /**
         * @name requestOpalQuestionnaireFromSerNum
         * @desc this function gets the basic information concerning a questionnaire stored in the OpalDB from its SerNum
         *       In particular, it gets the answerQuestionnaireId of that questionnaire,
         *       which allows the questionnaire to be found in the questionnaireDB
         * @param {string|int} questionnaireSerNum
         * @returns {Promise}
         */
        function requestOpalQuestionnaireFromSerNum(questionnaireSerNum) {
            return QuestionnaireDataService.requestOpalQuestionnaireFromSerNum(questionnaireSerNum);
        }

        /**
         * @name requestQuestionnaire
         * @desc this function request one single questionnaire from the data service and set it as the current questionnaire
         * @param {int} answerQuestionnaireId this is the qp_ser_num or the answerQuestionnaireId for the DB (unique identifier for a questionnaire sent to a user)
         * @returns {Promise}
         */
        function requestQuestionnaire(answerQuestionnaireId){
            let currentQuestionnaireInService = getCurrentQuestionnaire();

            // if the current questionnaire is requested, return it.
            if (currentQuestionnaireInService.qp_ser_num === answerQuestionnaireId){
                return Promise.resolve({Success: true, Location: 'App'});
            }

            // re-initiate the current questionnaire related variables
            clearCurrentQuestionnaire();

            return QuestionnaireDataService.requestQuestionnaire(answerQuestionnaireId)
                .then(function(responseQuestionnaire){

                    setQuestionnaire(responseQuestionnaire);

                    return {Success: true, Location: 'Server'};
                });
        }

        /**
         * @name requestQuestionnaireUnreadNumber
         * @desc this function is requesting the number of unread (e.g. 'New') questionnaires from questionnaireDataService and
         *       processes this response to set the number of unread questionnaires variable for notifications 
         * @param {string} questionnaireCategory the category of questionnaires requested
         * @returns {Promise}
         */
        function requestQuestionnaireUnreadNumber(questionnaireCategory) {
            return QuestionnaireDataService.requestQuestionnaireUnreadNumber(questionnaireCategory)
                .then(function(responseUnreadNumber){

                    numberOfUnreadQuestionnaires[questionnaireCategory] = parseInt(responseUnreadNumber.numberUnread);

                    return {Success: true, Location: 'Server'};
                });
        }

        /**
         * @name isWaitingForSavingAnswer
         * @desc getter for the boolean waitingForSavingAnswer. Used for the answerQuestionnaireController
         * @returns {boolean} true if still waiting for any answer to be saved, false otherwise
         */
        function isWaitingForSavingAnswer(){
            return waitingForSavingAnswer;
        }

        /**
         * @name getCurrentQuestionnaire
         * @desc this is a getter for the current questionnaire
         * @returns {object} the current questionnaire
         */
        function getCurrentQuestionnaire(){
            return currentQuestionnaire;
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
        function updateQuestionnaireStatus(answerQuestionnaireId, newStatus, oldStatus){

            return QuestionnaireDataService.updateQuestionnaireStatus(answerQuestionnaireId, newStatus)
                .then(function (response) {

                    if (newStatus === 1){
                        numberOfUnreadQuestionnaires[currentCategory] -= 1;
                    }

                    let isFailure = updateAppQuestionnaireStatus(answerQuestionnaireId, newStatus, oldStatus);

                    if (!isFailure){
                        throw new Error("Error updating status internal to app");
                    }

                    return {Success: true, Location: 'Server'};
                });
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

                // the app knows that the answer is invalid, but still would like to save tha answer (that the user has answered but not chosen an answer).
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

                        reject({Success: false, Location: '', Error: error});
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
         * @name validateQuestionnaireCategory
         * @desc check whether the questionnaire category is valid
         * @param {string} questionnaireCategory
         * @returns {boolean} true if it is valid, false otherwise
         */
        function validateQuestionnaireCategory(questionnaireCategory) {
            return allowedCategory.includes(questionnaireCategory.toLowerCase());
        }

        /**
         * @name getQuestionnaireTitleByCategory
         * @desc gets the correct translation key for the questionnaire title. It assumes that the category has been validated.
         * @param {string} questionnaireCategory
         * @returns {string} the translation key in en.json or fr.json
         */
        function getQuestionnaireTitleByCategory(questionnaireCategory = 'default') {
            return CATEGORY_TITLE_MAP[questionnaireCategory];
        }

        /**
         * @name getQuestionnaireThankByCategory
         * @desc gets the correct translation key for the questionnaire thank you message. It assumes that the category has been validated.
         * @param {string} questionnaireCategory
         * @returns {string} the translation key in en.json or fr.json
         */
        function getQuestionnaireThankByCategory(questionnaireCategory = 'default') {
            return CATEGORY_THANKS_MAP[questionnaireCategory];
        }

        /**
         * @name getQuestionnaireBackToListByCategory
         * @desc gets the correct translation key for the questionnaire back to list message.
         *       It assumes that the category has been validated.
         * @param {string} questionnaireCategory
         * @returns {string} the translation key in en.json or fr.json
         */
        function getQuestionnaireBackToListByCategory(questionnaireCategory = 'default') {
            return CATEGORY_LIST_MAP[questionnaireCategory];
        }

        /**
         * @name getQuestionnaireNoListMessageByCategory
         * @desc gets the correct translation key for the message when there is no questionnaires in the list.
         *       It assumes that the category has been validated.
         * @param {int} status
         * @param {string} questionnaireCategory
         * @returns {string}
         */
        function getQuestionnaireNoListMessageByCategory(status, questionnaireCategory = 'default') {
            switch (status) {
                case questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS:
                    return CATEGORY_EMPTY_LIST_MAP.new[questionnaireCategory];

                case questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS:
                    return CATEGORY_EMPTY_LIST_MAP.progress[questionnaireCategory];

                case questionnaireValidStatus.COMPLETED_QUESTIONNAIRE_STATUS:
                    return CATEGORY_EMPTY_LIST_MAP.completed[questionnaireCategory];

                default:
                    return CATEGORY_EMPTY_LIST_MAP.new['default'];
            }
        }

        /**
         * @name getQuestionnaireBeginByCategory
         * @desc gets the correct translation key for the begin questionnaire instruction. It assumes that the category has been validated.
         * @param {string} questionnaireCategory
         * @returns {string} the translation key in en.json or fr.json
         */
        function getQuestionnaireBeginByCategory(questionnaireCategory = 'default') {
            return CATEGORY_BEGIN_MAP[questionnaireCategory];
        }

        /**
         * @name getQuestionnaireResumeByCategory
         * @desc gets the correct translation key for the resume questionnaire instruction. It assumes that the category has been validated.
         * @param {string} questionnaireCategory
         * @returns {string} the translation key in en.json or fr.json
         */
        function getQuestionnaireResumeByCategory(questionnaireCategory = 'default') {
            return CATEGORY_RESUME_MAP[questionnaireCategory];
        }

        /**
         * @name getQuestionnaireSubmitButtonByCategory
         * @desc gets the correct translation key for the questionnaire submit button. It assumes that the category has been validated.
         * @param {string} questionnaireCategory
         * @returns {string} the translation key in en.json or fr.json
         */
        function getQuestionnaireSubmitButtonByCategory(questionnaireCategory = 'default') {
            return CATEGORY_SUBMIT_BUTTON_MAP[questionnaireCategory];
        }
        
        /**
         * @name getQuestionnaireSubmitInstructionByCategory
         * @desc gets the correct translation key for the submit questionnaire instruction. It assumes that the category has been validated.
         * @param {string} questionnaireCategory
         * @returns {string} the translation key in en.json or fr.json
         */
        function getQuestionnaireSubmitInstructionByCategory(questionnaireCategory = 'default') {
            return CATEGORY_SUBMIT_INSTRUCTION_MAP[questionnaireCategory];
        }

        /**
         * @name getCarouselItems
         * @desc getter for carouselItems
         * @returns {Array}
         */
        function getCarouselItems(){
            return carouselItems;
        }

        /**
         * @name getQuestionnaires
         * @desc This function gets the list of questionnaires according to the status given.
         * @param {Number} status
         * @return {object} The object containing the questionnaires with the given status
         */
        function getQuestionnaireList(status){
            switch (status) {
                case questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS:
                    return Object.values(newQuestionnaires);
                case questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS:
                    return Object.values(inProgressQuestionnaires);
                case questionnaireValidStatus.COMPLETED_QUESTIONNAIRE_STATUS:
                    return Object.values(completeQuestionnaires);
                default:
                    // TODO: logging
                    console.error("invalid type of questionnaire requested from questionnairesService.js");
                    return completeQuestionnaires;
            }
        }

        /**
         * @name getQuestionnaireCount
         * @desc this public function gives the number of questionnaires which is of the type given
         * @param {int} type the type of questionnaire, i.e. new, progress, completed, in int.
         * @returns {int} the number of questionnaires belonging to that type. If the type is not found, return 0 which will mean that the type has 0 questionnaire
         */
        function getQuestionnaireCount(type){
            if (type === questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS) {
                return Object.keys(newQuestionnaires).length;
            }
            else if (type === questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS) {
                return Object.keys(inProgressQuestionnaires).length;
            }
            else if (type === questionnaireValidStatus.COMPLETED_QUESTIONNAIRE_STATUS) {
                return Object.keys(completeQuestionnaires).length;
            }

            // TODO: error log
            return 0;
        }

        /**
         * @name getNumberOfUnreadQuestionnaires
         * @desc This function is used for getting the number of unread questionnaires (e.g. 'New') in the current category
         * @returns {Number} returns the number of new questionnaires of the current category
         */
        function getNumberOfUnreadQuestionnaires(){
            return getQuestionnaireCount(questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS);
        }

        /**
         * @name getNumberOfUnreadQuestionnairesByCategory
         * @desc This public function is used for showing the badge by the personalTabController.js and researchController.js for the appropriate category
         * @param {string} questionnaireCategory the category of questionnaires requested
         * @returns {Number} returns the number of new questionnaires of the given questionnaireCategory
         */
        function getNumberOfUnreadQuestionnairesByCategory(questionnaireCategory = 'default'){
            return numberOfUnreadQuestionnaires[questionnaireCategory];
        }
        /**
         * @name getQuestionnaireStartUrl
         * @desc This public function is created for notifications.
         *      The notification uses this URL to direct the user to this page (questionnaire list) when they click on the notification new questionnaire
         * @returns {string} The URL returned. This constant can be found and modified in the questionnaireConstnant.js
         */
        function getQuestionnaireStartUrl(){
            return notifConstants.QUESTIONNAIRE_URL;
        }

        /**
         * @name getQuestionnaireName
         * @desc This function is used for the notifications and only have one purpose: return a fixed string.
         *      The current implementation have modified the notificationsService to not need this. But just in case, left it here.
         *      To use this, add the following to the service variable: getQuestionnaireName: getQuestionnaireName
         * @returns {string} the questionnaire name hardcoded.
         */
        function getQuestionnaireName(){
            return notifConstants.QUESTIONNAIRE_NAME;
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

        /*
            Private functions
         */

        /**
         * @name clearCarouselItems
         * @desc this private function resets the carouselItems array
         */
        function clearCarouselItems(){
            carouselItems = [];
        }

        /**
         * @name setCarouselItems
         * @desc Flatten the current questionnaire object such that the carousel can use it. Also checks for properties.
         *      Note: this assumes that the questionnaire is ordered when sent by the listener
         */
        function setCarouselItems(){
            clearCarouselItems();

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
         * @name verifyQuestionnaireProperty
         * @desc This private function verify the format and the property of the outer layer of the questionnaire object. Also format html.
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

            // convert html string
            questionnaire.instruction = $sce.trustAsHtml(questionnaire.instruction);
            questionnaire.description = $sce.trustAsHtml(questionnaire.description);

            if (isNaN(questionnaire.status)){
                return false;
            }

            if (!Array.isArray(questionnaire.sections)){
                return false;
            }

            return true;
        }

        /**
         * @name verifySectionProperty
         * @desc verify properties that the section should have. Also convert html string.
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

            section.section_instruction = $sce.trustAsHtml(section.section_instruction);

            if (!Array.isArray(section.questions)){
                return false;
            }

            return true;
        }

        /**
         * @name verifyQuestionProperty
         * @desc verify the properties of questions, as well as the options and answers for it. Also sort the options according to their orders and convert html string
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

            // convert html string
            question.question_text = $sce.trustAsHtml(question.question_text);

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
        function updateAppQuestionnaireStatus (answerQuestionnaireId, newStatus, oldStatus){
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
         * @param {status} status the status of the questionnaire to be updated
         * @returns {boolean} true if success, false otherwise
         */
        function updateAppQuestionnaireLastUpdated(qp_ser_num, status){
            let d = new Date();

            // we know the old status -> clean up old status
            switch (status) {
                case questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS:
                    newQuestionnaires[qp_ser_num].last_updated = d.toISOString();
                    break;

                case questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS:
                    inProgressQuestionnaires[qp_ser_num].last_updated = d.toISOString();
                    break;

                case questionnaireValidStatus.COMPLETED_QUESTIONNAIRE_STATUS:
                    completeQuestionnaires[qp_ser_num].last_updated = d.toISOString();
                    break;

                default:
                    console.error("ERROR: error in updating the questionnaire status, it does not have a valid new status");
                    return false;
            }

            return true;
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
         * @desc this is a setter for the list of questionnaires
         * @param questionnaireList_local
         */
        function setQuestionnaireList(questionnaireList_local){
            // verify input
            if (questionnaireList_local.constructor !== Array){
                clearAllQuestionnaire();
                console.error('Error in setting questionnaire list, did not get an array from listener');
                // TODO: Error handling
                return;
            }

            // sort questionnaires by status
            for (let i = 0; i < questionnaireList_local.length; i++) {
                let questionnaire = questionnaireList_local[i];

                // verify input properties
                if (!questionnaire.hasOwnProperty('created') || !questionnaire.hasOwnProperty('last_updated') ||
                    !questionnaire.hasOwnProperty('nickname') || !questionnaire.hasOwnProperty('qp_ser_num') ||
                    !questionnaire.hasOwnProperty('questionnaire_id') || !questionnaire.hasOwnProperty('status')) {

                    // TODO: error handling
                    console.error('Error in setting questionnaire list, did not get the required property for a questionnaire from listener');
                    clearAllQuestionnaire();

                    return;
                }

                // verify input type
                questionnaire.status = parseInt(questionnaire.status);

                if (isNaN(questionnaire.status)) {
                    // TODO: error handling
                    clearAllQuestionnaire();
                    return;
                }

                // add the questionnaire to the appropriate object according to its status
                switch (questionnaire.status) {
                    case questionnaireValidStatus.NEW_QUESTIONNAIRE_STATUS:
                        newQuestionnaires[questionnaire.qp_ser_num] = questionnaire;
                        break;

                    case questionnaireValidStatus.COMPLETED_QUESTIONNAIRE_STATUS:
                        completeQuestionnaires[questionnaire.qp_ser_num] = questionnaire;
                        break;

                    case questionnaireValidStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS:
                        inProgressQuestionnaires[questionnaire.qp_ser_num] = questionnaire;
                        break;

                    default:
                        console.error("in setQuestionnaireList, the questionnaire status is invalid");
                        // TODO: error handling
                        clearAllQuestionnaire();
                        return;
                }
            }
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

