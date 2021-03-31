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
    StudiesController.$inject = ['NavigatorParameters','Studies','UserPreferences'];


    function StudiesController(NavigatorParameters, Studies, UserPreferences) {
        var vm = this;

        vm.language = '';
        vm.noStudies = false;
        vm.studies = [];

        vm.showHeader = showHeader;
        vm.openStudy = openStudy;
        
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
        


        function openStudy(study) {
            NavigatorParameters.setParameters({'Navigator': navigator, 'Post': study});
            navigator.pushPage('views/personal/research/research-studies/individual-study.html');
        }

    }

})();


