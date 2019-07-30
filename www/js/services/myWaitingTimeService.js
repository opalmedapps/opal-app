/*
 * Filename     :   myWaitingTimeService.js
 * Description  :   
 * Created by   :   Arthur A. Bergamaschi <arthurbergmz@gmail.com>
 * Date         :   September 2018
 * Copyright    :   Copyright 2018, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 **/
angular.module('MUHCApp').service('MyWaitingTimeService', [
    '$q', 'RequestToServer',
    function ($q, RequestToServer) {
        var languages_EN = {
            waitingTitle: 'Appointments',
            waitingUnit: 'Waiting times (minutes)',
            waitingDueHospitalDelay: 'Minutes waiting due to hospital\'s delay',
            waitingDueEarlyArrival: 'Minutes waiting due to early arrival',
            usuallyOnTime: 'On time',
            usuallyTooEarly: 'Too early',
            usuallyLate: 'Late'
        }
        var languages_FR = {
            waitingTitle: 'Rendez-vous',
            waitingUnit: 'Temps d\'attente (minutes)',
            waitingDueHospitalDelay: 'Temps d\'attente causé par les délais de l\'hôpital',
            waitingDueEarlyArrival: 'Temps d\'attente causé par l\'arrivée d\'avance',
            usuallyOnTime: 'À l\'heure',
            usuallyTooEarly: 'Trop tôt',
            usuallyLate: 'En retard'
        }
        var languages = {
            EN: languages_EN,
            FR: languages_FR
        }
        function processResponse(onDone, onError) {
            return function (response) {
                var results
                if (!response || !(results = JSON.parse(response.data.results))) {
                    return onError('Invalid response.')
                }
                onDone(results)
            }
        }
        return {
            getWaitingTimes: function (patientId) {
                var promise = $q.defer()
                RequestToServer.sendRequestWithResponse('MyWaitingTime', {patientId})
                    .then(processResponse(promise.resolve, promise.reject))
                    .catch(promise.reject)
                return promise.promise
            },
            newWaitingTimesChart: function (language) {
                var todayTime = new Date().getTime()
                var translator = languages[language] || languages.EN
                var updater = {cached: null, deliver: function (newData) {
                    this.cached = newData
                }}
                return {
                    updater,
                    chart: {
                        showAxes: true,
                        type: 'column',
                        width: $(window).width() - 16,
                        events: {
                            load: function () {
                                var chartSeries = this.series
                                updater.deliver = function (newData) {
                                    var hospitalDelays = []
                                    var earlyArrival = []
                                    var dataAmount = newData.length
                                    for (var dataIndex = 0; dataIndex < dataAmount; ++dataIndex) {
                                        var dataObj = newData[dataIndex]
                                        var dataScheduledTime = dataObj.scheduledTime
                                        hospitalDelays.push([dataScheduledTime, dataObj.hospitalDelay])
                                        earlyArrival.push([dataScheduledTime, dataObj.personalWait])
                                    }
                                    chartSeries[0].setData(hospitalDelays, true, true)
                                    chartSeries[1].setData(earlyArrival, true, true)
                                }
                                if (updater.cached) {
                                    updater.deliver(updater.cached)
                                    updater.cached = null
                                }
                            }
                        }
                    },
                    navigator: { enabled: true,
                        ordinal: false,
                                    pointInterval: 3600 * 24 * 50,
                                    xAxis: {
                                        ordinal: false,
                                        labels: {
                                            align: 'left'
                                        },
                                        type: 'datetime',
                                        dateTimeLabelFormats: {
                                            day: '%Y<br/>%m-%d'
                                        }
                                    }
                                    },
                    rangeSelector: {enabled: true,
                                    buttonTheme: {
                                        visibility: 'hidden'
                                     },
                                    inputEnabled: true,
                                    inputPosition:
                                        {
                                            x:0,
                                            y: 10
                                        }
                        },
                    scrollbar: { enabled: false },
                    title: { text: '' },
                    xAxis: {
                        max: Date.now(),
                        type: 'datetime',
                        categories: [''],
                        title: { text: translator.waitingTitle },
                        labels: { enabled: false }
                    },
                    yAxis: {
                        type: 'linear',
                        min: 0,
                        title: {
                            text: translator.waitingUnit,
                            align: 'middle'
                        },
                        stackLabels: {
                            enabled: true,
                            style: {
                                fontWeight: 'bold',
                                color: 'gray'
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        headerFormat: '<span style="font-size: 10px">{point.key}</span><br/><span style="color:{point.color}"> \u25CF </span> <b>{series.name}</b>:<br/>',
                        pointFormat: '{point.y} minutes.<br/>',
                        shared: false
                    },
                    plotOptions: {
                        kdNow: true,
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: true,
                                color: 'white'
                            },
                            dataGrouping: {
                                enabled: true,
                                forced: true,
                                units: [
                                    ['day', [1]]
                                ]
                            }
                        }
                    },
                    legend: {
                        enabled: true,
                        align: 'center',
                        verticalAlign: 'bottom'
                    },
                    credits: { enabled: false },
                    exporting: {
                        buttons: {
                            contextButton: {
                                enabled: false,
                            },
                            toggle: {
                                align: 'left',
                                text: 'Click to Zoom',
                                style: {
                                    fontWeight: 'bold',
                                    color: 'white'
                                },
                                theme: {
                                    fill: '#c3c3f3',
                                    stroke:'#0000ff',
                                    padding: 7
                                },
                                menuItems: [{
                                    text: '1M',
                                    onclick: function() {
                                        this.rangeSelector.clickButton(0, true);
                                    },
                                }, {
                                    text: '3M',
                                    onclick: function() {
                                        this.rangeSelector.clickButton(1, true);
                                    }
                                }, {
                                    text: '6M',
                                    onclick: function() {
                                        this.rangeSelector.clickButton(2, true);
                                    }
                                }, {
                                    text: 'YTD',
                                    onclick: function() {
                                        this.rangeSelector.clickButton(3, true);
                                    }
                                }, {
                                    text: '1Y',
                                    onclick: function() {
                                        this.rangeSelector.clickButton(4, true);
                                    }
                                }, {
                                    text: 'All',
                                    onclick: function() {
                                        this.rangeSelector.clickButton(5, true);
                                    }
                                }]
                            }
                        }
                    },
                    series: [
                        {
                            name: translator.waitingDueHospitalDelay,
                            data: [[todayTime, 0]],
                            color: '#c3c3f3'
                        },
                        {
                            name: translator.waitingDueEarlyArrival,
                            data: [[todayTime, 0]],
                            color: '#0000ff'
                        }
                    ]
                }
            },
            newOnTimeChart: function (language) {
                var translator = languages[language] || languages.EN
                var updater = {cached: null, deliver: function (newData) {
                    this.cached = newData
                }}
                return {
                    updater,
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie',
                        width: $(window).width() - 16,
                        events: {
                            load: function () {
                                var chartSeries = this.series
                                updater.deliver = function (newData) {
                                    var onTimeValue = newData[0]
                                    var tooEarlyValue = newData[1]
                                    var lateValue = newData[2]
                                    var sum = onTimeValue + tooEarlyValue + lateValue
                                    var updatedData = []
                                    if (onTimeValue > 0) {
                                        updatedData.push({
                                            name: translator.usuallyOnTime,
                                            y: sum > 0 ? +((newData[0] / sum) * 100).toFixed(2) : 0,
                                            sliced: false,
                                            color: '#00d652'
                                        })
                                    }
                                    if (tooEarlyValue > 0) {
                                        updatedData.push({
                                            name: translator.usuallyTooEarly,
                                            y: sum > 0 ? +((newData[1] / sum) * 100).toFixed(2) : 0,
                                            sliced: false,
                                            color: '#ffc400'
                                        })
                                    }
                                    if (lateValue > 0) {
                                        updatedData.push({
                                            name: translator.usuallyLate,
                                            y: sum > 0 ? +((newData[2] / sum) * 100).toFixed(2) : 0,
                                            sliced: false,
                                            color: '#ff0000'
                                        })
                                    }
                                    chartSeries[0].setData(updatedData, true, true)
                                }
                                if (updater.cached) {
                                    updater.deliver(updater.cached)
                                    updater.cached = null
                                }
                            }
                        }
                    },
                    navigator: { enabled: false },
                    rangeSelector: { enabled: false },
                    scrollbar: { enabled: false },
                    title: { text: '' },
                    tooltip: {
                        enabled: true,
                        headerFormat: '',
                        pointFormat: '<span style="color:{point.color}"> \u25CF </span> <b>{point.name}:</b><br/>{point.y}%<br/>',
                        shared: false
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    legend: {
                        enabled: true,
                        align: 'center',
                        verticalAlign: 'top'
                    },
                    credits: { enabled: false },
                    series: [
                        {
                            name: '',
                            colorByPoint: true,
                            data: [
                                {
                                    name: translator.usuallyOnTime,
                                    y: 0,
                                    sliced: false,
                                    color: '#00d652'
                                },
                                {
                                    name: translator.usuallyTooEarly,
                                    y: 0,
                                    sliced: false,
                                    color: '#ffc400'
                                },
                                {
                                    name: translator.usuallyLate,
                                    y: 0,
                                    sliced: false,
                                    color: '#ff0000'
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
])
