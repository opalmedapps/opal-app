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
        '$scope', '$timeout', '$filter', 'TimeEstimate', 'NavigatorParameters'
    ];

    /* @ngInject */
    function WaitingTimeMoreInfoController(
        $scope, $timeout, $filter, TimeEstimate, NavigatorParameters)
    {
        var vm = this;

        var myTimeOut = null;
        var prevPatientDur = [];
        var prevPatientCheckedIn = [];
        var firstLoad = true;

        vm.estimatedWait = null;
        vm.numPrevPatients = null;
        vm.numPrevPatientsNotCheckedIn = 0;

        var appointmentAriaSer = [{'AppointmentAriaSer': NavigatorParameters.getParameters().appointmentAriaSer}];
        function requestEstimate() {
            TimeEstimate.requestTimeEstimate(appointmentAriaSer)
                .then(function () {
                    if (document.getElementById('waiting-time-container').style.display == "none") {
                        document.getElementById('waiting-time-container').style.display = block;
                        document.getElementById('no-prev-patient').style.display = "none";
                    }
                    var tmpDur = [];
                    var tmpCheckedIn = [];
                    var timeEstimate = TimeEstimate.getTimeEstimate()[0];
                    //-3 because we don't need the last 3 attributes (Code, Timestamp, Header)
                    for (var i = Object.keys(timeEstimate).length - 5; i >= 0; i--) {
                        //console.log(i);
                        if (timeEstimate[i]["details"]["status"] == "In Progress") {
                            var tmpSlicedTime = Number(timeEstimate[i]["details"]["estimated_duration"]) - ((new Date() - new Date(timeEstimate[i]["details"]["actual_start"]))/60000);
                            if (tmpSlicedTime > 0) {
                                tmpDur.push(tmpSlicedTime);
                            }
                        }
                        else {
                            tmpDur.push(Number(timeEstimate[i]["details"]["estimated_duration"]));
                        }
                        tmpCheckedIn.push(timeEstimate[i]["details"]["checked_in"] === 'true');
                    }
                    prevPatientDur = tmpDur;
                    prevPatientCheckedIn = tmpCheckedIn;
                    vm.numPrevPatients = prevPatientDur.length;
                    vm.lastId = prevPatientDur.length;

                    var id = 1;
                    vm.data = [[]];
                    var checkedInColor = '#59D45D';
                    var notCheckedInColor = '#1A651D';

                    var hour = 0;
                    for (var i = 0; i < prevPatientDur.length; i++) {
                        var dur = prevPatientDur[i];
                        hour += dur;
                        var color;
                        if (prevPatientCheckedIn[i]) {
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
                            if (hour == 60 && i != prevPatientDur.length - 1) {
                                vm.data.push([]);
                                hour = 0;
                            }
                        }
                        id++;
                        if (i == prevPatientDur.length-1 && hour != 0) {
                            vm.data[vm.data.length-1].push({
                                y: 100 - (hour/60)*100,
                                color: 'transparent',
                                dataLabels: {
                                    enabled: false
                                }
                            });
                        }
                    }

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
                        for (var i = 0; i < prevPatientDur.length; i++) {
                            totalMins = totalMins + prevPatientDur[i];
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
                            },
                            series: {
                                animation: firstLoad
                            }
                        },
                        tooltip: {
                            formatter: function(){
                                if (this.point.color == "transparent") {
                                    return false; // Suppress the tooltips if it has no color
                                } else {                    
                                    return 'Patient #' + this.point.name + '<br>' + 
                                    this.series.name + ':<b> ' + Math.round(this.point.minutes) + ' minutes</b>';
                                }
                            }
                        },
                        series: vm.series
                    });
            },

            function(error){
                console.log(JSON.stringify(error));
                vm.message = $filter('translate')("NO_ESTIMATION");
                document.getElementById('waiting-time-container').style.display = "none";
                var container = document.getElementById('no-prev-patient');
                container.style.display = "block";
            });
        }

        var tickInterval = 60000
        var tick = function() {
            // var prevPatientExists = false;
            // var prevColor;
            // for (var i = vm.series.length-1; i >= 0; i--) {
            //     for (var j = vm.series[i].data.length-1; j >= 0; j--) {
            //         if (vm.series[i].data[j].color != 'transparent' && vm.series[i].data[j].name == vm.lastId) {
            //             prevColor = vm.series[i].data[j].color;
            //             vm.series[i].data[j].color = 'transparent';
            //             vm.series[i].data[j].name = '';
            //             clockChart.series[i].update(vm.series[i].data, false);
            //             clockChart.redraw();
            //             prevPatientExists = true;
            //         }
            //     }
            // }
            requestEstimate();
            // if (vm.numPrevPatients) {
            //     myTimeOut = $timeout(tick, tickInterval);
            //     vm.lastId = vm.lastId - 1;
            //     vm.numPrevPatients = vm.numPrevPatients - 1;
            //     if (prevColor == notCheckedInColor) {
            //         vm.numPrevPatientsNotCheckedIn = vm.numPrevPatientsNotCheckedIn - 1;
            //     }
            //     prevPatientDur.pop();
            //     vm.estimatedWait = estimateWait();
            // }
            if (!vm.numPrevPatients) {
                vm.message = $filter('translate')("NOMOREPATIENTSBEFOREYOU");
                document.getElementById('waiting-time-container').style.display = "none";
                var container = document.getElementById('no-prev-patient');
                container.style.display = "block";
            }
            myTimeOut = $timeout(tick, 10000);
        }

        requestEstimate();
        firstLoad = false;
        $timeout(tick, tickInterval);


        $scope.$on('$destroy',function(){
            $timeout.cancel(myTimeOut);
            console.log("Tick destroyed")
        });
    }
})();
