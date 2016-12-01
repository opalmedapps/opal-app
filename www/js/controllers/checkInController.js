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
        vm.language = '';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "CHECKED_IN";
        vm.goToAppointment = goToAppointment;
        vm.checkInToAll = checkInToAll;

        activate();

        ////////////////

        function activate() {
            vm.apps = Appointments.getCheckinAppointment();
            console.log(vm.apps);
            vm.language = UserPreferences.getLanguage();
            CheckinService.isAllowedToCheckin().then(function (response) {
                console.log("Allowed to Check in",response);
                verifyCheckIn(Appointments.getCheckinAppointment());
            }).catch(function (error) {
                if (error.code == "Check-in allowed in the vicinity of the Cancer Center"){
                    NewsBanner.showCustomBanner($filter('translate')("NOT_ALLOWED"), '#333333', function(){}, 3000);
                } else {
                    NewsBanner.showCustomBanner($filter('translate')("CHECKIN_ERROR"), '#333333', function(){}, 3000);
                }
                console.log(error);
            });

        }

        function goToAppointment(appointment){
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
            homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
        }

        function checkInToAll(appointments){
            checkInButton.setDisabled(true);
            checkInButton.startSpin();

            var promises = [];
            for (var i=0;  i !=appointments.length; i++){
                promises.push(CheckinService.checkinToAppointment(appointments[i]));
            }

            $q.all(promises).then(function (dataArray) {
                checkInButton.stopSpin();
                vm.checkInMessage = "CHECKED_IN";
                var message = $filter('translate')("CHECKED_IN");
                NewsBanner.showCustomBanner(message, '#333333', function(){}, 500);
                console.log(dataArray);

            }).catch(function (error) {
                console.log("CheckIn failed: ", error);
                vm.error = "SERVERPROBLEM";
            });
            
        }

        function verifyCheckIn(appointments){
            var promises = [];

            if (!appointments){
                vm.checkInMessage = "CHECKIN_NONE";
                return;
            }

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
                NewsBanner.showCustomBanner($filter('translate')("CHECKIN_ERROR"), '#333333', function(){}, 3000);
                console.log("Cannot verify checkin", error);
            });
        }
    }

})();

