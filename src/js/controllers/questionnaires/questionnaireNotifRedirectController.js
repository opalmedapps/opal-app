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
        'Questionnaires'
    ];

    /* @ngInject */
    function QuestionnaireNotifRedirectController($filter, $timeout, NativeNotification, NavigatorParameters, Questionnaires) {

        let vm = this;

        // variables global to this controller
        let navigator = null;
        let navigatorName = '';

        // variables that can be seen from view, sorted alphabetically
        vm.loadingQuestionnaire = true;

        activate();

        ////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
            let params = NavigatorParameters.getParameters();

            if (!params.hasOwnProperty('Post') || isNaN(parseInt(params.Post))) {

                vm.loadingQuestionnaire = false;
                handleLoadQuestionnaireErr();
            }

            let questionnaireSerNum = params.Post;

            Questionnaires.requestOpalQuestionnaireFromSerNum(questionnaireSerNum)
                .then(function(questionnaireInfo) {
                    // Continue displaying the loading page even if the loading itself has finished.
                    // This timeout is needed because the onsen navigator does not immediately update after after pushing
                    $timeout(function() {

                        vm.loadingQuestionnaire = false;

                        if (!validateQuestionnaireInfo(questionnaireInfo)) {
                            handleLoadQuestionnaireErr();

                        } else if (isQuestionnaireCompleted(questionnaireInfo)) {
                            goToQuestionnaireSummary(getAnswerQuestionnaireId(questionnaireInfo));

                        } else {
                            goToQuestionnaire(getAnswerQuestionnaireId(questionnaireInfo));
                        }
                    }, 2000);
                })
                .catch(function(err) {
                    vm.loadingQuestionnaire = false;
                    handleLoadQuestionnaireErr();
                });
        }

        /**
         * @name goToQuestionnaire
         * @desc This function request the questionnaire selected from back-end and push it to the carousel
         * @param {int} answerQuestionnaireId
         */
        function goToQuestionnaire(answerQuestionnaireId) {
            // putting editQuestion false to claim that we are not coming from a summary page
            NavigatorParameters.setParameters({
                Navigator: navigatorName,
                answerQuestionnaireId: answerQuestionnaireId,
                editQuestion: false
            });

            navigator.replacePage('views/personal/questionnaires/questionnaires.html', {animation: 'fade'});
        }

        /**
         * @name goToQuestionnaireSummary
         * @desc This function requests the questionnaire selected from the back-end and push it to the answerQuestionnaire page
         * @param {int} answerQuestionnaireId
         */
        function goToQuestionnaireSummary(answerQuestionnaireId){
            NavigatorParameters.setParameters({
                Navigator: navigatorName,
                answerQuestionnaireId: answerQuestionnaireId
            });

            navigator.replacePage('views/personal/questionnaires/answeredQuestionnaire.html', {animation: 'fade'});
        }

        /**
         * @name getAnswerQuestionnaireId
         * @desc return the answerQuestionnaireId of the questionnaire object
         * @param {object} questionnaireInfo
         * @returns {number} answerQuestionnaireId
         */
        function getAnswerQuestionnaireId(questionnaireInfo) {
            return parseInt(questionnaireInfo.answerQuestionnaireId);
        }

        /**
         * @name isQuestionnaireCompleted
         * @desc return whether the questionnaire is completed or not
         * @param {object} questionnaireInfo
         * @returns {boolean} true if the questionnaire is completed, false otherwise
         */
        function isQuestionnaireCompleted(questionnaireInfo) {
            return questionnaireInfo.completedFlag === "1";
        }

        /**
         * @name validateQuestionnaireInfo
         * @desc check whether the object has the appropriate properties to be used in this controller
         * @param {object} questionnaireInfo
         * @returns {boolean} true if the object has the correct properties, false otherwise
         */
        function validateQuestionnaireInfo(questionnaireInfo) {
            return (questionnaireInfo.hasOwnProperty('answerQuestionnaireId') && !isNaN(questionnaireInfo.answerQuestionnaireId) &&
                parseInt(questionnaireInfo.answerQuestionnaireId) > 0 && questionnaireInfo.hasOwnProperty('completedFlag') &&
                !isNaN(questionnaireInfo.completedFlag));
        }

        /**
         * @name handleLoadQuestionnaireErr
         * @desc shows a notification to the user in case a request to server fails to load the questionnaire
         *      and move the user back to the previous page
         */
        function handleLoadQuestionnaireErr() {
            // go to the questionnaire list page if there is an error
            NavigatorParameters.setParameters({Navigator: navigatorName});
            navigator.popPage();

            NativeNotification.showNotificationAlert($filter('translate')("SERVERERRORALERT"));
        }
    }

})();
