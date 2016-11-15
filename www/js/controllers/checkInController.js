(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CheckInController', CheckInController);

    CheckInController.$inject = ['CheckinService', 'NavigatorParameters', 'UserPreferences',
        '$q', 'Appointments', 'NewsBanner'];

    /* @ngInject */
    function CheckInController(CheckinService, NavigatorParameters, UserPreferences,
                               $q, Appointments, NewsBanner) {
        var vm = this;
        vm.title = 'CheckInController';
        vm.apps = [];
        vm.language = 'EN';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "CHECKED_IN";
        vm.goToAppointment = goToAppointment;
        vm.checkInToAll = checkInToAll;

        activate();

        ////////////////

        function activate() {
            vm.apps = NavigatorParameters.getParameters().Post;
            console.log(vm.apps);
            vm.language = UserPreferences.getLanguage();
            CheckinService.isAllowedToCheckin().then(function (response) {
                console.log("Allowed to Check in",response);
                verifyCheckIn(Appointments.setAppointmentsLanguage(Appointments.getCheckinAppointment()));
            }).catch(function (error) {
                console.log(error);
            });

        }

        function goToAppointment(appointment){
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
            homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
        }

        function checkInToAll(appointments){
            checkInButton.startSpin();
            checkInButton.setDisabled(true);

            var promises = [];
            for (var i=0;  i !=appointments.length; i++){
                promises.push(CheckinService.checkinToAppointment(appointments[i]));
            }

            $q.all(promises).then(function (dataArray) {
                checkInButton.stopSpin();
                vm.checkInMessage = "CHECKED_IN";
                var message = $filter('translate')("SUCCESSFULL_CHECKIN");
                NewsBanner.showCustomBanner(message, '#333333', function(){}, 500);

            }).catch(function (error) {
                console.log("CheckIn failed: ", error);
                vm.error = "SERVERPROBLEM";
            });
            
        }

        function verifyCheckIn(appointments){
            var promises = [];

            for (var i=0; i !=appointments.length; i++){
                promises.push(CheckinService.checkCheckinServer(appointments[i]));
            }

            $q.all(promises).then(function (dataArray) {
                console.log("Success checkin verify", dataArray);

                for (var checkedIn in dataArray){
                    if (dataArray[checkedIn] === false){
                        checkInButton.setDisabled(false);
                        vm.checkInMessage = "CHECKIN_TO_ALL";
                        break;
                    }
                }

            }).catch(function (error) {
                vm.error = "SERVERPROBLEM";
                console.log("Cannot verify checkin", error);
            });
        }
    }

})();

