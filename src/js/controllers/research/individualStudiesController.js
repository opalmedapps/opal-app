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

        vm.openConsentForms = openConsentForms;
        
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


        function openConsentForms() {
            NavigatorParameters.setParameters({questionnairePurpose: 'consent'}); 
            navigator.pushPage('views/personal/questionnaires/questionnairesList.html');
        }

    }
})();