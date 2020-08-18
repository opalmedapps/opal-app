(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('QuestionnaireCompletionController', QuestionnaireCompletionController);

    QuestionnaireCompletionController.$inject = ['NavigatorParameters'];

    /* @ngInject */
    function QuestionnaireCompletionController(NavigatorParameters) {
        var vm = this;

        // variables for controller
        let navigator = null;
        let navigatorName = '';

        vm.backToListMessage = '';  // the message varies according to the questionnaire category
        vm.pageTitle = '';  // the page title varies according to the questionnaire category
        vm.thankMessage = '';    // the message varies according to the questionnaire category

        // functions that can be seen from view, sorted alphabetically
        vm.goBackToList = goBackToList;

        activate();

        ////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
            let params = NavigatorParameters.getParameters();

            if (!params.hasOwnProperty('questionnaireCategory') || !validateCategory(params.questionnaireCategory)) {
                setPageText();
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
         * @desc set the page title and descriptions according to the questionnaire category requested
         *      if the category is not passed as an argument, the text will default to the default's translation
         * @param {string} category
         */
        function setPageText(category = 'default') {
            vm.pageTitle = $filter('translate')(Questionnaires.getQuestionnaireTitleByCategory(category));

            vm.backToListMessage = $filter('translate')(Questionnaires.getQuestionnaireBackToListByCategory(category));

            vm.thankMessage = $filter('translate')(Questionnaires.getQuestionnaireThankByCategory(category));
        }

    }

})();

