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
        var languages = {
            EN: {},
            FR: {}
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
                console.log('language requested: ', language)
                var todayTime = new Date().getTime()
                var translator = languages[language] || languages.EN
                var updater = {cached: null, deliver: function (newData) {
                    this.cached = newData
                }}
                return {
                    updater,
                    chart: {
                        type: 'column',
                        width: $(window).width() - 16,
                        events: {
                            load: function () {
                                var chartSeries = this.series
                                updater.deliver = function (newData) {
                                    console.log('building new data...', newData)
                                    var hospitalDelays = []
                                    var earlyArrival = []
                                    var dataAmount = newData.length
                                    for (var dataIndex = 0; dataIndex < dataAmount; ++dataIndex) {
                                        var dataObj = newData[dataIndex]
                                        var dataScheduledTime = dataObj.scheduledTime
                                        hospitalDelays.push([dataScheduledTime, dataObj.hospitalDelay])
                                        earlyArrival.push([dataScheduledTime, dataObj.personalWait])
                                    }
                                    console.log('updating...', hospitalDelays, earlyArrival)
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
                    navigator: { enabled: true },
                    rangeSelector: { enabled: true },
                    scrollbar: { enabled: false },
                    title: { text: '' },
                    xAxis: {
                        type: 'datetime',
                        categories: [''],
                        title: { text: 'Appointments' },
                        labels: { enabled: false }
                    },
                    yAxis: {
                        type: 'linear',
                        min: 0,
                        title: {
                            text: 'Waiting time (minutes)',
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
                    series: [
                        {
                            name: 'Minutes waiting due to hospital\'s delay',
                            data: [[todayTime, 0]],
                            color: '#c3c3f3'
                        },
                        {
                            name: 'Minutes waiting due to early arrival',
                            data: [[todayTime, 0]],
                            color: '#0000ff'
                        }
                    ]
                }
            },
            newOnTimeChart: function (language) {
                console.log('language requested: ', language)
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
                                    console.log('updating...', newData)
                                    var onTimeValue = newData[0]
                                    var tooEarlyValue = newData[1]
                                    var lateValue = newData[2]
                                    var sum = onTimeValue + tooEarlyValue + lateValue
                                    var updatedData = []
                                    if (onTimeValue > 0) {
                                        updatedData.push({
                                            name: 'On time',
                                            y: sum > 0 ? +((newData[0] / sum) * 100).toFixed(2) : 0,
                                            sliced: false,
                                            color: '#00d652'
                                        })
                                    }
                                    if (tooEarlyValue > 0) {
                                        updatedData.push({
                                            name: 'Too early',
                                            y: sum > 0 ? +((newData[1] / sum) * 100).toFixed(2) : 0,
                                            sliced: false,
                                            color: '#ffc400'
                                        })
                                    }
                                    if (lateValue > 0) {
                                        updatedData.push({
                                            name: 'Late',
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
                                    name: 'On time',
                                    y: 0,
                                    sliced: false,
                                    color: '#00d652'
                                },
                                {
                                    name: 'Too early',
                                    y: 0,
                                    sliced: false,
                                    color: '#ffc400'
                                },
                                {
                                    name: 'Late',
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
