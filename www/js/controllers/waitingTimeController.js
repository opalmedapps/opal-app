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
        vm.appointments = [];
        vm.checkedInAppointments = NavigatorParameters.getParameters().checkedInAppointments;
        console.log(vm.checkedInAppointments);
        
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

        function requestEstimate() {
            vm.lastUpdated = timeToString(new Date());
            var index = 1;
            if (!vm.checkedInAppointments) {
                return;
            }
            TimeEstimate.requestTimeEstimate(vm.checkedInAppointments).then(function () {
                var timeEstimate = TimeEstimate.getTimeEstimate();
                //var appointmentAriaSers = TimeEstimate.getAppointmentAriaSers();
                for (var i = 0; i < timeEstimate.length; i++) {
                    var tmpDict = {};
                    var tmpDur = [];
                    var tmpNumNotCheckedIn = 0;
                    for (var j = 0; j < Object.keys(timeEstimate[i]).length - 4; j++) {
                        if (timeEstimate[i][j]["details"]["status"] == "In Progress") {
                            var tmpSlicedTime = Number(timeEstimate[i][j]["details"]["estimated_duration"]) - ((new Date() - new Date(timeEstimate[i][j]["details"]["actual_start"]))/60000);
                            if (tmpSlicedTime > 0) {
                                tmpDur.push(tmpSlicedTime);
                            }
                        }
                        else {
                            tmpDur.push(Number(timeEstimate[i][j]["details"]["estimated_duration"]));
                        }
                        if (!(timeEstimate[i][j]["details"]["checked_in"] == 'true')) {
                            tmpNumNotCheckedIn = tmpNumNotCheckedIn + 1;
                        }
                    }
                    tmpDict["prevPatientDur"] = tmpDur;
                    tmpDict["numPrevPatients"] = tmpDur.length;
                    tmpDict["numPrevPatientsNotCheckedIn"] = tmpNumNotCheckedIn;
                    if (!vm.appointments[i] || !vm.appointments[i].initialNumPrevPatients) {
                        tmpDict["initialNumPrevPatients"] = tmpDur.length;
                    }
                    else {
                        tmpDict["initialNumPrevPatients"] = vm.appointments[i].initialNumPrevPatients;
                    }
                    tmpDict["estimatedWait"] = estimateWait(tmpDict);
                    tmpDict["title"] = "Radiotherapy Treatment #" + index;
                    tmpDict["appointmentAriaSer"] = timeEstimate[i].appointmentAriaSer;
                    index = index + 1;
                    var percent = (tmpDict["initialNumPrevPatients"] - tmpDict["numPrevPatients"])/tmpDict["initialNumPrevPatients"] * 90;
                    if (percent <= 100) {
                        if (tmpDict["initialNumPrevPatients"] < tmpDict["numPrevPatients"]) {
                            tmpDict["percent"] = 0 + "%";
                        }
                        else tmpDict["percent"] = percent + "%";
                    }
                    vm.appointments[i] = tmpDict;
                    var element = document.getElementById('wait-time-timeline');
                    element.style.animation = "";
                }
                console.log(vm.appointments);
            },
            function(error){
                console.log(JSON.stringify(error));
                vm.estimatedWait = "No estimation available!";
            });
        }

        var estimateWait = function(tmpDict) {
            var totalMins = 0;
            for (var i = 0; i < tmpDict.prevPatientDur.length; i++) {
                totalMins = totalMins + tmpDict.prevPatientDur[i];
            }
            var hr = Math.floor(totalMins/60) > 1 ? "Hrs " : "Hr ";
            var min = Math.round(totalMins%60) > 1 ? "Mins" : "Min";
            return Math.floor(totalMins/60) + hr + Math.round(totalMins%60) + min;
        }

        function goToWaitingTimeEstimates(appointmentAriaSer) {
            $timeout.cancel(myTimeOut);
            console.log("Tick destroyed");
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'appointmentAriaSer':appointmentAriaSer});
            homeNavigator.pushPage('views/home/waiting-time/waiting-time-more-info.html');
        }
        vm.goToWaitingTimeEstimates = goToWaitingTimeEstimates;

        // var updateCurrentTime = function() {
        //     var percent = (initialNumPrevPatients - vm.numPrevPatients)/initialNumPrevPatients * 90;
        //     if (percent <= 100) {
        //         var element = document.getElementById('current-time-indicator');
        //         if (element) {
        //             element.style.left = percent + "%";
        //         }

        //         var element = document.getElementById('past-line');
        //         if (element) {
        //             element.style.width = percent + "%";
        //         }
        //     }
        // }

        var tick = function() {
            requestEstimate();
            myTimeOut = $timeout(tick, 5000);
            console.log("Inside tick");
        }
        tick();

        $scope.$on('$destroy', function(){
            $timeout.cancel(myTimeOut);
            console.log("Tick destroyed");
        });
    }
})();