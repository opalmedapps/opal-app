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

        // functions that can be seen from view, sorted alphabetically
        vm.goBackToList = goBackToList;

        activate();

        ////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
        }

        /**
         * goBackToList
         * @desc this function allows the user to go back to the questionnaire list, it has the same use as back button
         */
        function goBackToList() {
            NavigatorParameters.setParameters({Navigator: navigatorName});
            navigator.popPage();
        }
    }

})();

