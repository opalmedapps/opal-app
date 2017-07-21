/*
 *  Code by Nami DoYeon Kim July 10, 2017
 *  Github: ehdusjenny
 *  Email: ehdusjenny@gmail.com
 */
 (function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('WaitingTimeMoreInfoController', WaitingTimeMoreInfoController);

    WaitingTimeMoreInfoController.$inject = [
        '$scope', '$timeout', 'TimeEstimate'
    ];

    /* @ngInject */
    function WaitingTimeMoreInfoController(
        $scope, $timeout, TimeEstimate)
    {
        var vm = this;
        vm.title = 'WaitingTimeMoreInfoController';
        vm.prevPatientDur = [];
        vm.prevPatientCheckedIn = [];
        vm.numPrevPatientsNotCheckedIn = 0;
        vm.initialNumPrevPatients = 0;
        var myTimeOut = null;

        var appointmentAriaSer = 1859684;
        function requestEstimate() {
            TimeEstimate.requestTimeEstimate(appointmentAriaSer)
                .then(function () {
                    var tmpDur = [];
                    var tmpCheckedIn = [];
                    vm.timeEstimate = TimeEstimate.getTimeEstimate();
                    console.log(vm.timeEstimate);
                    //-3 because we don't need the last 3 attributes (Code, Timestamp, Header)
                    for (var i = Object.keys(vm.timeEstimate).length - 3 - 1; i >= 0; i--) {
                        console.log(i);
                        tmpDur.push(Number(vm.timeEstimate[i]["details"]["estimated_duration"]));
                        tmpCheckedIn.push(vm.timeEstimate[i]["details"]["checked_in"] === 'true');
                    }
                    vm.prevPatientDur = tmpDur;
                    vm.prevPatientCheckedIn = tmpCheckedIn;
                    console.log(vm.prevPatientDur);
                    console.log(vm.prevPatientCheckedIn);
                    vm.initialNumPrevPatients = vm.prevPatientDur.length;
                    vm.numPrevPatients = vm.prevPatientDur.length;
                    vm.lastId = vm.prevPatientDur.length;

                    var id = 1;
                    vm.data = [[]];
                    var checkedInColor = '#59D45D';
                    var notCheckedInColor = '#1A651D';

                    var hour = 0;
                    for (var i = 0; i < vm.prevPatientDur.length; i++) {
                        var dur = vm.prevPatientDur[i];
                        hour += dur;
                        var color;
                        if (vm.prevPatientCheckedIn[i]) {
                            color = checkedInColor;
                        }
                        else {
                            color = notCheckedInColor;
                            vm.numPrevPatientsNotCheckedIn += 1;
                        }
                        var tmp;
                        if (hour > 60) {
                            vm.data[vm.data.length-1].push({
                                name: id,
                                y: ((dur - (hour - 60))/60) * 100,
                                minutes: dur - (hour - 60),
                                color: color
                            });
                            vm.data.push([{
                                name: id,
                                y: ((hour - 60)/60) * 100,
                                minutes: hour - 60,
                                color: color
                            }]);
                            hour = hour - 60;
                        }
                        else {
                            vm.data[vm.data.length-1].push({
                                name: id,
                                y: (dur/60) * 100,
                                minutes: dur,
                                color: color
                            });
                            if (hour == 60 && i != vm.prevPatientDur.length - 1) {
                                vm.data.push([]);
                                hour = 0;
                            }
                        }
                        id++;
                        if (i == vm.prevPatientDur.length-1 && hour != 0) {
                            vm.data[vm.data.length-1].push({
                                y: 100 - (hour/60)*100,
                                color: 'transparent',
                                dataLabels: {
                                    enabled: false
                                }
                            });
                        }
                    }

                    console.log(vm.data);

                    var w = window,
                        d = document,
                        e = d.documentElement,
                        g = d.getElementsByTagName('body')[0],
                        x = (w.innerWidth || e.clientWidth || g.clientWidth) - 15;
                    var sizes = [];
                    var width = x/(vm.data.length + 1.5);
                    var innerDiameter = 80;
                    sizes.push([innerDiameter, innerDiameter + width]);
                    for (var i = 2; i <= vm.data.length; i++) {
                        sizes.push([innerDiameter + (i-1)*width, innerDiameter + i*width]);
                    }

                    vm.series = [];
                    vm.series.push({
                        name: '',
                        data: [
                            {y: 25,
                            name: '15min',
                            color: 'lightgrey'},
                            {y: 25,
                            name: '30min',
                            color: 'lightgrey'},
                            {y: 25,
                            name: '45min',
                            color: 'lightgrey'},
                            {y: 25,
                            name: '60min',
                            color: 'lightgrey'}],
                        size: 80,
                        dataLabels: {
                            color: 'black',
                            distance: -15,
                            style: {
                                textOutline: false,
                                fontSize: 8,
                                fontWeight: 'none'
                            }
                        }
                    });
                    for (var i = 0; i < vm.data.length; i++) {
                        vm.series.push({
                            name: 'Duration',
                            data: vm.data[i],
                            innerSize: sizes[i][0],
                            size: sizes[i][1],
                            dataLabels: {
                                color: '#ffffff',
                                distance: -width/4,
                                style: {
                                    textOutline: false
                                }
                            }
                        })
                    }

                    var estimateWait = function() {
                        var totalMins = 0;
                        for (var i = 0; i < vm.prevPatientDur.length; i++) {
                            totalMins = totalMins + vm.prevPatientDur[i];
                        }
                        var hr = Math.floor(totalMins/60) > 1 ? "Hrs " : "Hr ";
                        var min = Math.round(totalMins%60) > 1 ? "Mins" : "Min";
                        return Math.floor(totalMins/60) + hr + Math.round(totalMins%60) + min;
                    }
                    vm.estimatedWait = estimateWait();

                    // Create the chart
                    var clockChart = new Highcharts.chart('waiting-time-container', {
                        chart: {
                            type: 'pie',
                            backgroundColor: null,
                            height: x + 50
                        },
                        title: {
                            text: ''
                        },
                        credits: false,
                        plotOptions: {
                            pie: {
                                shadow: false,
                                center: ['50%', '50%']
                            }
                        },
                        tooltip: {
                            formatter: function(){
                                if (this.point.color == "transparent" || this.point.color == "lightgrey") {
                                    return false; // Suppress the tooltips if it has no color
                                } else {                    
                                    return 'Patient #' + this.point.name + '<br>' + 
                                    this.series.name + ':<b> ' + this.point.minutes +' minutes</b>';
                                }
                            }
                        },
                        series: vm.series
                    });
            },

            function(error){
                console.log(JSON.stringify(error));
            });
        }

        var tickInterval = 60000
        var tick = function() {
            var exists = false;
            var prevColor;
            for (var i = vm.series.length-1; i >= 0; i--) {
                for (var j = vm.series[i].data.length-1; j >= 0; j--) {
                    if (vm.series[i].data[j].color != 'transparent' && vm.series[i].data[j].name == vm.lastId) {
                        prevColor = vm.series[i].data[j].color;
                        vm.series[i].data[j].color = 'transparent';
                        vm.series[i].data[j].name = '';
                        clockChart.series[i].update(vm.series[i].data, false);
                        clockChart.redraw();
                        exists = true;
                    }
                }
            }
            if (exists) {
                myTimeOut = $timeout(tick, tickInterval);
                vm.lastId = vm.lastId - 1;
                vm.numPrevPatients = vm.numPrevPatients - 1;
                if (prevColor == notCheckedInColor) {
                    vm.numPrevPatientsNotCheckedIn = vm.numPrevPatientsNotCheckedIn - 1;
                }
                vm.prevPatientDur.pop();
                vm.estimatedWait = estimateWait();
            }
            else {
                document.getElementById('waiting-time-container').style.display = "none";
                var container = document.getElementById('no-prev-patient');
                container.style.display = "block";
            }
        }


        requestEstimate();
        $timeout(tick, tickInterval);


        $scope.$on('$destroy',function(){
            $timeout.cancel(myTimeOut);
            console.log("Tick destroyed")
        });
    }
})();
