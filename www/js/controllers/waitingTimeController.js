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
        vm.title = 'WaitingTimeController';
        vm.prevPatientDur = [];
        vm.prevPatientCheckedIn = [];
        vm.numPrevPatientsNotCheckedIn = 0;
        vm.initialNumPrevPatients = 0;
        var init = true;
        var timeout = null;

        var appointmentAriaSer = 1859684;
        function requestEstimate() {
            TimeEstimate.requestTimeEstimate(appointmentAriaSer)
                .then(function () {
                    var tmpDur = [];
                    var tmpCheckedIn = [];
                    vm.timeEstimate = TimeEstimate.getTimeEstimate();
                    for (var i = 0; i < Object.keys(vm.timeEstimate).length - 3; i++) {
                        tmpDur.push(Number(vm.timeEstimate[i]["details"]["estimated_duration"]));
                        tmpCheckedIn.push(vm.timeEstimate[i]["details"]["checked_in"] === 'true');
                    }
                    vm.prevPatientDur = tmpDur;
                    vm.prevPatientCheckedIn = tmpCheckedIn;
                    if (init) { 
                        vm.initialNumPrevPatients = vm.prevPatientDur.length;
                        init = false;
                    }
                    vm.estimatedWait = estimateWait();    
                    vm.lastUpdated = timeToString(new Date());
                },
                function(error){
                    console.log(JSON.stringify(error));
                });
        }

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
            //vm.estimatedStartTime = new Date(vm.timeEstimate[0].actual_start);
            //vm.estimatedStartTime.setMinutes(vm.estimatedStartTime.getMinutes + totalMins);
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

        // var w = window,
        //     d = document,
        //     e = d.documentElement,
        //     g = d.getElementsByTagName('body')[0],
        //     x = ((w.innerWidth || e.clientWidth || g.clientWidth) - 15) * 0.7;

        var updateCurrentTime = function() {
            setPatients();
            vm.estimatedWait = estimateWait();
            console.log("Inside updateCurrentTime");
            console.log("vm.initial " + vm.initialNumPrevPatients);
            console.log("vm.prevPatients " + vm.numPrevPatients);
            var percent = (vm.initialNumPrevPatients - vm.numPrevPatients)/vm.initialNumPrevPatients * 90;
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
        requestEstimate();
        updateCurrentTime();
        $timeout(tick, 2000)

        $scope.$on('$destroy', function(){
            $timeout.cancel(myTimeOut);
            console.log("Tick destroyed");
        });
    }
})();


