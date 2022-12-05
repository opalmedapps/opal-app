(function () {
    'use strict';

    /**
     * @name QuestionnaireCompletionController
     * @desc this controller is used in src/views/personal/questionnaires/questionnaireCompletedConfirmation.html
     *       It is responsible of the confirmation page for questionnaires
     */

    angular
        .module('MUHCApp')
        .controller('QuestionnaireCompletionController', QuestionnaireCompletionController);

    QuestionnaireCompletionController.$inject = ['$filter', 'NavigatorParameters', 'Questionnaires'];

    /* @ngInject */
    function QuestionnaireCompletionController($filter, NavigatorParameters, Questionnaires) {
        var vm = this;

        // variables for controller
        let purpose = 'default';
        let navigator = null;
        let navigatorName = '';

        vm.backToListMessage = '';  // the message varies according to the questionnaire purpose
        vm.pageTitle = '';          // the page title varies according to the questionnaire purpose
        vm.thankMessage = '';       // the message varies according to the questionnaire purpose

        // functions that can be seen from view, sorted alphabetically
        vm.goBackToList = goBackToList;

        activate();

        ////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();

            let params = NavigatorParameters.getParameters();

            if (!params?.questionnairePurpose
                || !Questionnaires.validateQuestionnairePurpose(params?.questionnairePurpose)
            ) {
                setPageText();
                vm.loading = false;
            } else {
                purpose = params.questionnairePurpose.toLowerCase();
                setPageText(purpose);
                vm.loading = false;
            }
        }

        /**
         * goBackToList
         * @desc this function allows the user to go back to the questionnaire list, it has the same use as back button
         */
        function goBackToList() {
            NavigatorParameters.setParameters({Navigator: navigatorName});
            navigator.popPage();
        }

        /**
         * @name setPageText
         * @desc set the page title and descriptions according to the questionnaire purpose requested
         *      if the purpose is not passed as an argument, the text will default to the default's translation
         * @param {string} purpose
         */
        function setPageText(purpose = 'default') {
            vm.pageTitle = $filter('translate')(
                Questionnaires.getQuestionnaireTitleByPurpose(purpose)
            );

            vm.backToListMessage = $filter('translate')(
                Questionnaires.getQuestionnaireBackToListByPurpose(purpose)
            );

            vm.thankMessage = $filter('translate')(
                Questionnaires.getQuestionnaireThankByPurpose(purpose)
            );
        }
    }

})();

