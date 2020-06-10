/*
 * Filename     :   delaysService.js
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
angular.module('MUHCApp').service('DelaysService', [
    '$q', 'RequestToServer', '$timeout', 'Params',
    function ($q, RequestToServer, $timeout, Params) {
        var languages_en = {
            appointmentData: Params.delayServiceEn,
            formatDay: function (day) {
                var trim = day % 100
                return '' + day + '' + (Params.delayServiceEn.daySuffixes[(trim - 20) % 10] || Params.delayServiceEn.daySuffixes[trim] || Params.delayServiceEn.daySuffixes[0])
            },
            formatHour: function (hour) {
                if (hour > 0) {
                    return {
                        time: hour >= 13 ? hour - 12 : hour,
                        daySuffix: hour >= 18 ? Params.delayServiceEn.dayInterval[0] : (hour >= 12 ? Params.delayServiceEn.dayInterval[1] : Params.delayServiceEn.dayInterval[2]),
                        timeSuffix: hour >= 12 ? Params.delayServiceEn.timeInterval[1] : Params.delayServiceEn.timeInterval[0]
                    }
                } else {
                    if(hour == 0) {
                        return {
                            time: 12,
                            daySuffix: Params.delayServiceEn.dayInterval[2],
                            timeSuffix: Params.delayServiceEn.timeInterval[0]
                        }
                    } else {
                        return {
                            time: 12 + hour,
                            daySuffix: Params.delayServiceEn.dayInterval[0],
                            timeSuffix: Params.delayServiceEn.timeInterval[1]
                        }
                    }
                }
            },
            formatDate: function (scheduledDate) {
                var day = scheduledDate.getDate()
                return Params.delayServiceEn.months[scheduledDate.getMonth()] + ' ' + this.formatDay(day) + ', ' + scheduledDate.getFullYear()
            },
            formatMinutes: function(scheduledMinute){
                if (scheduledMinute < 10){
                    return '0' + scheduledMinute
                } else{
                    return scheduledMinute
                }
            },
            makePlural: function(appointmentDescription){
                var inProgress = appointmentDescription.split(" ")
                var i = inProgress.indexOf("Appointment")
                if(i !== -1) {
                    inProgress[i] = "Appointments"
                }
                var a = inProgress.indexOf("a")
                if(a !== -1){
                    var at = inProgress.indexOf("at")
                    //if there's an at, the noun to make plural came just before, and if not, it's at the end
                    if(at == -1){
                        var length = inProgress.length
                        inProgress[length-1] = inProgress[length-1] + 's'
                    }else{
                        inProgress[at - 1] = inProgress[at -1] + 's'
                    }
                    inProgress[a] = null
                }
                var pluralAppointmentDescription = inProgress.join(" ")
                return pluralAppointmentDescription
            },
            buildHistoricalDelayInfo: function (appointmentDescription, scheduledDate, delayData) {
                if (delayData !== null && delayData.appointmentType !== null) {
                    var pluralAppointmentDescription = this.makePlural(appointmentDescription)
                    var hourFormat = this.formatHour(delayData.scheduledHour)
                    var lowerLimit = delayData.scheduledHour -1
                    lowerLimit = this.formatHour(lowerLimit)
                    var upperLimit = delayData.scheduledHour + 1
                    upperLimit = this.formatHour(upperLimit)
                    var minuteFormat = this.formatMinutes(delayData.scheduledMinutes)
                    var date = this.formatDate(scheduledDate)
                    var amountOfTime = Params.delayServiceEn.setsDescription[retrieveSet(delayData)] || Params.delayServiceEn.setsDescription.unknown
                    var day = [Params.delayServiceEn.daysSingular[delayData.scheduledDay], Params.delayServiceEn.daysPlural[delayData.scheduledDay]]
                    return {
                        date,
                        title: pluralAppointmentDescription + ' on ' + day[1] + ' between ' + lowerLimit.time + ':' + minuteFormat + ' ' + lowerLimit.timeSuffix + ' and ' + upperLimit.time + ':' + minuteFormat + ' ' + upperLimit.timeSuffix,
                        description: 'Your ' + appointmentDescription + ' is on a ' + day[0] + ' ' + hourFormat.daySuffix + ', at ' + hourFormat.time + ':' + minuteFormat + ' ' + hourFormat.timeSuffix + '.',
                        delayInfo: 'Patients usually wait ' + amountOfTime + ' for this kind of appointment.'
                    }
                } else{
                    return {
                        date,
                        title: appointmentDescription,
                        description: 'Your ' + appointmentDescription + " has not yet been visualized. ",
                        delayInfo: Params.delayServiceEn.notEnoughData
                    }
                }
            }
        };
        var languages_fr = {
            appointmentData: Params.delayServiceFr,
            formatHour: function (hour) {
                return {
                    time: hour,
                    daySuffix: hour >= 18 ? Params.delayServiceFr.dayInterval[0] : (hour >= 12 ? Params.delayServiceFr.dayInterval[1] : Params.delayServiceFr.dayInterval[2]),
                    timeSuffix: ''
                }
            },
            formatDate: function (scheduledDate) {
                return scheduledDate.getDate() + ' ' + this.months[scheduledDate.getMonth()] + ' ' + scheduledDate.getFullYear()
            },
            formatMinutes: function(scheduledMinute){
                if (scheduledMinute < 10){
                    return '0' + scheduledMinute
                } else{
                    return scheduledMinute
                }
            },
            buildHistoricalDelayInfo: function (appointmentDescription, scheduledDate, delayData) {
                if (delayData !== null && delayData.appointmentType !== null) {
                    var hourFormat = this.formatHour(delayData.scheduledHour)
                    var minuteFormat = this.formatMinutes(delayData.scheduledMinutes)
                    var date = this.formatDate(scheduledDate)
                    var amountOfTime = this.setsDescription[retrieveSet(delayData)] || this.setsDescription.unknown
                    var day = [Params.delayServiceFr.daysSingular[delayData.scheduledDay], Params.delayServiceFr.daysPlural[delayData.scheduledDay]];
                    return {
                        date,
                        title: delayData.appointmentType + ' les ' + day[1] + ' à ' + hourFormat.time + 'h' + delayData.scheduledMinutes,
                        description: 'Votre rendez-vous de ' + appointmentDescription + ' est un ' + day[0] + ' ' + hourFormat.daySuffix + ', à ' + hourFormat.time + 'h' + minuteFormat + '.',
                        delayInfo: 'Les patients attendent habituellement ' + amountOfTime + ' pour ce genre de rendez-vous.'
                    }
                } else{
                    return {
                        date,
                        title: appointmentDescription,
                        description: 'Votre rendez-vous de ' + appointmentDescription + " est " + Params.delayServiceFr.unknownAppointment,
                        delayInfo: Params.delayServiceFr.notEnoughData
                    }
                }
            }
        };
        var languages = {
            EN: languages_en,
            FR: languages_fr
        };
        function retrieveSet (delayData) {
            var sets = delayData.sets
            var appointmentSet
            var lastSetAmount = -1
            for (var set in sets) {
                var setAmount = sets[set]
                if (setAmount > lastSetAmount) {
                    appointmentSet = set
                    lastSetAmount = setAmount
                }
            }
            return appointmentSet
        }
        function requestWaitingTimes (appointment, language, onDone, onError) {

            var requestObject = {
                refSource: appointment.SourceDatabaseSerNum,
                refId: appointment.AppointmentAriaSer
            }

            RequestToServer.sendRequestWithResponse('AppointmentDelays', requestObject)
                .then(function (response) {
                    var data = response.data
                    var err = data.err
                    if (err) {
                        var translator = languages[language] || languages.EN
                        if(/Unknown appointment type/gm.test(err)) {
                            appointment.UnavailableDelays = true
                            onError(translator.appointmentData.unknownAppointmentType)
                        } else if(/Appointment not found/gm.test(err)){
                            appointment.UnavailableDelays = true
                            onError(translator.appointmentData.unknownAppointment)
                        } else {
                            onError(err)
                        }
                    } else {
                        onDone((appointment.Delays = JSON.parse(data.delays)))
                    }
                })
                .catch(onError)
        }
        return {
            getPresenter: function (appointment, delayData, language) {
                var translator = languages[language] || languages.EN
                return translator.buildHistoricalDelayInfo(
                    appointment['AppointmentType_' + language] || translator.appointmentData.unknownAppointment,
                    appointment.ScheduledStartTime,
                    delayData
                )
            },
            getWaitingTimes: function (appointment, language) {
                var promise = $q.defer()
                var appointmentCachedDelays = appointment.Delays
                if (appointmentCachedDelays) {
                    promise.resolve(appointmentCachedDelays)
                } else {
                    requestWaitingTimes(appointment, language, promise.resolve, promise.reject)
                }
                return promise.promise
            },
            newDelaysChart: function (language) {
                var translator = languages[language] || languages.EN
                var updater = {cached: null, deliver: function (newData) {
                    this.cached = newData;
                }}
                return {
                    updater,
                    chart: {
                        type: 'bar',
                        width: $(window).width() - 16,
                        events: {
                            load: function () {
                                var chartSeries = this.series
                                var valuePercentage = []
                                updater.deliver = function (newData) {
                                    for (var setIndex = 0; setIndex < 4; ++setIndex) {
                                        valuePercentage.push({
                                            y: newData[setIndex],
                                            z: newData[setIndex + 4]
                                        })

                                        chartSeries[setIndex].setData(valuePercentage, true, true)
                                        valuePercentage = []
                                    }
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
                    xAxis: {
                        type: 'linear',
                        categories: [''],
                        title: { text: '' },
                        labels: { enabled: false }
                    },
                    yAxis: {
                        type: 'linear',
                        min: 0,
                        title: {
                            text: translator.appointmentData.yAxisTitle,
                            align: 'high'
                        }
                    },
                    tooltip: {
                        enabled: true,
                        positioner: function () {
                            return { x: 0, y: 0 };
                        },
                        headerFormat: '',
                        pointFormat: translator.appointmentData.setsDescription.point + " (Number of Patients: {point.z}) ",
                        shared: false
                    },
                    plotOptions: {
                        bar:
                            {
                                dataLabels:{
                                    enabled: true,
                                    distance: -50,
                                    style:{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        borderColor: 'white'
                                    },
                                    formatter: function() {return this.y + "%"},
                                    color: 'white'
                                },
                                events: {
                                    legendItemClick: function(){
                                        return false;
                                    }
                                }
                            }
                            },
                    legend: {
                        enabled: true,
                        align: 'center',
                        verticalAlign: 'bottom'
                    },
                    credits: { enabled: false },
                    exporting: {enabled: false},
                    series: [
                        {
                            name: translator.appointmentData.setsName.set1,
                            data: {
                                y: [0],
                                z: [0]
                            },
                            pointPadding: 0,
                            groupPadding: 0,
                            color: '#00d652'
                        },
                        {
                            name: translator.appointmentData.setsName.set2,
                            data: {
                                y: [0],
                                z: [0]
                            },
                            pointPadding: 0,
                            groupPadding: 0,
                            color: '#ffc400'
                        },
                        {
                            name: translator.appointmentData.setsName.set3,
                            data: {
                                y: [0],
                                z: [0]
                            },
                            pointPadding: 0,
                            groupPadding: 0,
                            color: '#ff8200'
                        },
                        {
                            name: translator.appointmentData.setsName.set4,
                            data: {
                                y: [0],
                                z: [0]
                            },
                            pointPadding: 0,
                            groupPadding: 0,
                            color: '#ff0000'
                        }
                    ]
                }
            }
        }
    }
])
