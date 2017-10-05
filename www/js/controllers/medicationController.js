/*
 * Filename     :   medicationController.js
 * Description  :   
 * Created by   :   
 * Date         :   
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('medicationController', medicationController);

    medicationController.$inject = ['Patient', 'UserPreferences', '$scope', '$timeout', 'NavigatorParameters'];

    /* @ngInject */
    function medicationController(Patient, UserPreferences, $scope, $timeout, NavigatorParameters) {

        $scope.drugTaken = function($event) {
            var check_button_color = angular.element($event.currentTarget)[0];
            var desc = angular.element(document.getElementsByClassName("drug1"))[0];
            if (check_button_color.style.color == "green") {
                check_button_color.style.color = "red";
                desc.innerHTML = "To take today at 3:00 PM";
            }
            else {
                check_button_color.style.color = "green";
                desc.innerHTML = "Taken at " + moment().format("MMMM Do YYYY, h:mm a");;
            }


        };
    }

})();
