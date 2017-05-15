/*
 * Filename     :   diagnosesController.js
 * Description  :   Manages the diagnosis view.
 * Created by   :   David Herrera, Robert Maglieri 
 * Date         :   27 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * @ngdoc controller
 * @name MUHCApp.controller:DiagnosesController
 * @requires Diagnoses
 * @requires UserPreferences
 * @description Controller for the diagnoses view.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('DiagnosesController', DiagnosesController);

    /* @ngInject */
    DiagnosesController.$inject = ['Diagnoses','UserPreferences'];


    function DiagnosesController(Diagnoses, UserPreferences) {
        var vm = this;
        vm.title = 'DiagnosesController';
        vm.diagnoses = [];
        vm.language = '';
        vm.showHeader = showHeader;
        activate();

        ////////////////

        function activate() {
            //load the diagnoses array into view
            vm.diagnoses=Diagnoses.getDiagnoses();
            
            //grab the language
            vm.language = UserPreferences.getLanguage();
        }

        // Determines whether or not to show the date header in the view. Announcements are grouped by day.
        function showHeader(index)
        {
            if (index === 0) return true;
            var current = (new Date(vm.diagnoses[index].CreationDate)).setHours(0,0,0,0);
            var previous = (new Date(vm.diagnoses[index-1].CreationDate)).setHours(0,0,0,0);
            return current !== previous;
        }
    }

})();


