(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CheckInController', CheckInController);

    CheckInController.$inject =
        [
        'CheckinService', 'NavigatorParameters', 'UserPreferences',
        'Appointments', 'NewsBanner','$filter'
        ];

    /* @ngInject */
    function CheckInController(CheckinService, NavigatorParameters, UserPreferences,
                               Appointments, NewsBanner, $filter) {
        var vm = this;
        vm.title = 'CheckInController';
        vm.apps = [];
        vm.language = '';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "";
        vm.additionalInfo = "";
        vm.alert = {};
        vm.goToAppointment = goToAppointment;

        activate();

        ////////////////

        function activate() {
            vm.apps = Appointments.getCheckinAppointment();
            console.log(vm.apps);
            vm.language = UserPreferences.getLanguage();

            // Check if there are appointments
            if (vm.apps.length == 0){
                vm.alert.type = "info";
                vm.checkInMessage = "CHECKIN_NONE";
                return;
            }

            // Ensure that user is within range of the hospital
            CheckinService.isAllowedToCheckin()
                .then(function (response) {
                    console.log("Allowed to Check in", response);
                    return CheckinService.verifyAllCheckIn(vm.apps);
                })
                .then(function (response){
                    console.log(response);
                    if (response == null){
                        vm.alert.type = "info";
                        vm.checkInMessage = "CHECKIN_NONE";
                    } else if (response){
                        vm.alert.type = "success";
                        vm.checkInMessage = "CHECKED_IN";
                        vm.additionalInfo = "CHECKIN_ADDITIONAL";
                    } else {
                        console.log("Will call checkin");
                        CheckinService.checkinToAllAppointments(vm.apps)
                            .then(function () {
                                console.log("success");
                                vm.alert.type = "success";
                                vm.checkInMessage = "CHECKED_IN";
                                vm.additionalInfo = "CHECKIN_ADDITIONAL";
                            })
                            .catch(function (error) {
                                console.log(error);
                                vm.alert.type = "danger";
                                vm.checkInMessage = "CHECKIN_ERROR";
                            });
                    }
                })
                .catch(function (error) {
                    if (error == "NOT_ALLOWED"){
                        NewsBanner.showCustomBanner($filter('translate')("NOT_ALLOWED"), '#333333', function(){}, 3000);
                        vm.alert.type = "warning";
                        vm.checkInMessage = "CHECKIN_IN_HOSPITAL_ONLY";
                    } else {
                        vm.alert.type = "danger";
                        vm.checkInMessage = error;
                        NewsBanner.showCustomBanner($filter('translate')(error), '#333333', function(){}, 3000);
                    }
                });

        }

        function goToAppointment(appointment){
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
            homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
        }

    }

})();

