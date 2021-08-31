/*
 * Filename     :   radiotherapyController.js
 * Description  :   Manages the radiotherapy view.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   March 2021
 */

/**
 * @ngdoc controller
 * @name MUHCApp.controller:RadiotherapyController
 * @requires Radiotherapy
 * @requires UserPreferences
 * @description Controller for the radiotherapy view.
 */

 (function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('RadiotherapyController', RadiotherapyController);

    /* @ngInject */
    RadiotherapyController.$inject = ['NavigatorParameters','Radiotherapy','UserPreferences'];


    function RadiotherapyController(NavigatorParameters, Radiotherapy, UserPreferences) {
        var vm = this;

        vm.language = '';
        vm.loading = true;
        vm.noRTPlans = true;
        vm.RTPlans = [];

        vm.showHeader = showHeader;
        vm.openRTPlan = openRTPlan;
        
        let navigator = null;
        let navigatorName = '';

        activate();

        ////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();   

            Radiotherapy.requestRTDicoms()
            .then(function(RTPlans){
                vm.loading  = false;
                vm.RTPlans = RTPlans;
                vm.noRTPlans = vm.RTPlans.length === 0
            })
            .catch(function(){
                vm.loading = false;
                vm.RTPlans = [];
                vm.noRTPlans = true;
            });

            //grab the language
            vm.language = UserPreferences.getLanguage();
        }

        // Determines whether or not to show the date header in the view. Grouped by day.
        function showHeader(index)
        {
            if (index === 0) return true;
            var current = (new Date(vm.RTPlans[index].DateAdded)).setHours(0,0,0,0);
            var previous = (new Date(vm.RTPlans[index-1].DateAdded)).setHours(0,0,0,0);
            return current !== previous;
        }

        // Opens the individual radiotherapy page
        function openRTPlan(plan) {
            NavigatorParameters.setParameters({'Navigator': navigator, 'Post': plan});
            navigator.pushPage('views/personal/radiotherapy/individual-radiotherapy.html');
        }

    }

})();


