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
        'Toast',
        '$filter',
        'Params'
    ];

    /* @ngInject */
    function CheckInController(
        CheckInService,
        NavigatorParameters,
        UserPreferences,
        Toast,
        $filter,
        Params
    ) {

        var vm = this;
        vm.apps = [];
        vm.displayApps = {};
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

        async function activate() {
            vm.apps = CheckInService.getCheckInApps();
            vm.apps.forEach(app => {
                if (!vm.displayApps[app.patientName]) {
                    vm.displayApps[app.patientName] = [];
                }
                vm.displayApps[app.patientName].push(app);
            });
            vm.language = UserPreferences.getLanguage();

            vm.HasNonCheckinableAppt = HasNonCheckinableAppointment(vm.apps);

            const response = await CheckInService.attemptCheckin();
            if(response === "NOT_ALLOWED"){
                Toast.showToast({
                    message: $filter('translate')("NOT_ALLOWED"),
                });
                vm.alert.type = Params.alertTypeWarning;
                vm.checkInMessage = "CHECKIN_IN_HOSPITAL_ONLY";
            } else if (response === "SUCCESS") {
                vm.alert.type = Params.alertTypeSuccess;
                vm.checkInMessage = "CHECKED_IN";
                vm.apps = CheckInService.getCheckInApps();
            } else {
                vm.alert.type = Params.alertTypeDanger;
                vm.checkInMessage = "CHECKIN_ERROR";
                vm.apps = CheckInService.getCheckInApps();
                vm.error = "ERROR";
            }
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
            return (appointmentType?.toLowerCase() !== Params.appointmentType.appointmentTypeEn &&
                appointmentType?.toLowerCase() !== Params.appointmentType.appointmentTypeFr);
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

