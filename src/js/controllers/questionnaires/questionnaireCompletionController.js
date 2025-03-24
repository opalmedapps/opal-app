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

    QuestionnaireCompletionController.$inject = ['$filter', '$scope', 'Navigator', 'Questionnaires'];

    /* @ngInject */
    function QuestionnaireCompletionController($filter, $scope, Navigator, Questionnaires) {
        var vm = this;

        // variables for controller
        let purpose = 'default';
        let navigator = null;

        vm.backToListMessage = '';  // the message varies according to the questionnaire purpose
        vm.pageTitle = '';          // the page title varies according to the questionnaire purpose
        vm.thankMessage = '';       // the message varies according to the questionnaire purpose

        // functions that can be seen from view, sorted alphabetically
        vm.goBackToList = goBackToList;

        activate();

        ////////////////

        function activate() {
            navigator = Navigator.getNavigator();

            let params = Navigator.getParameters();

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
         * @description Sends the user to the questionnaire list, either by popping the current page off the stack (same as the back button),
         *              or by replacing the page (necessary if the user came from notifications).
         */
        function goBackToList() {
            let previousPage = Navigator.getPreviousPageName();
            if (previousPage === 'questionnairesList.html') navigator.popPage();
            else navigator.replacePage('views/personal/questionnaires/questionnairesList.html', {
                questionnairePurpose: purpose,
            });
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

