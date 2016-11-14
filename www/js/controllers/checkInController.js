(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CheckInController', CheckInController);

    CheckInController.$inject = ['CheckinService', 'NavigatorParameters', 'UserPreferences', '$q'];

    /* @ngInject */
    function CheckInController(CheckinService, NavigatorParameters, UserPreferences, $q) {
        var vm = this;
        vm.title = 'CheckInController';
        vm.apps = [];
        vm.language = 'EN';
        vm.goToAppointment = goToAppointment;
        activate();

        ////////////////

        function activate() {
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

            }).catch(function (error) {

            });
            
        }

        function verifyCheckIn(appointments){

            var promises = [];

            for (var i=0;  i !=appointments.length; i++){
                promises.push(CheckinService.checkCheckinServer(appointments[i]));
            }

            $q.all(promises).then(function (dataArray) {
                
            }).catch(function (error) {
                
            });
        }
    }

})();

