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
        'NavigatorParameters',
        'Questionnaires',
        'Utility',
        'ProfileSelector'
    ];

    /* @ngInject */
    function QuestionnaireNotifRedirectController($filter, $timeout, NativeNotification, NavigatorParameters,
                                                  Questionnaires, Utility, ProfileSelector) {
        let vm = this;

        // variables global to this controller
        let navigator = null;
        let navigatorName = '';
        let navigatorParams = null;

        // variables that can be seen from view, sorted alphabetically
        vm.loadingQuestionnaire = true;

        activate();

        ////////////////

        async function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
            navigatorParams = NavigatorParameters.getParameters();

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
                // If the relationship type is not 'SELF' and can_answer_questionnaire is False, the questionnaire cannot be opened
                let relationshipType = ProfileSelector.getActiveProfile().relationship_type.role_type;
                let answerable = ProfileSelector.getActiveProfile().relationship_type.can_answer_questionnaire;
                // Refresh the questionnaires from the listener to find out if another user has locked this one before opening it
                if(vm.refreshQuestionnaires) vm.refreshQuestionnaires();
                // If the questionnaire was removed from the service, it's because it was locked, and cannot be opened
                if ((!Questionnaires.getQuestionnaireBySerNum(selectedQuestionnaire.qp_ser_num)) || (relationshipType !== 'SELF' && !answerable)) {
                    NativeNotification.showNotificationAlert(
                        $filter('translate')("QUESTIONNAIRE_LOCKING_ERROR"),
                        $filter('translate')("TITLE"),
                    );
                    goToQuestionnaireSummary(answerQuestionnaireId);
                    return;
                }

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
            NavigatorParameters.setParameters({
                Navigator: navigatorName,
                answerQuestionnaireId: answerQuestionnaireId,
                editQuestion: false,
                questionnairePurpose: purpose.toLowerCase(),
                isCareReceiver: navigatorParams['isCareReceiver'],
                currentProfile: navigatorParams['currentProfile'],
            });

            navigator.replacePage('views/personal/questionnaires/questionnaires.html', { animation: 'fade' });
        }

        /**
         * @name goToQuestionnaireSummary
         * @desc This function requests the questionnaire selected from the back-end and push it to the answerQuestionnaire page
         * @param {int} answerQuestionnaireId
         */
        function goToQuestionnaireSummary(answerQuestionnaireId){
            NavigatorParameters.setParameters({
                Navigator: navigatorName,
                answerQuestionnaireId: answerQuestionnaireId,
                isCareReceiver: navigatorParams['isCareReceiver'],
                currentProfile: navigatorParams['currentProfile'],
            });

            navigator.replacePage('views/personal/questionnaires/answeredQuestionnaire.html', {animation: 'fade'});
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
            NavigatorParameters.setParameters({
                Navigator: navigatorName,
                isCareReceiver: navigatorParams['isCareReceiver'],
                currentProfile: navigatorParams['currentProfile'],
            });
            navigator.popPage();

            NativeNotification.showNotificationAlert($filter('translate')("SERVERERRORALERT"));
        }
    }
})();
