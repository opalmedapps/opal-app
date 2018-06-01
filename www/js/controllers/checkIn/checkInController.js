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
        vm.alert = {};
        vm.HasNonCheckinableAppt = false;

        vm.goToAppointment = goToAppointment;
        vm.HasMeaningfulAlias = HasMeaningfulAlias;

        activate();

        ////////////////

        function activate() {
            vm.apps = CheckInService.getCheckInApps();
            vm.language = UserPreferences.getLanguage();

            vm.HasNonCheckinableAppt = HasNonCheckinableAppointment(vm.apps);

            CheckInService.attemptCheckin()
                .then(function(response){

                    console.log('CheckIn Response: ' + response);

                    if(response === 'NOT_ALLOWED'){
                        NewsBanner.showCustomBanner($filter('translate')("NOT_ALLOWED"), '#333333', function(){}, 3000);
                        vm.alert.type = "warning";
                        vm.checkInMessage = "CHECKIN_IN_HOSPITAL_ONLY";
                        vm.error = "";
                    } else if (response === 'SUCCESS') {
                        vm.alert.type = "success";
                        vm.checkInMessage = "CHECKED_IN";
                        vm.apps = CheckInService.getCheckInApps();
                        vm.error = "";
                    } else {
                        vm.alert.type = "danger";
                        vm.checkInMessage = "CHECKIN_ERROR";
                        vm.apps = CheckInService.getCheckInApps();
                        vm.error = "ERROR";
                    }
                });

        }

        // View appointment details
        function goToAppointment(appointment){
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
            homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
        }

        /**
         * Checks if AppointmentType has a Meaningful Alias; i.e. other than the word "Appointment" or "Rendez-vous"
         * @returns {boolean}
         */
        function HasMeaningfulAlias(appointmentType) {
            return (appointmentType.toLowerCase() !== "appointment" && appointmentType.toLowerCase() !== "rendez-vous");
        }

        /**
         *
         * @param apps
         * @return {boolean}
         * @description Checks if in the list of Appointments, there is "at least" one Non-Checkinable appointment,
         *              like a Blood Test
         */
        function HasNonCheckinableAppointment(apps) {
            var HasNonCheckinable = false;
            apps.map(function (app) {
                if (app.CheckinPossible === '0')  HasNonCheckinable = true;
            });

            return HasNonCheckinable;
        }

    }
})();

