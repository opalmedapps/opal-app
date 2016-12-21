(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CheckInController', CheckInController);

    CheckInController.$inject =
        [
        'CheckinService', 'NavigatorParameters', 'UserPreferences',
        'Appointments', 'NewsBanner','$filter',
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
        vm.alert = {};
        vm.goToAppointment = goToAppointment;

        activate();

        ////////////////

        function activate() {
            vm.apps = Appointments.getCheckinAppointment();
            console.log(vm.apps);
            vm.language = UserPreferences.getLanguage();
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
                    } else {
                        console.log("Will call checkin");
                        CheckinService.checkinToAllAppointments(vm.apps)
                            .then(function () {
                                console.log("success");
                                vm.alert.type = "success";
                                vm.checkInMessage = "CHECKED_IN";
                            })
                            .catch(function (error) {
                                console.log(error);
                                vm.alert.type = "danger";
                                vm.checkInMessage = "CHECKIN_ERROR";
                            });
                    }
                })
                .catch(function (error) {
                    if (error == "Check-in allowed in the vicinity of the Cancer Center"){
                        NewsBanner.showCustomBanner($filter('translate')("NOT_ALLOWED"), '#333333', function(){}, 3000);
                        vm.alert.type = "warning";
                        vm.checkInMessage = "CHECKIN_IN_HOSPITAL_ONLY";
                    } else {
                        vm.alert.type = "danger";
                        vm.checkInMessage = "CHECKIN_ERROR";
                        NewsBanner.showCustomBanner($filter('translate')("CHECKIN_ERROR"), '#333333', function(){}, 3000);
                    }
                });

        }

        function goToAppointment(appointment){
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
            homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
        }

    }

})();

