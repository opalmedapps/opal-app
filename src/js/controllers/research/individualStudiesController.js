/*
 * Filename     :   individualStudiesController.js
 * Description  :   Manages the individual study view.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   March 2021
 */

 (function() {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualStudiesController', IndividualStudiesController);

    IndividualStudiesController.$inject = ['NavigatorParameters','UserPreferences'];
    function IndividualStudiesController(NavigatorParameters,UserPreferences) {
        var vm = this;
        vm.study;
        vm.language;
        vm.hasStartDate = false;
        vm.hasEndDate = false;

        vm.goToQuestionnaire = goToQuestionnaire;
        
        let navigator = null;
        let navigatorName = '';
        let parameters = null;


        activate();

        ////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
            parameters = NavigatorParameters.getParameters();
   
            vm.study = parameters.Post;
            vm.language = UserPreferences.getLanguage();
            vm.hasStartDate = vm.study.hasOwnProperty('startDate');
            vm.hasEndDate = vm.study.hasOwnProperty('endDate');
        }

    /**
     * @name goToQuestionnaire
     * @desc This function goes to the questionnaire redirect page to open the correct questionnaire
     * @param {int} questionnaireId QuestionnaireSerNum in the Questionnaire table (OpalDB)
     */
     function goToQuestionnaire(questionnaireId) {
        NavigatorParameters.setParameters({
            Navigator: navigator,
            Post: questionnaireId
        });
        navigator.pushPage('views/personal/questionnaires/questionnaireNotifRedirect.html', {animation: 'fade'});
    }

    }
})();