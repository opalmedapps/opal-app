import '../../../css/views/radiotherapy.view.css';

/**
 * @description Controller for the radiotherapy view.
 * @author Kayla O'Sullivan-Steben
 * @date March 2021
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('RadiotherapyController', RadiotherapyController);

    RadiotherapyController.$inject = ['Navigator', 'Radiotherapy', 'UserPreferences'];

    function RadiotherapyController(Navigator, Radiotherapy, UserPreferences) {
        let vm = this;

        let navigator;

        vm.language = '';
        vm.loading = true;
        vm.noRTPlans = true;
        vm.RTPlans = [];

        vm.openRTPlan = plan => navigator.pushPage('views/personal/radiotherapy/individual-radiotherapy.html', { Post: plan });

        activate();

        ////////////////

        function activate() {
            navigator = Navigator.getNavigator();
            vm.language = UserPreferences.getLanguage();

            Radiotherapy.requestRTDicoms(1).then(RTPlans => {
                vm.loading  = false;
                vm.RTPlans = RTPlans;
                vm.noRTPlans = vm.RTPlans.length === 0;

            }).catch(error => {
                console.error(error);
                vm.loading = false;
                vm.RTPlans = [];
                vm.noRTPlans = true;
            });
        }
    }
})();
