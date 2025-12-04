// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   checkInController.js
 * Description  :   Manages user checkin to their appointments
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('CheckInController', CheckInController);

    CheckInController.$inject = ['$filter', '$timeout', 'CheckInService', 'NativeNotification', 'Navigator', 'Params',
        'ProfileSelector', 'RequestToServer', 'Toast', 'User', 'UserPreferences'];

    /* @ngInject */
    function CheckInController($filter, $timeout, CheckInService, NativeNotification, Navigator, Params,
                               ProfileSelector, RequestToServer, Toast, User, UserPreferences) {
        let vm = this;
        let navigator;

        vm.apps = [];
        vm.displayApps = {};
        vm.noAppointments = true;
        vm.language = '';
        vm.loadingError = false;
        vm.loadingPage = true;
        vm.errorAlertType = Params.alertTypeDanger;

        vm.separatorStatus = {
            [Params.alertTypeInfo]: 'separator-info',
            [Params.alertTypeSuccess]: 'separator-success',
            [Params.alertTypeWarning]: 'separator-warning',
            [Params.alertTypeDanger]: 'separator-error',
        }

        vm.checkIntoAppointments = checkIntoAppointments;
        vm.goToAppointment = goToAppointment;
        vm.patientHasAppointmentLoading = patient => patient.apps.some(apt => apt.loading);

        activate();

        ////////////////

        async function activate() {
            try {
                navigator = Navigator.getNavigator();
                vm.language = UserPreferences.getLanguage();

                await initializeCheckInData();
                vm.apps = CheckInService.getAppointmentsForCheckIn();

                // Set the CheckInStatus used in this controller
                vm.apps.forEach(apt => setAppointmentCheckInStatus(apt));

                formatAppointmentsForDisplay();

                vm.noAppointments = vm.apps.length === 0;
            }
            catch (error) {
                console.error(error);
                vm.loadingError = true;
            }
            finally {
                $timeout(() => {
                    vm.loadingPage = false;
                });
            }
        }

        /**
         * @description Calls the backend to get appointment data for check-in, and saves it to the Check-In service.
         * @returns {Promise<void>}
         */
        async function initializeCheckInData() {
                const response = await RequestToServer.apiRequest(Params.API.ROUTES.CHECK_IN);
                CheckInService.setAppointmentsForCheckIn(response.data?.daily_appointments);
        }

        /**
         * @description Organizes the check-in-able appointments in the right data structure for display in the view.
         */
        function formatAppointmentsForDisplay() {
            const selfPatientSerNum = User.getSelfPatientSerNum();

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
            patientAppointments.forEach(apt => apt.loading = !['warning', 'success'].includes(apt.CheckInStatus));

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
