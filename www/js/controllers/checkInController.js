(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CheckInController', CheckInController);

    CheckInController.$inject = ['CheckinService', 'NavigatorParameters', 'UserPreferences',
        '$q', 'Appointments'];

    /* @ngInject */
    function CheckInController(CheckinService, NavigatorParameters, UserPreferences, $q, Appointments) {
        var vm = this;
        vm.title = 'CheckInController';
        vm.apps = [];
        vm.language = 'EN';
        vm.reponse = '';
        vm.goToAppointment = goToAppointment;
        vm.checkInToAll = checkInToAll;

        activate();

        ////////////////

        function activate() {
            verifyCheckIn(Appointments.getCheckinAppointment());
            vm.apps = NavigatorParameters.getParameters().Post;
            console.log(vm.apps);
            vm.language = UserPreferences.getLanguage();

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
                vm.response = "SUCCESSFULL_CHECKIN";
                checkInButton.setDisabled(true);
            }).catch(function (error) {
                vm.response = "UNSUCCESSFULL_CHECKIN";
            });
            
        }

        function verifyCheckIn(appointments){

            var promises = [];

            for (var i=0;  i !=appointments.length; i++){
                promises.push(CheckinService.checkCheckinServer(appointments[i]));
            }

            $q.all(promises).then(function (dataArray) {
                checkInButton.setDisabled(false);
                console.log("Success checkin verify", dataArray);
            }).catch(function (error) {
                vm.error = "SERVERPROBLEM";
                console.log("No success on verify checkin", dataArray);
            });
        }
    }

})();

