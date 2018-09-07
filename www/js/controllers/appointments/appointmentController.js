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

        function hasDelays()
        {
            if (!vm.delays && vm.app) {
                if (!vm.requestingDelays) {
                    vm.requestingDelays = true;
                    requestWaitingTimes(vm.app)
                        .then(function(response) {
                            $timeout(function () {
                                vm.delays = response;
                            })
                        })
                        .catch(function(err) {
                            $timeout(function () {
                                vm.delays = {err: err};
                            })
                        });
                }
            }
            return !!vm.delays
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
            if (vm.app && (vm.app.SourceDatabaseSerNum === '2' || vm.app.SourceDatabaseSerNum === 2)) {
                var current = new Date();
                var scheduledTime = vm.app.ScheduledStartTime;
                if (scheduledTime.getFullYear() > current.getFullYear()) {
                    return true;
                } else if (scheduledTime.getFullYear() === current.getFullYear()) {
                    if (scheduledTime.getMonth() > current.getMonth()) {
                        return true;
                    } else if (scheduledTime.getMonth() === current.getMonth()) {
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
