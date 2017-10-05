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
            console.log("vm.checkedInAppointments length: " + vm.checkedInAppointments.length);
            TimeEstimate.requestTimeEstimate(vm.checkedInAppointments).then(function () {
                var timeEstimate = TimeEstimate.getTimeEstimate();
                console.log("timeEstimate length: " + timeEstimate.length);
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
                        var element = document.getElementById('wait-time-timeline');
                        element.style.animation = "";
                    }
                    tmpDict["estimatedWait"] = estimateWait(tmpDict);
                    tmpDict["title"] = "Daily Radiotherapy Treatment";
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
                    console.log("vm.appointments length: " + vm.appointments.length);
                }
                vm.appointments = vm.appointments.sort(function(a, b){
                    if (a.numPrevPatients < b.numPrevPatients) {
                        return -1;
                    }
                    else return 1;
                });
                myTimeOut = $timeout(tick, 60000);
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
            homeNavigator.pushPage('views/home/checkin/waiting-time-more-info.html');
        }
        vm.goToWaitingTimeEstimates = goToWaitingTimeEstimates;

        var tick = function() {
            console.log("Inside tick");
            requestEstimate();
        }
        tick();

        $scope.$on('$destroy', function(){
            $timeout.cancel(myTimeOut);
            console.log("Tick destroyed");
        });
    }
})();