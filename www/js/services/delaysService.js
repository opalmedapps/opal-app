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
    '$q', 'RequestToServer', '$timeout',
    function ($q, RequestToServer, $timeout) {
        var languages_en = {
            daysSingular: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            daysPlural: ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            daySuffixes: ['th', 'st', 'nd', 'rd'],
            unknownAppointment: 'There are no visualizations for this appointment yet',
            unknownAppointmentType: 'There are no visualizations for this kind of appointment yet.',
            notEnoughData: "There isn't enough data for a visualization for this kind of appointment at this time. " +
                "Please stay tuned",
            setsName: {
                set1: '0-15 minutes',
                set2: '15-30 minutes',
                set3: '30-45 minutes',
                set4: '45+ minutes'
            },
            setsDescription: {
                set1: 'from 0 to 15 minutes',
                set2: 'from 15 to 30 minutes',
                set3: 'from 30 to 45 minutes',
                set4: 'more than 45 minutes',
                point: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}%</b> of the patients waited this amount of time.<br/>',
                unknown: 'an unknown amount of time'
            },
            yAxisTitle: 'Frequency (%)',
            formatDay: function (day) {
                var trim = day % 100
                return '' + day + '' + (this.daySuffixes[(trim - 20) % 10] || this.daySuffixes[trim] || this.daySuffixes[0])
            },
            formatHour: function (hour) {
                if (hour !== 0) {
                    return {
                        time: hour >= 13 ? hour - 12 : hour,
                        daySuffix: hour >= 18 ? 'evening' : (hour >= 12 ? 'afternoon' : 'morning'),
                        timeSuffix: hour >= 12 ? 'PM' : 'AM'
                    }
                } else{
                    return{
                        time: 12,
                        daySuffix: 'morning',
                        timeSuffix: 'AM'
                    }
                }
            },
            formatDate: function (scheduledDate) {
                var day = scheduledDate.getDate()
                return this.months[scheduledDate.getMonth()] + ' ' + this.formatDay(day) + ', ' + scheduledDate.getFullYear()
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
                    var pluralize = appointmentDescription.split(" ")
                    var i = pluralize.indexOf("Appointment")
                    console.log(i)
                    if(i !== -1) {
                        pluralize[i] = "Appointments"
                    }
                    var m = pluralize.indexOf("a")
                    if(m !== -1){
                        pluralize[m+2] = "Tests"
                        pluralize[m] = null
                    }
                    pluralAppointmentDescription = pluralize.join(" ")
                    var hourFormat = this.formatHour(delayData.scheduledHour)
                    var lowerLimit = delayData.scheduledHour -1
                    lowerLimit = this.formatHour(lowerLimit)
                    var upperLimit = delayData.scheduledHour + 1
                    upperLimit = this.formatHour(upperLimit)
                    var minuteFormat = this.formatMinutes(delayData.scheduledMinutes)
                    var date = this.formatDate(scheduledDate)
                    var amountOfTime = this.setsDescription[retrieveSet(delayData)] || this.setsDescription.unknown
                    var day = [this.daysSingular[delayData.scheduledDay], this.daysPlural[delayData.scheduledDay]]
                    return {
                        date,
                        title: pluralAppointmentDescription + ' on ' + day[1] + ' between ' + lowerLimit.time + ':' + minuteFormat + ' ' + lowerLimit.timeSuffix + ' and ' + upperLimit.time + ':' + minuteFormat + ' ' + upperLimit.timeSuffix,
                        description: 'Your ' + appointmentDescription + ' appointment is on a ' + day[0] + ' ' + hourFormat.daySuffix + ', at ' + hourFormat.time + ':' + minuteFormat + ' ' + hourFormat.timeSuffix + '.',
                        delayInfo: 'Patients usually wait ' + amountOfTime + ' for this kind of appointment.'
                    }
                } else{
                    return {
                        date,
                        title: appointmentDescription,
                        description: 'Your ' + appointmentDescription + " has not yet been visualized. ",
                        delayInfo: this.notEnoughData
                    }
                }
            }
        }
        var languages_fr = {
            daysSingular: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
            daysPlural: ['lundis', 'mardis', 'mercredis', 'jeudis', 'vendredis', 'samedis', 'dimanches'],
            months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
            unknownAppointment: 'Inconnu',
            unknownAppointment2: 'Il n\'y a pas encore de visualization pour ce rendez-vous',
            unknownAppointmentType: 'Il n\'y a pas encore de visualization pour ce genre de rendez-vous.',
            notEnoughData: 'Il n\'y a pas encore de visualization pour ce rendez-vous',
            setsName: {
                set1: '0-15 minutes',
                set2: '15-30 minutes',
                set3: '30-45 minutes',
                set4: '45+ minutes'
            },
            setsDescription: {
                set1: 'de 0 à 15 minutes',
                set2: 'de 15 à 30 minutes',
                set3: 'de 30 à 45 minutes',
                set4: 'plus de 45 minutes',
                point: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}%</b> des patients ont attendu cette période de temps.<br/>',
                unknown: 'une durée de temps inconnue'
            },
            yAxisTitle: 'Fréquence (%)',
            formatHour: function (hour) {
                return {
                    time: hour,
                    daySuffix: hour >= 18 ? 'soir' : (hour >= 12 ? 'après-midi' : 'matin'),
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
                    var day = [this.daysSingular[delayData.scheduledDay], this.daysPlural[delayData.scheduledDay]]
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
                        description: 'Votre rendez-vous de ' + appointmentDescription + " est " + unknownAppointment,
                        delayInfo: this.notEnoughData
                    }
                }
            }
        }
        var languages = {
            EN: languages_en,
            FR: languages_fr
        }
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
        }//Appointment Delays
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
                        var translator = languages[language] || languages.EN //Is this an issue? Tessa
                        console.log("This is the error being tested: ", err)
                        if(/Unknown appointment type/gm.test(err)) {
                            console.log("Unknown appointment type")
                            appointment.UnavailableDelays = true
                            onError(translator.unknownAppointmentType)
                        } else if(/Appointment not found/gm.test(err)){
                            console.log("Appointment not found")
                            appointment.UnavailableDelays = true
                            onError(translator.unknownAppointment)
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
                    appointment['AppointmentType_' + language] || translator.unknownAppointment,
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
                                updater.deliver = function (newData) {
                                    for (var setIndex = 0; setIndex < 4; ++setIndex) {
                                        chartSeries[setIndex].setData([newData[setIndex]], true, true)
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
                            text: translator.yAxisTitle,
                            align: 'high'
                        }
                    },
                    tooltip: {
                        enabled: true,
                        headerFormat: '',
                        pointFormat: translator.setsDescription.point,
                        shared: false
                    },
                    plotOptions: { bar: { dataLabels: { enabled: false } } }, //the zeros
                    legend: {
                        enabled: false, //the labeled dots
                        align: 'center',
                        verticalAlign: 'top'
                    },
                    credits: { enabled: false },
                    exporting: {enabled: false},
                    series: [
                        {
                            name: translator.setsName.set1,
                            data: [0],
                            color: '#00d652'
                        },
                        {
                            name: translator.setsName.set2,
                            data: [0],
                            color: '#ffc400'
                        },
                        {
                            name: translator.setsName.set3,
                            data: [0],
                            color: '#ff8200'
                        },
                        {
                            name: translator.setsName.set4,
                            data: [0],
                            color: '#ff0000'
                        }
                    ]
                }
            }
        }
    }
])
