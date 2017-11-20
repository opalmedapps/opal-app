/*
 * Filename     :   checkInController.js
 * Description  :   Manages user checkin to their appointments
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CheckInController', CheckInController);

    CheckInController.$inject = [
        'CheckInService',
        'NavigatorParameters',
        'UserPreferences',
        'NewsBanner',
        '$filter'
    ];

    /* @ngInject */
    function CheckInController(
        CheckInService,
        NavigatorParameters,
        UserPreferences,
        NewsBanner,
        $filter
    ) {
        var vm = this;
        vm.apps = [];
        vm.language = '';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "";
        vm.additionalInfo = "";
        vm.alert = {};
        vm.goToAppointment = goToAppointment;

        activate();

        ////////////////

        function activate() {
            vm.apps = CheckInService.getCheckInApps();
            vm.language = UserPreferences.getLanguage();

            if(CheckInService.areAllCheckedIn()){
                vm.alert.type = "success";
                vm.checkInMessage = "CHECKED_IN";
                vm.additionalInfo = "CHECKIN_ADDITIONAL";
            }
            else{
                // Ensure that user is within range of the hospital
                CheckInService.isAllowedToCheckIn()
                    .then(function () {
                        // Verify if the appointments are checked in
                        return CheckInService.verifyAllCheckIn();
                    })
                    .then(function (response){
                        if (response){
                            vm.alert.type = "success";
                            vm.checkInMessage = "CHECKED_IN";
                            vm.additionalInfo = "CHECKIN_ADDITIONAL";
                        } else {

                            // Checkin to all todays appointments
                            CheckInService.checkinToAllAppointments()
                                .then(function () {
                                    vm.alert.type = "success";
                                    vm.checkInMessage = "CHECKED_IN";
                                    vm.additionalInfo = "CHECKIN_ADDITIONAL";

                                    CheckInService.areAllCheckedIn(true)
                                })
                                .catch(function (error) {
                                    vm.alert.type = "danger";
                                    vm.checkInMessage = "CHECKIN_ERROR";
                                });
                        }
                    })
                    .catch(function (error) {
                        if (error === "NOT_ALLOWED"){
                            NewsBanner.showCustomBanner($filter('translate')("NOT_ALLOWED"), '#333333', function(){}, 3000);
                            vm.alert.type = "warning";
                            vm.checkInMessage = "CHECKIN_IN_HOSPITAL_ONLY";
                        } else {
                            vm.alert.type = "danger";
                            vm.checkInMessage = error;
                            NewsBanner.showCustomBanner($filter('translate')(error), '#333333', function(){}, 3000);
                        }
                    });
            }
        }

        // View appointment details
        function goToAppointment(appointment){
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
            homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
        }

    }

})();

