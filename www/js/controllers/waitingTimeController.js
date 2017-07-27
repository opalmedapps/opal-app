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
        '$scope', '$timeout', 'TimeEstimate', 'NavigatorParameters'
    ];

    /* @ngInject */
    function WaitingTimeController(
        $scope, $timeout, TimeEstimate, NavigatorParameters)
    {
        var vm = this;

        var prevPatientDur = null;
        var initialNumPrevPatients = null;
        var myTimeOut = null;
        
        vm.numPrevPatientsNotCheckedIn = null;
        vm.estimatedWait = null;
        vm.lastUpdated = null;
        vm.numPrevPatients = null;
        vm.appointments = null;
        vm.checkedInAppointments = NavigatorParameters.getParameters().checkedInAppointments;

        var appointmentAriaSer = 1871328;
        
        function requestEstimate() {
            TimeEstimate.requestTimeEstimate(appointmentAriaSer)
                .then(function () {
                    var tmpDur = [];
                    var tmpNumNotCheckedIn = 0;
                    var timeEstimate = TimeEstimate.getTimeEstimate();
                    for (var i = 0; i < Object.keys(timeEstimate).length - 3; i++) {
                        if (timeEstimate[i]["details"]["status"] == "In Progress") {
                            var tmpSlicedTime = Number(timeEstimate[i]["details"]["estimated_duration"]) - ((new Date() - new Date(timeEstimate[i]["details"]["actual_start"]))/60000);
                            if (tmpSlicedTime > 0) {
                                tmpDur.push(tmpSlicedTime);
                            }
                        }
                        else {
                            tmpDur.push(Number(timeEstimate[i]["details"]["estimated_duration"]));
                        }
                        if (!(timeEstimate[i]["details"]["checked_in"] == 'true')) {
                            tmpNumNotCheckedIn = tmpNumNotCheckedIn + 1;
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
                    vm.estimatedWait = "No estimation available!";
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
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'checkedInAppointments':vm.checkedInAppointments});
            homeNavigator.pushPage('views/home/waiting-time/waiting-time-more-info.html', {
                checkedInAppointments: vm.checkedInAppointments
            })
        }
        vm.goToWaitingTimeEstimates = goToWaitingTimeEstimates;

        var updateCurrentTime = function() {
            var percent = (initialNumPrevPatients - vm.numPrevPatients)/initialNumPrevPatients * 90;
            if (percent <= 100) {
                var element = document.getElementById('current-time-indicator');
                if (element) {
                    element.style.left = percent + "%";  
                }

                var element = document.getElementById('past-line');
                if (element) {
                    element.style.width = percent + "%";
                }
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


