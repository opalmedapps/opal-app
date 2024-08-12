(function () {
    'use strict';

    /**
     * @name QuestionnaireNotifRedirectController
     * @desc this is the controller for src/views/personal/questionnaires/questionnaireNotifRedirect.html
     *      It is used to redirect the questionnaire to open the right page when the user clicks on a questionnaire notification
     */

    angular
        .module('MUHCApp')
        .controller('QuestionnaireNotifRedirectController', QuestionnaireNotifRedirectController);

    QuestionnaireNotifRedirectController.$inject = [
        '$filter',
        '$timeout',
        'NativeNotification',
        'Navigator',
        'Questionnaires',
        'Utility'
    ];

    /* @ngInject */
    function QuestionnaireNotifRedirectController($filter, $timeout, NativeNotification, Navigator,
                                                  Questionnaires, Utility) {
        let vm = this;

        // variables global to this controller
        let navigator = null;
        let navigatorParams = null;

        // variables that can be seen from view, sorted alphabetically
        vm.loadingQuestionnaire = true;

        activate();

        ////////////////

        async function activate() {
            navigator = Navigator.getNavigator();
            navigatorParams = Navigator.getParameters();

            if (!navigatorParams.hasOwnProperty('Post') || isNaN(parseInt(navigatorParams.Post))) {
                vm.loadingQuestionnaire = false;
                handleLoadQuestionnaireErr();
            }

            let questionnaireSerNum = navigatorParams.Post;

            try {
                // Continue displaying the loading page even if the loading itself has finished.
                // This timeout is needed because the onsen navigator does not immediately update after pushing.
                let questionnaireInfo = await Utility.promiseMinDelay(
                    Questionnaires.requestQuestionnaireStubFromSerNum(questionnaireSerNum),
                    2000,
                );

                // Validate that all required parameters are there; an error will be thrown if not
                Questionnaires.formatQuestionnaireStub(questionnaireInfo);

                $timeout(function () {
                    let answerQuestionnaireId = getAnswerQuestionnaireId(questionnaireInfo);
                    if (isQuestionnaireCompleted(questionnaireInfo)) goToQuestionnaireSummary(answerQuestionnaireId);
                    else goToQuestionnaire(answerQuestionnaireId);
                    vm.loadingQuestionnaire = false;
                });
            }
            catch(error) {
                console.error(error);
                $timeout(function () {
                    vm.loadingQuestionnaire = false;
                    handleLoadQuestionnaireErr();
                });
            }
        }

        /**
         * @name goToQuestionnaire
         * @desc This function request the questionnaire selected from back-end and push it to the carousel
         * @param {int} answerQuestionnaireId
         */
        async function goToQuestionnaire(answerQuestionnaireId) {
            // putting editQuestion false to claim that we are not coming from a summary page
            // Get questionnaire purpose to display correct page contents
            let purposeData = await Questionnaires.requestQuestionnairePurpose(answerQuestionnaireId);

            let purpose = purposeData.purpose;

            // putting editQuestion false to claim that we are not coming from a summary page
            navigator.replacePage('views/personal/questionnaires/questionnaires.html', {
                animation: 'fade', // OnsenUI
                answerQuestionnaireId: answerQuestionnaireId,
                editQuestion: false,
                questionnairePurpose: purpose.toLowerCase(),
            });
        }

        /**
         * @name goToQuestionnaireSummary
         * @desc This function requests the questionnaire selected from the back-end and push it to the answerQuestionnaire page
         * @param {int} answerQuestionnaireId
         */
        function goToQuestionnaireSummary(answerQuestionnaireId){
            navigator.replacePage('views/personal/questionnaires/answeredQuestionnaire.html', {
                animation: 'fade', // OnsenUI
                answerQuestionnaireId: answerQuestionnaireId,
            });
        }

        /**
         * @name getAnswerQuestionnaireId
         * @description Parses and returns the answerQuestionnaireId (qp_ser_num) value of a questionnaire stub.
         * @param {object} questionnaireInfo The info (questionnaire stub) returned by the listener.
         * @returns {number} The qp_ser_num value of the questionnaire stub.
         */
        function getAnswerQuestionnaireId(questionnaireInfo) {
            return parseInt(questionnaireInfo.qp_ser_num);
        }

        /**
         * @name isQuestionnaireCompleted
         * @desc return whether the questionnaire is completed or not
         * @param {object} questionnaireInfo
         * @returns {boolean} true if the questionnaire is completed, false otherwise
         */
        function isQuestionnaireCompleted(questionnaireInfo) {
            return questionnaireInfo.status == 2;
        }

        /**
         * @name handleLoadQuestionnaireErr
         * @desc shows a notification to the user in case a request to server fails to load the questionnaire
         *      and move the user back to the previous page
         */
        function handleLoadQuestionnaireErr() {
            // go to the questionnaire list page if there is an error
            navigator.popPage();
            NativeNotification.showNotificationAlert($filter('translate')("SERVERERRORALERT"));
        }
    }
})();
