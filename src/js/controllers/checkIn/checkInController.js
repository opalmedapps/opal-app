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
        vm.checkedInApps = {};
        vm.language = '';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "";
        vm.alert = {};
        vm.HasNonCheckinableAppt = false;
        vm.emptyApps = false;
        vm.statusColor = {
            'success': 'rgba(38,100,171,0.81)',
            'warning': 'rgba(38,100,171,0.81)',
            'danger': 'rgba(38,100,171,0.81)',
        };

        vm.goToAppointment = goToAppointment;
        vm.HasMeaningfulAlias = HasMeaningfulAlias;
        vm.CheckInAppointments = CheckInAppointments;

        activate();

        ////////////////

        function activate() {
            vm.apps = CheckInService.getCheckInApps();
            vm.apps.forEach(app => {
                if (!vm.displayApps[app.patientName]) {
                    vm.displayApps[app.patientName] = [];
                }
                vm.displayApps[app.patientName].push(app);
            });
            vm.language = UserPreferences.getLanguage();

            vm.HasNonCheckinableAppt =  HasNonCheckinableAppointment(vm.apps);

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

        /**
         * @return void
         * @description Check-in all the appointments and update appointment array
         */
        async function CheckInAppointments(patientName) {
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
                vm.displayApps = CheckInService.getCheckInApps();
            } else {
                vm.alert.type = Params.alertTypeDanger;
                vm.checkInMessage = "CHECKIN_ERROR";
                vm.displayApps = CheckInService.getCheckInApps();
                vm.error = "ERROR";
            }
            let patientApps = {
                key: patientName,
                apps: vm.displayApps[patientName],
            };
        }
    }
})();

