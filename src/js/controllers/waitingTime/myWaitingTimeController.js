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
        vm.patientFrequencyInformation = ''

        activate()

        function activate () {
            var language = UserPreferences.getLanguage().toUpperCase()
            vm.waitingTimesChart = MyWaitingTimeService.newWaitingTimesChart(language)
            vm.onTimeChart = MyWaitingTimeService.newOnTimeChart(language)
            MyWaitingTimeService.getWaitingTimes(Patient.getUserSerNum())
                .then(function (response) {
                    var waitingTimes = response.waitingTimes
                    var onTime = response.onTime
                    $timeout(function () {
                        var onTimeNames = ['MY_WAITING_TIME_USUALLY_ON_TIME', 'MY_WAITING_TIME_USUALLY_TOO_EARLY', 'MY_WAITING_TIME_USUALLY_LATE']
                        var onTimeValues = [onTime.onTime, onTime.tooEarly, onTime.late]
                        vm.waitingTimesChart.updater.deliver(waitingTimes)
                        vm.onTimeChart.updater.deliver(onTimeValues)
                        var highestCategoryValue = -1
                        var highestCategoryName = null
                        for (var categoryIndex = 0; categoryIndex < 3; ++categoryIndex) {
                            var categoryValue = onTimeValues[categoryIndex]
                            if (categoryValue > highestCategoryValue) {
                                highestCategoryValue = categoryValue
                                highestCategoryName = onTimeNames[categoryIndex]
                            }
                        }
                        vm.patientFrequencyInformation = highestCategoryName || ''
                        vm.hasData = true
                    })
                })
        }
    }

})();
