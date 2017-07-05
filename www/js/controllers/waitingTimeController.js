(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('WaitingTimeController', WaitingTimeController);

    WaitingTimeController.$inject = [
        '$scope', '$timeout', 'TimeEstimate'
    ];

    /* @ngInject */
    function WaitingTimeController(
        $scope, $timeout, TimeEstimate)
    {
        var vm = this;
        vm.title = 'WaitingTimeController';

        var appointmentAriaSer = 1;
        TimeEstimate.requestTimeEstimate(appointmentAriaSer);
        console.log(TimeEstimate.getTimeEstimate());

        //Hardcoded time set for testing UI
        vm.estimatedStartTime = new Date().setMinutes(new Date().getMinutes() + 70);
        vm.checkedInTime = new Date();

         //vm.prevPatientStart contains the start time of all the previous patients
        vm.prevPatientStart = [ new Date(),
                                new Date().setMinutes(new Date().getMinutes() + 5),
                                new Date().setMinutes(new Date().getMinutes() + 15),
                                new Date().setMinutes(new Date().getMinutes() + 20),
                                new Date().setMinutes(new Date().getMinutes() + 45),
                                new Date().setMinutes(new Date().getMinutes() + 55)];
        //vm.prevPatientDur contains the estimated durations for all the previous patients
        vm.prevPatientDur = [5, 10, 5, 25, 10, 15];
        vm.prevPatientCheckedIn = [true, false, true, true, true, true];
        vm.initialNumPrevPatients = vm.prevPatientDur.length;
        vm.lastId = vm.prevPatientDur.length;
        vm.numPrevPatientsNotCheckedIn = 0;

        function setPatients() {
            var tmp = 0;
            for (var i = 0; i < vm.prevPatientCheckedIn.length; i++) {
                if (!vm.prevPatientCheckedIn[i]) {
                    tmp = tmp + 1;
                }
            }
            vm.numPrevPatientsNotCheckedIn = tmp;
            vm.numPrevPatients = vm.prevPatientDur.length;
        }

        function timeToString(time) {
            var hour = time.getHours() + "";
            var minute = time.getMinutes() + "";
            if (hour.length == 1) {
                hour = "0" + hour;
            }
            if (minute.length == 1) {
                minute = "0" + minute;
            }
            return hour + ":" + minute;
        }
        vm.timetoString = timeToString;

        var estimateWait = function() {
            var totalMins = 0;
            for (var i = 0; i < vm.prevPatientDur.length; i++) {
                totalMins = totalMins + vm.prevPatientDur[i];
            }
            return Math.floor(totalMins/60) + "Hrs " + totalMins%60 + "Mins";
        }
        vm.estimatedWait = estimateWait();

        function goToWaitingTimeEstimates()
        {
            homeNavigator.pushPage('views/home/waiting-time/waiting-time-more-info.html', {
                checkedInAppointments: vm.checkedInAppointments
            })
        }
        vm.goToWaitingTimeEstimates = goToWaitingTimeEstimates;

        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = ((w.innerWidth || e.clientWidth || g.clientWidth) - 15) * 0.7;

        var updateCurrentTime = function() {
            vm.prevPatientStart.pop();
            vm.prevPatientDur.pop();
            vm.prevPatientCheckedIn.pop();
            setPatients();
            vm.estimatedWait = estimateWait();

            var percent = (vm.initialNumPrevPatients - vm.numPrevPatients)/vm.initialNumPrevPatients * 90;
            if (percent <= 100) {
                var element = document.getElementById('current-time-indicator');
                element.style.left = percent + "%";

                var element = document.getElementById('past-line');
                element.style.width = percent + "%";
            }
        }

        var tickInterval = 2000 
        var tick = function() {
            updateCurrentTime();
            vm.myTimeOut = $timeout(tick, tickInterval);
        }

        angular.element(function() {
            init();
        });

        var init = function() {
            vm.lastUpdated = timeToString(new Date());
            $timeout(tick, tickInterval);
        }

        $scope.$on('$destroy', function(){
            $timeout.cancel(vm.myTimeOut);
            console.log("Tick destroyed")
        });
    }
})();


