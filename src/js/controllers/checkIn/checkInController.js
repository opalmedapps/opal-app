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
        '$filter',
        'Params'
    ];

    /* @ngInject */
    function CheckInController(
        CheckInService,
        NavigatorParameters,
        UserPreferences,
        NewsBanner,
        $filter,
        Params
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

                    // console.log('CheckIn Response: ' + response);

                    if(response === Params.notAllowedResponse){
                        NewsBanner.showCustomBanner($filter('translate')("NOT_ALLOWED"), '#333333', '#F0F3F4', 
                            13, 'top', function(){}, 3000);
                        vm.alert.type = Params.alertTypeWarning;
                        vm.checkInMessage = Params.checkinHospitalMessage;
                    } else if (response === Params.successResponse) {
                        vm.alert.type = Params.alertTypeSuccess;
                        vm.checkInMessage = Params.checkedInMessage;
                        vm.apps = CheckInService.getCheckInApps();
                    } else {
                        vm.alert.type = Params.alertTypeDanger;
                        vm.checkInMessage = Params.checkinErrorMessage;
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

    }
})();

