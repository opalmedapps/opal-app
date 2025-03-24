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

    CheckInController.$inject = ['$filter', '$timeout', 'CheckInService', 'NativeNotification', 'Navigator', 'Params',
        'ProfileSelector', 'Toast', 'User', 'UserPreferences'];

    /* @ngInject */
    function CheckInController($filter, $timeout, CheckInService, NativeNotification, Navigator, Params,
                               ProfileSelector, Toast, User, UserPreferences) {
        let vm = this;
        let navigator;

        vm.apps = [];
        vm.displayApps = {};
        vm.noAppointments = true;
        vm.language = '';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "";
        vm.alert = {};

        vm.separatorStatus = [];
        vm.separatorStatus[Params.alertTypeInfo] = 'separator-info';
        vm.separatorStatus[Params.alertTypeSuccess] = 'separator-success';
        vm.separatorStatus[Params.alertTypeWarning] = 'separator-warning';
        vm.separatorStatus[Params.alertTypeDanger] = 'separator-error';

        vm.checkIntoAppointments = checkIntoAppointments;
        vm.goToAppointment = goToAppointment;
        vm.patientHasAppointmentLoading = patient => patient.apps.some(apt => apt.loading);

        activate();

        ////////////////

        function activate() {
            navigator = Navigator.getNavigator();
            vm.apps = CheckInService.getAppointmentsForCheckIn();
            vm.language = UserPreferences.getLanguage();
            const selfPatientSerNum = User.getSelfPatientSerNum();

            // Set the CheckInStatus used in this controller
            vm.apps.forEach(apt => setAppointmentCheckInStatus(apt));

            // Get the list of unique patientSerNums for check-in
            let patientSerNums = new Set(vm.apps.map(apt => apt.PatientSerNum));

            // For each patient, build an object containing all of their appointments for check-in
            patientSerNums.forEach(patientSerNum => {
                const patient = ProfileSelector.getPatientBySerNum(patientSerNum);
                const patientAppointments = vm.apps.filter(apt => apt.PatientSerNum === patientSerNum);

                // Set the header based on whether the patient is the user or a care-receiver
                const patientIsSelf = patientSerNum === selfPatientSerNum;
                let patientHeader = $filter('translate')(
                    patientIsSelf ? 'CHECKIN_PATIENT_HEADER_SELF' : 'CHECKIN_PATIENT_HEADER_NON_SELF',
                    { name: `${patient.first_name} ${patient.last_name}` }
                )

                vm.displayApps[patientSerNum] = {
                    apps: patientAppointments,
                    allCheckedIn: patientAppointments.every(apt => ['warning', 'success'].includes(apt.CheckInStatus)),
                    patientHeader: patientHeader,
                };
            });

            vm.noAppointments = vm.apps.length === 0;
        }

        /**
         * @description Sets the CheckInStatus used only by this controller and view to control the display of each appointment.
         * @param appointment The appointment to update.
         */
        function setAppointmentCheckInStatus(appointment) {
            if (appointment.CheckinPossible == 0) appointment.CheckInStatus = 'warning';
            else if (appointment.Checkin == 1) appointment.CheckInStatus = 'success';
            else if (appointment.Checkin == -1) appointment.CheckInStatus = 'danger';
            else appointment.CheckInStatus = 'info';
        }

        /**
         * @desc Displays an error state in the view, when check-in fails.
         */
        function displayError(message) {
            Toast.showToast({
                message: $filter('translate')(message),
            });
        }

        /**
         * @description Opens the individual appointment view for a given appointment, and marks it as read.
         * @param {object} appointment The appointment to open.
         */
        function goToAppointment(appointment) {
            try {
                // Clicking on an appointment for a patient should switch the profile behind the scenes
                if (ProfileSelector.getActiveProfile().patient_legacy_id !== appointment.PatientSerNum) {
                    let currentPageParams = Navigator.getParameters();
                    currentPageParams['previousProfile'] = ProfileSelector.getActiveProfile().patient_legacy_id;
                    ProfileSelector.loadPatientProfile(appointment.PatientSerNum);
                }

                // Mark the appointment and its notification(s) as read
                if (appointment.ReadStatus === '0') {
                    Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
                    // Mark corresponding notification as read
                    Notifications.implicitlyMarkCachedNotificationAsRead(
                        appointment.AppointmentSerNum,
                        Notifications.appointmentNotificationTypes(),
                    );
                }

                navigator.pushPage('./views/personal/appointments/individual-appointment.html', {'Post': appointment});
            }
            catch(error) {
                console.error(error);
                NativeNotification.showNotificationAlert($filter('translate')('APPOINTMENT_OPEN_ERROR'));
            }
        }

        /**
         * @description Checks in all appointments for the target patient.
         * @param patientSerNum The SerNum of the patient to check in.
         * @returns {Promise<void>}
         */
        async function checkIntoAppointments(patientSerNum) {
            const patient = vm.displayApps[patientSerNum];
            let patientAppointments = patient.apps;
            patientAppointments.forEach(apt => apt.loading = apt.CheckInStatus !== 'success');

            try {
                const response = await CheckInService.attemptCheckin(patientSerNum);

                if (response === 'CHECKIN_NOT_ALLOWED') displayError('CHECKIN_NOT_ALLOWED');
                else if (response === 'SUCCESS') vm.apps = CheckInService.getAppointmentsForCheckIn();
                else displayError('CHECKIN_ERROR_MULTIPLE');
            }
            catch (error) {
                console.error(error);
                displayError('CHECKIN_ERROR_MULTIPLE');
            }

            // Update the display
            $timeout(() => {
                patientAppointments.forEach(apt => {
                    apt.loading = false;
                    setAppointmentCheckInStatus(apt);
                });
                patient.allCheckedIn = patientAppointments.every(apt => ['warning', 'success'].includes(apt.CheckInStatus));
            });
        }
    }
})();
