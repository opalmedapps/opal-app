/*
 *  Code by Nami DoYeon Kim July 10, 2017
 *  Github: ehdusjenny
 *  Email: ehdusjenny@gmail.com
 */

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

        var prevPatientDur = [];
        var initialNumPrevPatients = null;
        var timeout = null;
        
        vm.numPrevPatientsNotCheckedIn = null;
        vm.estimatedWait = null;
        vm.lastUpdated = null;
        vm.numPrevPatients = null;

        var appointmentAriaSer = 1859684;
        function requestEstimate() {
            TimeEstimate.requestTimeEstimate(appointmentAriaSer)
                .then(function () {
                    var tmpDur = [];
                    var tmpNumCheckedIn = 0;
                    var timeEstimate = TimeEstimate.getTimeEstimate();
                    for (var i = 0; i < Object.keys(timeEstimate).length - 3; i++) {
                        tmpDur.push(Number(timeEstimate[i]["details"]["estimated_duration"]));
                        if (timeEstimate[i]["details"]["checked_in"]) {
                            tmpNumNotCheckedIn = tmpNumCheckedIn + 1;
                        }
                    }
                    prevPatientDur = tmpDur;
                    vm.numPrevPatients = prevPatientDur.length;
                    vm.numPrevPatientsNotCheckedIn = tmpNumNotCheckedIn;
                    if (!initialNumPrevPatients) {
                        initialNumPrevPatients = prevPatientDur.length;
                    }
                    vm.estimatedWait = estimateWait();    
                    vm.lastUpdated = timeToString(new Date());
                },
                function(error){
                    console.log(JSON.stringify(error));
                });
        }

        var estimateWait = function() {
            var totalMins = 0;
            for (var i = 0; i < prevPatientDur.length; i++) {
                totalMins = totalMins + prevPatientDur[i];
            }
            var hr = Math.floor(totalMins/60) > 1 ? "Hrs " : "Hr ";
            var min = Math.round(totalMins%60) > 1 ? "Mins" : "Min";
            return Math.floor(totalMins/60) + hr + Math.round(totalMins%60) + min;
        }

        function goToWaitingTimeEstimates() {
            $timeout.cancel(myTimeOut);
            console.log("Tick destroyed");
            homeNavigator.pushPage('views/home/waiting-time/waiting-time-more-info.html', {
                checkedInAppointments: vm.checkedInAppointments
            })
        }
        vm.goToWaitingTimeEstimates = goToWaitingTimeEstimates;

        var updateCurrentTime = function() {
            vm.estimatedWait = estimateWait();
            console.log("Inside updateCurrentTime");
            console.log("vm.initial " + initialNumPrevPatients);
            console.log("vm.prevPatients " + vm.numPrevPatients);
            var percent = (initialNumPrevPatients - vm.numPrevPatients)/initialNumPrevPatients * 90;
            if (percent <= 100) {
                console.log("Inside if");
                console.log("percent " + percent);
                var element = document.getElementById('current-time-indicator');
                element.style.left = percent + "%";

                var element = document.getElementById('past-line');
                element.style.width = percent + "%";
            }
        }

        var tick = function() {
            requestEstimate();
            updateCurrentTime();
            myTimeOut = $timeout(tick, 10000);
        }
        tick();

        $scope.$on('$destroy', function(){
            $timeout.cancel(myTimeOut);
            console.log("Tick destroyed");
        });
    }
})();


