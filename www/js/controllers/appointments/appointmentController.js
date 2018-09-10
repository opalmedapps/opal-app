/*
 * Filename     :   appointmentController.js
 * Description  :   This file controls the individual appointment view.
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *  @ngdoc controller
 *  @name MUHCApp.controllers: AppointmentController
 *  @description
 *
 *  Manages the individual appointment detail view. It receives parameters via NavigatorParameters and then displays the appointment
 *  details to the User
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('AppointmentController', AppointmentController);

    AppointmentController.$inject = ['NavigatorParameters', 'UserPreferences', 'RequestToServer', 'LocalStorage', '$timeout', '$window', '$q', '$scope'];

    /* @ngInject */
    function AppointmentController(NavigatorParameters, UserPreferences, RequestToServer, LocalStorage, $timeout, $window, $q, $scope) {

        var vm = this;

        var navigatorName;
        /**
         * @ngdoc property
         * @name language
         * @propertyOf AppointmentController
         * @returns string
         * @description used by the controller to display the appropriate appointment information based on User's language
         */
        vm.language = '';

        /**
         * @ngdoc property
         * @name app
         * @propertyOf AppointmentController
         * @returns object
         * @description the currently selected appointment to be displayed in the view
         */
        vm.app = null;

        /**
         * @ngdoc property
         * @name app
         * @propertyOf AppointmentController
         * @returns object
         * @description delays for the currently selected appointment
         */
        vm.updateDelays = null
        buildDelayChart()
        vm.delays = {chartRender: '', presenter: {}, hasData: false}
        vm.requestingDelays = false;

        /**
         * @ngdoc property
         * @name app
         * @propertyOf AppointmentController
         * @returns boolean
         * @description represents the case where the appointment passed to this controller is undefined. This should rarely be the case and should be logged immediately if this ever becomes true.
         */
        vm.corrupted_appointment = false;


        vm.goToMap = goToMap;
        vm.historicalDelays = historicalDelays
        vm.allowDelaysRendering = allowDelaysRendering;
        vm.hasDelays = hasDelays;
        vm.aboutAppointment = aboutAppointment;
        vm.moreEducationalMaterial = moreEducationalMaterial;
        vm.openMap = openMap;

        activate();

        //////////////////////////////////////

        function activate() {
            var parameters = NavigatorParameters.getParameters();
            navigatorName = parameters.Navigator;
            $timeout(function(){
                vm.language = UserPreferences.getLanguage().toUpperCase();
                vm.app = parameters.Post;

                //if appointment is undefined/null/empty object
                if(!vm.app || Object.keys(vm.app).length === 0) {
                    vm.corrupted_appointment = true;
                }
            });
        }

        /**
         * @ngdoc method
         * @name goToMap
         * @methodOf MUHCApp.controllers.AppointmentController
         * @description
         * Takes the user to the map of the specified appointment
         */
        function goToMap()
        {
            NavigatorParameters.setParameters(vm.app);
            $window[navigatorName].pushPage('./views/general/maps/individual-map.html');
        }

        function aboutAppointment()
        {
          //  NavigatorParameters.setParameters(vm.app);
            $window[navigatorName].pushPage('./views/personal/appointments/about-appointment.html');
        }

        function historicalDelays()
        {
            NavigatorParameters.setParameters({'Navigator':navigatorName, 'Post':vm.app});
            $window[navigatorName].pushPage('./views/personal/appointments/appointment-historical-delays.html');
        }

        function formatHourEN (hour) {
            return {
                time: hour >= 13 ? hour - 12 : hour,
                daySuffix: hour >= 18 ? 'night' : (hour >= 12 ? 'afternoon' : 'morning'),
                timeSuffix: hour >= 12 ? 'PM' : 'AM'
            }
        }

        function retrieveSetDescriptionEN(delayData) {
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
            switch (appointmentSet) {
                case 'set1':
                    return 'from 0 to 15 minutes'
                case 'set2':
                    return 'from 15 to 30 minutes'
                case 'set3':
                    return 'from 30 to 45 minutes'
                case 'set4':
                    return 'more than 45 minutes'
                default:
                    return 'an unknown amount of time'
            }
        }

        function dayOrdinal (day) {
            var suffix = ['th', 'st', 'nd', 'rd']
            var trim = day % 100
            return suffix[(trim - 20) % 10] || suffix[trim] || suffix[0]
        }

        function retrieveDateEN(appointment) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            var scheduledDate = appointment.ScheduledStartTime
            var day = scheduledDate.getDate()
            return months[scheduledDate.getMonth()] + ' ' + day + dayOrdinal(day) + ', ' + scheduledDate.getFullYear()
        }

        function buildHistoricalDelayInfoEN(delayData)
        {
            var daysSingular = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            var daysPlural = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays']
            var hourFormat = formatHourEN(delayData.scheduledHour)
            return {
                date: retrieveDateEN(vm.app),
                title: delayData.appointmentType + ' on ' + daysPlural[delayData.scheduledDay] + ' at ' + hourFormat.time + ':' + delayData.scheduledMinutes + ' ' + hourFormat.timeSuffix,
                description: 'Your ' + vm.app.AppointmentType_EN + ' appointment is on a ' + daysSingular[delayData.scheduledDay] + ' ' + hourFormat.daySuffix + ', at ' + hourFormat.time + ':' + delayData.scheduledMinutes + ' ' + hourFormat.timeSuffix + '.',
                delayInfo: 'Patients usually wait ' + retrieveSetDescriptionEN(delayData) + ' for this kind of appointment.'
            }
        }

        function buildDelayChart(sets)
        {
            var windowWidth = $(window).width();
            $scope.chartConfig = {
                chart: {
                    type: 'bar',
                    width: windowWidth - 16,
                    events: {
                        load: function () {
                            var chartSeries = this.series
                            vm.updateDelays = function (newData) {
                                console.log('updating delays...')
                                for (var series = 0; series < 4; ++series) {
                                    chartSeries[series].setData([newData[series]], true, true)
                                }
                            }
                        }
                    }
                },
                navigator: {
                    enabled: false
                },
                rangeSelector: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                xAxis: {
                    type: 'linear',
                    categories: [''],
                    title: {
                        text: ''
                    },
                    labels: {
                        enabled: false
                    }
                },
                yAxis: {
                    type: 'linear',
                    min: 0,
                    title: {
                        text: 'Frequency (%)',
                        align: 'high'
                    }
                },
                tooltip: {
                    enabled: true,
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}%</b> of the patients waited this amount of minutes.<br/>',
                    shared: false
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    enabled: true,
                    align: 'center',
                    verticalAlign: 'top'
                },
                credits: {
                    enabled: false
                },
                series: [
                    {
                        name: '0-15 minutes',
                        data: [0],
                        color: '#00d652'
                    },
                    {
                        name: '15-30 minutes',
                        data: [0],
                        color: '#ffc400'
                    },
                    {
                        name: '30-45 minutes',
                        data: [0],
                        color: '#ff8200'
                    },
                    {
                        name: '45+ minutes',
                        data: [0],
                        color: '#ff0000'
                    }
                ]
            }
        }

        function hasDelays()
        {
            if (!vm.delays.hasData && vm.app) {
                if (!vm.requestingDelays) {
                    vm.requestingDelays = true;
                    requestWaitingTimes(vm.app)
                        .then(function(response) {
                            $timeout(function () {
                                vm.delays = response;
                                var sum = response.sets.set1 + response.sets.set2 + response.sets.set3 + response.sets.set4
                                vm.updateDelays([
                                    +((response.sets.set1 / sum) * 100).toFixed(2),
                                    +((response.sets.set2 / sum) * 100).toFixed(2),
                                    +((response.sets.set3 / sum) * 100).toFixed(2),
                                    +((response.sets.set4 / sum) * 100).toFixed(2)
                                ])
                                vm.delays.presenter = vm.language === 'FR' ? buildHistoricalDelayInfoFR(response) : buildHistoricalDelayInfoEN(response)
                                vm.delays.hasData = true
                            })
                        })
                        .catch(function(err) {
                            $timeout(function () {
                                vm.delays = {err: err, hasData: true};
                            })
                        });
                }
            }
            return vm.delays.hasData
        }

        /**
         * @ngdoc method
         * @name aboutAppointment
         * @methodOf MUHCApp.controllers.AppointmentController
         * @description
         * Takes the user to the About-This-Appointment view of the specified appointment
         */
        function moreEducationalMaterial() {
            $window[navigatorName].pushPage('./views/templates/content.html', {
                contentLink: vm.app["URL_"+ vm.language],

                contentType: vm.app["AppointmentType_" + vm.language]
            });
            
        }

        function openMap(){
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app)
            {
                var ref = cordova.InAppBrowser.open(vm.app["MapUrl_"+ vm.language], '_blank', 'EnableViewPortScale=yes');
            } else {
                window.open(vm.app["MapUrl_"+ vm.language]);
            }
        }

        function allowDelaysRendering () {
            var appointment = vm.app;
            var source;
            if (appointment && ((source = appointment.SourceDatabaseSerNum) === '2' || source === 2)) {
                var current = new Date();
                var scheduledTime = appointment.ScheduledStartTime;
                var scheduledFullYear = scheduledTime.getFullYear();
                var currentFullYear = current.getFullYear();
                if (scheduledFullYear > currentFullYear) {
                    return true;
                } else if (scheduledFullYear === currentFullYear) {
                    var scheduledMonth = scheduledTime.getMonth();
                    var currentMonth = current.getMonth();
                    if (scheduledMonth > currentMonth) {
                        return true;
                    } else if (scheduledMonth === currentMonth) {
                        return current.getDay() <= scheduledTime.getDay();
                    }
                }
            }
            return false;
        }

        function requestWaitingTimes (appointment) {
            console.log('appointment:', appointment);
            var refSource = appointment.SourceDatabaseSerNum;
            var refId = appointment.AppointmentAriaSer;
            var promise = $q.defer();
            var appointmentCachedDelay = appointment.Delays;
            if (appointmentCachedDelay) {
                promise.resolve(appointmentCachedDelay);
            } else {
                RequestToServer.sendRequestWithResponse('WaitingTimeVisualization', {refSource: refSource, refId: refId})
                .then(function (response) {
                    var data = response.data
                    var dataErr = data.err
                    if (dataErr) {
                        return promise.reject(dataErr)
                    }
                    var delays = JSON.parse(data.delays)
                    appointment.Delays = delays;
                    promise.resolve(delays);
                })
                .catch(function (err) {
                    promise.reject(err)
                });
            }
            return promise.promise;
        }


    }
})();
