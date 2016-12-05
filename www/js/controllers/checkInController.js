(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CheckInController', CheckInController);

    CheckInController.$inject = ['CheckinService', 'NavigatorParameters', 'UserPreferences',
        '$q', 'Appointments', 'NewsBanner','$filter'];

    /* @ngInject */
    function CheckInController(CheckinService, NavigatorParameters, UserPreferences,
                               $q, Appointments, NewsBanner, $filter) {
        var vm = this;
        vm.title = 'CheckInController';
        vm.apps = [];
        vm.language = '';
        vm.response = '';
        vm.error = '';
        vm.checkInMessage = "";
        vm.alertType = "";
        vm.goToAppointment = goToAppointment;
        //vm.checkInToAll = checkInToAll;
        //vm.testButton = testButton;

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
                    if (reponse == null){
                        vm.alertType = "info";
                        vm.message = "CHECKIN_NONE";
                    } else if (response){
                        vm.alertType = "success";
                        vm.message = "CHECKED_IN";
                    } else {
                        console.log("Will call checkin");
                        /*CheckinService.checkinToAllAppointments()
                            .then(function () {
                                vm.alertType = "success";
                                vm.message = "CHECKED_IN";
                            })
                            .catch(function (error) {
                                console.log(error);
                                vm.message = "CHECKIN_ERROR";
                            });*/
                    }
                })
                .catch(function (error) {
                    if (error == "Check-in allowed in the vicinity of the Cancer Center"){
                        NewsBanner.showCustomBanner($filter('translate')("NOT_ALLOWED"), '#333333', function(){}, 3000);
                        vm.alertType = "warning";
                        vm.checkInMessage = "CHECKIN_IN_HOSPITAL_ONLY";
                    } else {
                        vm.alertType = "danger";
                        NewsBanner.showCustomBanner($filter('translate')("CHECKIN_ERROR"), '#333333', function(){}, 3000);
                    }
                });

        }

        function goToAppointment(appointment){
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
            homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
        }

/*        function checkInToAll(appointments){

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

        }*/

        /*function testButton(){
         checkInButton.setDisabled(true);
         console.log("Button works");
         checkInButton.startSpin();
         }*/
    }

})();

