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
        '$timeout',
        'CheckInService',
        'NavigatorParameters',
        'UserPreferences',
        'Toast',
        '$filter',
        'Params'
    ];

    /* @ngInject */
    function CheckInController(
        $timeout,
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
        vm.patients = {};
        vm.checkedInApps = {};
        vm.language = '';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "";
        vm.alert = {};
        vm.HasNonCheckinableAppt = false;

        vm.statusColor = []
        vm.statusColor[Params.alertTypeSuccess] = 'green';
        vm.statusColor[Params.alertTypeInfo] = 'rgba(38,100,171,0.81)';
        vm.statusColor[Params.alertTypeDanger] = 'red';


        vm.goToAppointment = goToAppointment;
        vm.HasMeaningfulAlias = HasMeaningfulAlias;

        activate();

        ////////////////

        function activate() {
            vm.apps = CheckInService.getCheckInApps();
            vm.apps.forEach(app => {
                if (!vm.displayApps[app.PatientSerNum]) {
                    vm.displayApps[app.PatientSerNum] = [];
                }
                vm.displayApps[app.PatientSerNum].push(app);
                vm.patients[app.PatientSerNum] = app.patientName;
            });
            vm.language = UserPreferences.getLanguage();

            vm.HasNonCheckinableAppt = HasNonCheckinableAppointment(vm.apps);

            const parameters = NavigatorParameters.getParameters();
            if (parameters.hasOwnProperty('apps')) {
                vm.checkedInApps[parameters.apps.key] = parameters.apps.apps;
            }
        }

        /**
         * @desc Displays an error state in the view, when check-in fails.
         */
        function displayError() {
            $timeout(() => {
                vm.alert.type = Params.alertTypeDanger;
                vm.checkInMessage = "CHECKIN_ERROR";
                vm.apps = CheckInService.getCheckInApps();
                if (vm.apps.length === 0) vm.error = "ERROR";
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
            return (appointmentType.toLowerCase() !== Params.appointmentType.appointmentTypeEn && appointmentType.toLowerCase() !== Params.appointmentType.appointmentTypeFr);
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
         *
         * @param PatientSerNum
         * @return {void}
         * @description Checks if in the list of Appointments,for the target patient
         */
        async function CheckInAppointments(PatientSerNum) {
            vm.displayApps[PatientSerNum].forEach(app => {
                app.loading = true;
            })

            //TODO check-in apps for the target patient
            const response = await CheckInService.attemptCheckin(PatientSerNum);

            $timeout(() => {
                let allCheckedIn = true;
                vm.displayApps[PatientSerNum].forEach(app => {
                    const appt = response.appts.find(appt => appt.AppointmentSerNum == app.AppointmentSerNum);
                    if (appt) {
                        app.Checkin = appt.Checkin;
                        app.loading = false;
                        allCheckedIn =  allCheckedIn && app.CheckInStatus == 'success';
                    }
                })
                vm.displayApps[PatientSerNum].allCheckedIn = allCheckedIn;
            },);
        }
    }
})();

