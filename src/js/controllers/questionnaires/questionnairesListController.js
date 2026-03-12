// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function() {
    'use strict';

    /**
     * @name QuestionnairesListController
     * @desc This is the controller of questionnairesList.html. It is responsible of getting and displaying the list of questionnaire.
     *      It is also the page pushed when users click on a new questionnaire notification
     *      Note that it uses new, progress, completed to communicate with the view but use the DB constants to communicate with the service
     */

    angular
        .module('OpalApp')
        .controller('QuestionnairesListController', QuestionnairesListController);

    QuestionnairesListController.$inject = [
        '$filter',
        '$scope',
        '$timeout',
        'Navigator',
        'Params',
        'Questionnaires',
        'UpdateUI'
    ];

    /* @ngInject */
    function QuestionnairesListController($filter, $scope, $timeout, Navigator, Params, Questionnaires, UpdateUI) {

        let vm = this;

        // constants
        const allowedStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;

        // variables for controller
        let navigator = null;
        let purpose = 'default';

        // variables seen from view
        vm.newQuestionnaireList = [];
        vm.inProgressQuestionnaireList = [];
        vm.completedQuestionnaireList = [];
        vm.noNewQuestionnaireText = '';         // the description varies according to the questionnaire purpose
        vm.noProgressQuestionnaireText = '';    // the description varies according to the questionnaire purpose
        vm.noCompletedQuestionnaireText = '';   // the description varies according to the questionnaire purpose
        vm.pageTitle = '';                      // the page title varies according to the questionnaire purpose
        vm.tab = 'new';
        vm.dataHandlerParameters = {};

        // functions that can be used from view, sorted alphabetically
        vm.completedQuestionnaireExist = completedQuestionnaireExist;
        vm.goToQuestionnaire = goToQuestionnaire;
        vm.inProgressQuestionnaireExist = inProgressQuestionnaireExist;
        vm.goToQuestionnaireSummary = goToQuestionnaireSummary;
        vm.newQuestionnaireExist = newQuestionnaireExist;

        // Used by patient-data-handler
        vm.loadQuestionnaireList = loadQuestionnaireList;

        activate();

        // //////////////

        function activate() {
            navigator = Navigator.getNavigator();
            let params = Navigator.getParameters();

            purpose = params.questionnairePurpose.toLowerCase();
            vm.dataHandlerParameters.purpose = purpose;
            setPageText(purpose);

            // this is for when the back button is pressed for a questionnaire, reload the questionnaire list to keep the list up to date
            navigator.on('postpop', function() {
                // Refresh the questionnaires from the listener to find out if other users have locked any of them
                if(vm.refreshQuestionnaires) vm.refreshQuestionnaires();
                loadQuestionnaireList();
            });

            // listen to the event of destroy the controller in order to do clean up
            $scope.$on('$destroy', function() {
                navigator.off('postpop');

                // Reload user profile if questionnaire was opened and completed via Notifications tab,
                // and profile was implicitly changed.
                Navigator.reloadPreviousProfilePrepopHandler('notifications.html');
            });
        }

        /**
         * @name goToQuestionnaire
         * @desc This function request the questionnaire selected from back-end and push it to the carousel
         * @param {object} selectedQuestionnaire The questionnaire selected in the list
         */
        function goToQuestionnaire(selectedQuestionnaire) {
            // putting editQuestion false to claim that we are not coming from a summary page
            navigator.pushPage('views/personal/questionnaires/questionnaires.html', {
                answerQuestionnaireId: selectedQuestionnaire.qp_ser_num,
                editQuestion: false,
                questionnairePurpose: purpose
            });
        }

        /**
         * @name goToQuestionnaireSummary
         * @desc This function requests the questionnaire selected from the back-end and push it to the answerQuestionnaire page
         * @param {object} selectedQuestionnaire The questionnaire selected in the list
         */
        function goToQuestionnaireSummary(selectedQuestionnaire){
            navigator.pushPage('views/personal/questionnaires/answeredQuestionnaire.html', {
                animation: 'slide', // OnsenUI
                answerQuestionnaireId: selectedQuestionnaire.qp_ser_num
            });
        }

        /**
         * @name newQuestionnaireExist
         * @desc This public lets the view know whether we should display a "no new questionnaire" message or not
         * @returns {boolean} True if there are new questionnaires, false otherwise
         */
        function newQuestionnaireExist(){
            return Questionnaires.getQuestionnaireCount(allowedStatus.NEW_QUESTIONNAIRE_STATUS) > 0;
        }

        /**
         * @name inProgressQuestionnaireExist
         * @desc This public lets the view know whether we should display a "no in progress questionnaire" message or not
         * @returns {boolean} True if there are in progress questionnaires, false otherwise
         */
        function inProgressQuestionnaireExist(){
            return Questionnaires.getQuestionnaireCount(allowedStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS) > 0;
        }

        /**
         * @name completedQuestionnaireExist
         * @desc This public lets the view know whether we should display a "no completed questionnaire" message or not
         * @returns {boolean} True if there are completed questionnaires, false otherwise
         */
        function completedQuestionnaireExist(){
            return Questionnaires.getQuestionnaireCount(allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS) > 0;
        }

        /**
         * @name loadQuestionnaireList
         * @desc get the questionnaire list from the service
         */
        function loadQuestionnaireList() {
            $timeout(function () {
                // TODO: reload data from the service if the requesting purpose is the same as the current one
                UpdateUI.updateTimestamps('QuestionnaireList', 0);

                vm.newQuestionnaireList = Questionnaires.getQuestionnaireList(allowedStatus.NEW_QUESTIONNAIRE_STATUS);
                vm.inProgressQuestionnaireList = Questionnaires.getQuestionnaireList(allowedStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS);
                vm.completedQuestionnaireList = Questionnaires.getQuestionnaireList(allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS);
            });
        }

        /**
         * @name setPageText
         * @desc set the page title and descriptions according to the questionnaire purpose requested on the list page
         *      if the purpose is not passed as an argument, the text will default to the default's translation
         * @param {string} questionnairePurpose
         */
        function setPageText(questionnairePurpose = 'default') {
            // set the page title
            vm.pageTitle = $filter('translate')(Questionnaires.getQuestionnaireTitleByPurpose(questionnairePurpose));

            // set the messages when the lists is null
            vm.noCompletedQuestionnaireText
                = $filter('translate')(Questionnaires.getQuestionnaireNoListMessageByPurpose(allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS, questionnairePurpose));
            vm.noNewQuestionnaireText
                = $filter('translate')(Questionnaires.getQuestionnaireNoListMessageByPurpose(allowedStatus.NEW_QUESTIONNAIRE_STATUS, questionnairePurpose));
            vm.noProgressQuestionnaireText
                = $filter('translate')(Questionnaires.getQuestionnaireNoListMessageByPurpose(allowedStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS, questionnairePurpose));
        }
    }
})();
