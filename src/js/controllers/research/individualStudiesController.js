/*
 * Filename     :   individualStudiesController.js
 * Description  :   Manages the individual study view.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   March 2021
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualStudiesController', IndividualStudiesController);

    IndividualStudiesController.$inject = ['Navigator', 'Studies', 'UserPreferences'];
    function IndividualStudiesController(Navigator, Studies, UserPreferences) {
        let vm = this;
        vm.study;
        vm.language;
        vm.hasStartDate = false;
        vm.hasEndDate = false;

        vm.goToQuestionnaire = goToQuestionnaire;

        let navigator = null;
        let parameters = null;


        activate();

        ////////////////

        function activate() {
            navigator = Navigator.getNavigator();
            parameters = Navigator.getParameters();

            vm.study = parameters.Post;
            vm.language = UserPreferences.getLanguage();
            vm.hasStartDate = vm.study.hasOwnProperty('startDate');
            vm.hasEndDate = vm.study.hasOwnProperty('endDate');

            // Reload studies list after submitting questionnaire 
            // Required to update studies list with participation status after submitting
            // consent form opened from the individual studies page
            navigator.on('prepop', function (event) {
                if (
                    event?.currentPage?.page
                    && event.currentPage.page == 'views/personal/questionnaires/questionnaireCompletedConfirmation.html'
                ) {
                    Studies.getStudies();
                }
            });
        }

        /**
         * @name goToQuestionnaire
         * @desc This function goes to the questionnaire redirect page to open the correct questionnaire
         * @param {int} questionnaireId QuestionnaireSerNum in the Questionnaire table (OpalDB)
         */
        function goToQuestionnaire(questionnaireId) {
            navigator.pushPage('views/personal/questionnaires/questionnaireNotifRedirect.html', {
                animation: 'fade', // OnsenUI
                Post: questionnaireId
            });
        }
    }
})();
