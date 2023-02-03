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
        vm.checkedInApps = {};
        vm.language = '';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "";
        vm.alert = {};
        vm.HasNonCheckinableAppt = false;
        vm.emptyApps = false;
        vm.statusColor = []
        vm.statusColor[Params.alertTypeSuccess] = 'green';
        vm.statusColor[Params.alertTypeInfo] = 'rgba(38,100,171,0.81)';
        vm.statusColor[Params.alertTypeDanger] = 'red';


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
                }
                vm.displayApps[app.PatientSerNum].apps.push(app);
                vm.displayApps[app.PatientSerNum].patientName = app.patientName;
            });
            vm.language = UserPreferences.getLanguage();

            vm.HasNonCheckinableAppt =  HasNonCheckinableAppointment(vm.apps);

            const parameters = NavigatorParameters.getParameters();
            if (parameters.hasOwnProperty('apps')) {
                vm.checkedInApps[parameters.apps.key] = parameters.apps.apps;
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

        /**
         * @return void
         * @description Check-in all the appointments and update appointment array
         */
        async function CheckInAppointments(patientSerNum) {
            //  const response = await CheckInService.attemptCheckin();
            // if(response === "NOT_ALLOWED"){
            //     Toast.showToast({
            //         message: $filter('translate')("NOT_ALLOWED"),
            //     });
            //     vm.alert.type = Params.alertTypeWarning;
            //     vm.checkInMessage = "CHECKIN_IN_HOSPITAL_ONLY";
            // } else if (response === "SUCCESS") {
            //     vm.alert.type = Params.alertTypeSuccess;
            //     vm.checkInMessage = "CHECKED_IN";
            //     vm.displayApps = CheckInService.getCheckInApps();
            // } else {
            //     vm.alert.type = Params.alertTypeDanger;
            //     vm.checkInMessage = "CHECKIN_ERROR";
            //     vm.displayApps = CheckInService.getCheckInApps();
            //     vm.error = "ERROR";
            // }


            // let patientApps = {
            //     key: patientName,
            //     apps: vm.displayApps[patientName],
            // };
            // delete vm.displayApps[patientName];
            //
            // if (Object.keys(vm.displayApps).length == 0) {
            //     vm.emptyApps = true;
            // }
            //
            // NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'apps': patientApps});
            // homeNavigator.pushPage('./views/home/checkin/checked-in-list.html');
            console.log(patientSerNum);
            $timeout(() => {
                vm.displayApps[patientSerNum].apps.forEach(app => {
                    app.loading = true;
                })
            });

            $timeout(() => {
                let allCheckIn = 0;
                vm.displayApps[patientSerNum].apps.forEach(app => {
                    app.Checkin = '1';
                    app.loading = false;
                    app.CheckInStatus = patientSerNum == '51' ? 'success':'danger';
                })
                vm.displayApps[patientSerNum].allCheckedIn = 1;
            }, 3000);

            // vm.displayApps[PatientSerNum].forEach(app => {
            //     app.loading = true;
            // })
            //
            // //TODO check-in apps for the target patient
            // const response = await CheckInService.attemptCheckin(PatientSerNum);
            //
            // $timeout(() => {
            //     let allCheckedIn = true;
            //     vm.displayApps[PatientSerNum].forEach(app => {
            //         const appt = response.appts.find(appt => appt.AppointmentSerNum == app.AppointmentSerNum);
            //         if (appt) {
            //             app.Checkin = appt.Checkin;
            //             app.loading = false;
            //             allCheckedIn =  allCheckedIn && app.CheckInStatus == 'success';
            //         }
            //     })
            //     vm.displayApps[PatientSerNum].allCheckedIn = allCheckedIn;
            // }, 3000);
        }
    }
})();

