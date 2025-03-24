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
        vm.emptyApps = true;
        vm.language = '';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "";
        vm.alert = {};
        vm.HasNonCheckinableAppt = false;

        vm.separatorStatus = [];
        vm.separatorStatus[Params.alertTypeInfo] = 'separator-info';
        vm.separatorStatus[Params.alertTypeSuccess] = 'separator-success';
        vm.separatorStatus[Params.alertTypeWarning] = 'separator-warning';
        vm.separatorStatus[Params.alertTypeDanger] = 'separator-error';


        vm.goToAppointment = goToAppointment;
        vm.HasMeaningfulAlias = HasMeaningfulAlias;
        vm.CheckInAppointments = CheckInAppointments;

        activate();

        ////////////////

        function activate() {
            vm.apps = CheckInService.getCheckInApps();
            vm.apps.forEach(app => {
                if (!vm.displayApps[app.PatientSerNum]) {
                    vm.displayApps[app.PatientSerNum] = {};
                    vm.displayApps[app.PatientSerNum].apps = [];
                    vm.displayApps[app.PatientSerNum].patientName = app.patientName;
                    vm.displayApps[app.PatientSerNum].allCheckedIn = true;
                }
                vm.displayApps[app.PatientSerNum].apps.push(app);
                vm.displayApps[app.PatientSerNum].patientName = app.patientName;
                const allCheckedIn = vm.displayApps[app.PatientSerNum].allCheckedIn;
                vm.displayApps[app.PatientSerNum].allCheckedIn = allCheckedIn && ['warning', 'success'].indexOf(app.CheckInStatus) > -1;
            });
            vm.language = UserPreferences.getLanguage();

            if (Object.keys(vm.displayApps).length > 0) {
                vm.emptyApps = false;
            }

            vm.HasNonCheckinableAppt = HasNonCheckinableAppointment(vm.apps);
        }

        /**
         * @desc Displays an error state in the view, when check-in fails.
         */
        function displayError(message) {
            Toast.showToast({
                message: $filter('translate')(message),
            });
        }

        // View appointment details
        function goToAppointment(appointment){
            if(appointment.ReadStatus === '0') {
                Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
                // Mark corresponding notification as read
                Notifications.implicitlyMarkCachedNotificationAsRead(
                    appointment.AppointmentSerNum,
                    [
                        Params.NOTIFICATION_TYPES.RoomAssignment,
                        Params.NOTIFICATION_TYPES.NextAppointment,
                        Params.NOTIFICATION_TYPES.AppointmentTimeChange,
                        Params.NOTIFICATION_TYPES.CheckInNotification,
                        Params.NOTIFICATION_TYPES.AppointmentNew,
                        Params.NOTIFICATION_TYPES.AppointmentCancelled,
                    ],
                );
            }
            NavigatorParameters.setParameters({'Navigator': 'homeNavigator', 'Post': appointment});
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
         * @param PatientSerNum
         * @return {void}
         * @description Checks if in the list of Appointments,for the target patient
         */
        async function CheckInAppointments(PatientSerNum) {
            vm.displayApps[PatientSerNum].apps.forEach(app => {
                if (app.CheckInStatus != 'success') {
                    app.loading = true;
                }
            });

            try {
                const response = await CheckInService.attemptCheckin(PatientSerNum);
                if(response === 'CHECKIN_NOT_ALLOWED'){
                    displayError('CHECKIN_NOT_ALLOWED');
                } else if (response === 'SUCCESS') {
                    vm.apps = CheckInService.getCheckInApps();
                } else {
                    displayError('CHECKIN_ERROR');
                }
            } catch (error) {
                console.log(error);
                displayError('CHECKIN_ERROR');
            }


            $timeout(() => {
                let allCheckedIn = true;
                vm.displayApps[PatientSerNum].apps.forEach(app => {
                    const appt = vm.apps.find(appt => appt.AppointmentSerNum == app.AppointmentSerNum);
                    if (appt) {
                        app.Checkin = appt.Checkin;
                        app.loading = false;
                        app.CheckInStatus = appt.Checkin == '1' ? 'success' : 'danger';
                        app.CheckInStatus = appt.checkinpossible == 0 ? 'warning' : app.CheckInStatus;
                        allCheckedIn =  allCheckedIn && ['warning', 'success'].indexOf(app.CheckInStatus) > -1;
                    }
                })
                vm.displayApps[PatientSerNum].allCheckedIn = allCheckedIn;
            });
        }
    }
})();

