/*
 * Filename     :   studiesController.js
 * Description  :   Manages the studies view.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   March 2021
 */

/**
 * @ngdoc controller
 * @name MUHCApp.controller:StudiesController
 * @requires Studies
 * @requires UserPreferences
 * @description Controller for the diagnoses view.
 */

 (function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('StudiesController', StudiesController);

    /* @ngInject */
    StudiesController.$inject = ['NavigatorParameters','Studies','UserPreferences','$filter'];


    function StudiesController(NavigatorParameters, Studies, UserPreferences, $filter) {
        var vm = this;

        vm.language = '';
        vm.noStudies = false;
        vm.studies = [];

        vm.showHeader = showHeader;
        vm.openInfoPage = openInfoPage;
        vm.openStudy = openStudy;
        vm.getStatusText = getStatusText;
        
        let navigator = null;
        let navigatorName = '';

        activate();

        ////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();   

            Studies.getStudies()
            .then(function(studies){
                vm.loading  = false;
                vm.studies = studies;
                vm.noStudies = vm.studies.length === 0
            })
            .catch(function(){
                vm.loading = false;
                vm.studies = [];
                vm.noStudies = true;
            });

            //grab the language
            vm.language = UserPreferences.getLanguage();
        }

        // Determines whether or not to show the date header in the view. Grouped by day.
        function showHeader(index)
        {
            if (index === 0) return true;
            
            var current = (new Date(vm.studies[index].creationDate)).setHours(0,0,0,0);
            var previous = (new Date(vm.studies[index-1].creationDate)).setHours(0,0,0,0);
            return current !== previous;
        }
        
        // Gets the correct message to display based on consentStatus 
        function getStatusText(consentStatus){ 
            if (consentStatus === 'invited') return $filter('translate')('STUDY_STATUS_INVITED');
            else if (consentStatus === 'declined') return $filter('translate')('STUDY_STATUS_DECLINED');
            else return $filter('translate')('STUDY_STATUS_CONSENTED'); // opalConsented and otherConsented
        }

        function openInfoPage() {
            NavigatorParameters.setParameters({Navigator:navigatorName, subView:'studies'});
            navigator.pushPage('views/tabs/info-page-tabs.html');
        }

        function openStudy(study) {
            NavigatorParameters.setParameters({'Navigator': navigator, 'Post': study});
            navigator.pushPage('views/personal/research/research-studies/individual-study.html');
        }

    }

})();


