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

    CheckInController.$inject = ['$filter', '$timeout', 'CheckInService', 'Navigator', 'Params', 'Toast', 'User',
        'UserPreferences'];

    /* @ngInject */
    function CheckInController($filter, $timeout, CheckInService, Navigator, Params, Toast, User,
                               UserPreferences) {
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

        activate();

        ////////////////

        function activate() {
            navigator = Navigator.getNavigator();
            vm.apps = CheckInService.getAppointmentsForCheckIn();
            vm.language = UserPreferences.getLanguage();
            const selfPatientSerNum = User.getSelfPatientSerNum();

            // Get the list of unique patientSerNums for check-in
            let patientSerNums = new Set(vm.apps.map(apt => apt.PatientSerNum));

            // For each patient, build an object containing all of their appointments for check-in
            patientSerNums.forEach(patientSerNum => {
                const patientAppointments = vm.apps.filter(apt => apt.PatientSerNum === patientSerNum);

                // Set the header based on whether the patient is the user or a care-receiver
                let patientHeader;
                const patientIsSelf = patientSerNum === selfPatientSerNum;
                const fullName = `${patient.first_name} ${patient.last_name}`;
                if (patientIsSelf) patientHeader = vm.language === 'EN' ? 'Your appointments' : 'Vos rendez-vous';
                else patientHeader = vm.language === 'EN' ? `${fullName}'s appointments` : `Rendez-vous de ${fullName}`;

                vm.displayApps[patientSerNum] = {
                    apps: patientAppointments,
                    allCheckedIn: patientAppointments.every(apt => ['warning', 'success'].includes(apt.CheckInStatus)),
                    patientHeader: patientHeader,
                };
            });

            // TODO needed?
            vm.noAppointments = Object.keys(vm.displayApps).length === 0;
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
            if(appointment.ReadStatus === '0') {
                Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
                // Mark corresponding notification as read
                Notifications.implicitlyMarkCachedNotificationAsRead(
                    appointment.AppointmentSerNum,
                    Notifications.appointmentNotificationTypes(),
                );
            }
            navigator.pushPage('./views/personal/appointments/individual-appointment.html', {'Post': appointment});
        }

        /**
         * @description Checks in all appointments for the target patient.
         * @param patientSerNum The SerNum of the patient to check in.
         * @returns {Promise<void>}
         */
        async function checkIntoAppointments(patientSerNum) {
            app.loading = vm.displayApps[patientSerNum].apps.some(app => app.CheckInStatus !== 'success');

            try {
                const response = await CheckInService.attemptCheckin(patientSerNum);

                if (response === 'CHECKIN_NOT_ALLOWED') displayError('CHECKIN_NOT_ALLOWED');
                else if (response === 'SUCCESS') vm.apps = CheckInService.getAppointmentsForCheckIn();
                else displayError('CHECKIN_ERROR');
            }
            catch (error) {
                console.log(error);
                displayError('CHECKIN_ERROR');
            }

            // TODO -- figure out what's being done and update it to be clearer
            $timeout(() => {
                let allCheckedIn = true;
                vm.displayApps[patientSerNum].apps.forEach(app => {
                    const appt = vm.apps.find(appt => appt.AppointmentSerNum == app.AppointmentSerNum);
                    if (appt) {
                        app.Checkin = appt.Checkin;
                        app.loading = false;
                        app.CheckInStatus = appt.Checkin == '1' ? 'success' : 'danger';
                        app.CheckInStatus = appt.checkinpossible == 0 ? 'warning' : app.CheckInStatus;
                        allCheckedIn =  allCheckedIn && ['warning', 'success'].indexOf(app.CheckInStatus) > -1;
                    }
                })
                vm.displayApps[patientSerNum].allCheckedIn = allCheckedIn;
            });
        }
    }
})();
