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

    DiagnosesController.$inject = ['Diagnoses','UserPreferences'];

    /* @ngInject */
    function DiagnosesController(Diagnoses, UserPreferences) {
        var vm = this;
        vm.title = 'DiagnosesController';
        vm.diagnoses = [];
        vm.language = '';

        activate();

        ////////////////

        function activate() {
            //load the diagnoses array into view
            vm.diagnoses=Diagnoses.getDiagnoses();

            //grab the language
            vm.language = UserPreferences.getLanguage();
        }
    }

})();


