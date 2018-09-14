/*
 *  September, 2018
 *  Github: @arthurbergmz
 *  Author: Arthur A. Bergamaschi <arthurbergmz@gmail.com>
 */

 (function () {
    'use strict';

    angular.module('MUHCApp').controller('MyWaitingTimeController', MyWaitingTimeController)
    MyWaitingTimeController.$inject = [
        '$q', '$timeout', 'MyWaitingTimeService', 'UserPreferences', 'Patient'
    ]

    /* @ngInject */
    function MyWaitingTimeController (
        $q, $timeout, MyWaitingTimeService, UserPreferences, Patient
    ) {

        var vm = this

        vm.err = null
        vm.hasData = false
        vm.waitingTimesChart = null
        vm.onTimeChart = null

        activate()

        function activate () {
            var language = UserPreferences.getLanguage().toUpperCase()
            vm.waitingTimesChart = MyWaitingTimeService.newWaitingTimesChart(language)
            vm.onTimeChart = MyWaitingTimeService.newOnTimeChart(language)
            MyWaitingTimeService.getWaitingTimes(Patient.getUserSerNum())
                .then(function (response) {
                    $timeout(function () {
                        vm.hasData = true
                        console.log('response: ', response)
                    })
                })
        }
    }

})();
