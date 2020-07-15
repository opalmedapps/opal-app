(function() {
    'use strict';

    /**
     * @name ResearchQuestionnairesListController
     * @desc This is the controller of research-questionnaires-list.html. 
     *       It is currently just a skeleton and assumes that there are no research questionnaires available.
     * @todo Implement functions below to work with research questionnaires (similar to questionnairesListController.js)
     */

    angular
        .module('MUHCApp')
        .controller('ResearchQuestionnairesListController', ResearchQuestionnairesListController);

    ResearchQuestionnairesListController.$inject = [
        '$scope',
        'NavigatorParameters',
        'Params',
        '$timeout',
        '$filter'
    ];

    /* @ngInject */
    // TODO: inject dependency to load research questionnaires
    function ResearchQuestionnairesListController($scope, NavigatorParameters, Params, $timeout, $filter) {
        let vm = this;

        // variables for controller
        let navigator = null;
        let navigatorName = '';

        // variables seen from view
        vm.loading = true;  // This is for loading the list of questionnaires
        vm.newQuestionnaireList = [];
        vm.inProgressQuestionnaireList = [];
        vm.completedQuestionnaireList = [];
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
           
            vm.loading = false; 

            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();

            // TODO: load questionnaire list similar to:
            // Questionnaires.requestQuestionnaireList()
            //     .then(function () {
            //         loadQuestionnaireList();

            //         vm.loading = false;
            //     })
            //     .catch(function(error){
            //         $timeout(function(){
            //             vm.loading = false;
            //             handleRequestError();
            //         })
            //     });

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
            // TODO: implement
        }

        /**
         * @name goToQuestionnaireSummary
         * @desc This function requests the questionnaire selected from the back-end and push it to the answerQuestionnaire page
         * @param selectedQuestionnaire {object} The questionnaire selected in the list
         */
        function goToQuestionnaireSummary(selectedQuestionnaire){
            // TODO: implement
        }

        /**
         * @name newQuestionnaireExist
         * @desc This public lets the view know whether we should display a "no new questionnaire" message or not
         * @returns {boolean} True if there are new questionnaires, false otherwise
         */
        function newQuestionnaireExist(){
            return false;
            // TODO: implement
        }

        /**
         * @name inProgressQuestionnaireExist
         * @desc This public lets the view know whether we should display a "no in progress questionnaire" message or not
         * @returns {boolean} True if there are in progress questionnaires, false otherwise
         */
        function inProgressQuestionnaireExist(){
            return false;
            // TODO: implement
        }

        /**
         * @name completedQuestionnaireExist
         * @desc This public lets the view know whether we should display a "no completed questionnaire" message or not
         * @returns {boolean} True if there are completed questionnaires, false otherwise
         */
        function completedQuestionnaireExist(){
            return false;
            // TODO: implement
        }

        /**
         * @name loadQuestionnaireList
         * @desc get the questionnaire list from the service
         */
        function loadQuestionnaireList (){

            $timeout(function(){
                vm.newQuestionnaireList = [];
                vm.inProgressQuestionnaireList = [];
                vm.completedQuestionnaireList = [];
                // TODO: implement
            });
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
