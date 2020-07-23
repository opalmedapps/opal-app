(function() {
    'use strict';

    /**
     * @name QuestionnairesListController
     * @desc This is the controller of questionnairesList.html. It is responsible of getting and displaying the list of questionnaire.
     *      It is also the page pushed when users click on a new questionnaire notification
     *      Note that it uses new, progress, completed to communicate with the view but use the DB constants to communicate with the service
     */

    angular
        .module('MUHCApp')
        .controller('QuestionnairesListController', QuestionnairesListController);

    QuestionnairesListController.$inject = [
        '$scope',
        'Questionnaires',
        'NavigatorParameters',
        'Params',
        '$timeout',
        '$filter'
    ];

    /* @ngInject */
    function QuestionnairesListController($scope, Questionnaires, NavigatorParameters, Params, $timeout, $filter) {
        let vm = this;

        // constants
        const allowedStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;
        const allowedCategory = Params.QUESTIONNAIRE_CATEGORIES;

        // the following are not in the constants file since they concern translation and are relevant for this controller only
        const CATEGORY_TITLE_MAP = {
            clinical: 'CLINICAL_QUESTIONNAIRES',
            research: 'RESEARCH_QUESTIONNAIRES',
            consent: 'STUDY_CONSENT_FORMS',
            default: 'QUESTIONNAIRES',
        };

        const CATEGORY_EMPTY_LIST_MAP = {
            new: {
                clinical: 'QUESTIONNAIRE_NONE_NEW',
                research: 'QUESTIONNAIRE_NONE_NEW',
                consent: 'STUDY_CONSENT_FORMS_NONE_NEW',
                default: 'QUESTIONNAIRE_NONE_NEW',
            },
            progress: {
                clinical: 'QUESTIONNAIRE_NONE_PROGRESS',
                research: 'QUESTIONNAIRE_NONE_PROGRESS',
                consent: 'STUDY_CONSENT_FORMS_NONE_PROGRESS',
                default: 'QUESTIONNAIRE_NONE_PROGRESS',
            },
            completed: {
                clinical: 'QUESTIONNAIRE_NONE_COMPLETED',
                research: 'QUESTIONNAIRE_NONE_COMPLETED',
                consent: 'STUDY_CONSENT_FORMS_NONE_COMPLETED',
                default: 'QUESTIONNAIRE_NONE_COMPLETED',
            }
        };

        // variables for controller
        let category = 'default';
        let navigator = null;
        let navigatorName = '';

        // variables seen from view
        vm.loading = true;  // This is for loading the list of questionnaires
        vm.newQuestionnaireList = [];
        vm.inProgressQuestionnaireList = [];
        vm.completedQuestionnaireList = [];
        vm.noNewQuestionnaireText = '';     // the description varies according to the questionnaire category
        vm.noProgressQuestionnaireText = '';    // the description varies according to the questionnaire category
        vm.noCompletedQuestionnaireText = '';   // the description varies according to the questionnaire category
        vm.pageTitle = '';  // the page title varies according to the questionnaire category
        vm.tab = 'new';

        // functions that can be used from view, sorted alphabetically
        vm.completedQuestionnaireExist = completedQuestionnaireExist;
        vm.goToQuestionnaire = goToQuestionnaire;
        vm.inProgressQuestionnaireExist = inProgressQuestionnaireExist;
        vm.goToQuestionnaireSummary = goToQuestionnaireSummary;
        vm.newQuestionnaireExist = newQuestionnaireExist;

        activate();

        // //////////////

        function activate() {

            vm.loading = true;

            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
            let params = NavigatorParameters.getParameters();

            if (!params.hasOwnProperty('questionnaireCategory') || !validateCategory(params.questionnaireCategory)) {
                setPageText();
                vm.loading = false;
                handleRequestError();

            } else {
                category = params.questionnaireCategory.toLowerCase();
                setPageText(category);

                Questionnaires.requestQuestionnaireList(params.questionnaireCategory)
                    .then(function () {
                        loadQuestionnaireList();

                        vm.loading = false;
                    })
                    .catch(function(error){
                        $timeout(function(){
                            vm.loading = false;
                            handleRequestError();
                        })
                    });
            }

            // this is for when the back button is pressed for a questionnaire, reload the questionnaire list to keep the list up to date
            navigator.on('postpop', function(){
                loadQuestionnaireList();
            });

            // listen to the event of destroy the controller in order to do clean up
            $scope.$on('$destroy', function() {
                removeListener();
            });
        }

        /**
         * @name goToQuestionnaire
         * @desc This function request the questionnaire selected from back-end and push it to the carousel
         * @param selectedQuestionnaire {object} The questionnaire selected in the list
         */
        function goToQuestionnaire(selectedQuestionnaire) {
            // putting editQuestion false to claim that we are not coming from a summary page
            NavigatorParameters.setParameters({
                Navigator: navigatorName,
                answerQuestionnaireId: selectedQuestionnaire.qp_ser_num,
                editQuestion: false
            });

            navigator.pushPage('views/personal/questionnaires/questionnaires.html');
        }

        /**
         * @name goToQuestionnaireSummary
         * @desc This function requests the questionnaire selected from the back-end and push it to the answerQuestionnaire page
         * @param selectedQuestionnaire {object} The questionnaire selected in the list
         */
        function goToQuestionnaireSummary(selectedQuestionnaire){
            NavigatorParameters.setParameters({
                Navigator: navigatorName,
                answerQuestionnaireId: selectedQuestionnaire.qp_ser_num
            });

            navigator.pushPage('views/personal/questionnaires/answeredQuestionnaire.html', {animation: 'slide'});
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
        function loadQuestionnaireList (){

            $timeout(function(){
                vm.newQuestionnaireList = Questionnaires.getQuestionnaireList(allowedStatus.NEW_QUESTIONNAIRE_STATUS);
                vm.inProgressQuestionnaireList = Questionnaires.getQuestionnaireList(allowedStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS);
                vm.completedQuestionnaireList = Questionnaires.getQuestionnaireList(allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS);
            });
        }

        /**
         * @name setPageText
         * @desc set the page title and descriptions according to the questionnaire category requested on the list page
         *      if the category is not passed as an argument, the text will default to the default's translation
         * @param {string} questionnaireCategory
         */
        function setPageText(questionnaireCategory='default') {
            // set the page title
            vm.pageTitle = $filter('translate')(CATEGORY_TITLE_MAP[questionnaireCategory]);

            // set the messages when the lists is null
            vm.noCompletedQuestionnaireText = $filter('translate')(CATEGORY_EMPTY_LIST_MAP.completed[questionnaireCategory]);
            vm.noNewQuestionnaireText = $filter('translate')(CATEGORY_EMPTY_LIST_MAP.new[questionnaireCategory]);
            vm.noProgressQuestionnaireText = $filter('translate')(CATEGORY_EMPTY_LIST_MAP.progress[questionnaireCategory]);
        }

        /**
         * @name validateCategory
         * @desc check whether the category requested is valid
         * @param {string} questionnaireCategory
         * @returns {boolean} true if it is valid, false otherwise
         */
        function validateCategory(questionnaireCategory) {
            return allowedCategory.includes(questionnaireCategory.toLowerCase());
        }

        /**
         * @name handleRequestError
         * @desc show a notification to the user in case a request to server fails
         */
        function handleRequestError (){
            ons.notification.alert({
                //message: 'Server problem: could not fetch data, try again later',
                message: $filter('translate')("SERVERERRORALERT"),
                modifier: (ons.platform.isAndroid())?'material':null
            })
        }

        /**
         * @name removeListener
         * @desc This private function serves to remove any listener for this controller
         */
        function removeListener(){
            navigator.off('postpop');
        }
    }

})();


