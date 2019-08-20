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

    AppointmentController.$inject = ['NavigatorParameters', 'UserPreferences', 'Patient', 'DelaysService', '$timeout', '$window', '$q', '$scope'];

    /* @ngInject */
    function AppointmentController(NavigatorParameters, UserPreferences, Patient, DelaysService, $timeout, $window, $q, $scope) {

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
        vm.delays = { chart: null, presenter: null };

        /**
         * @ngdoc property
         * @name app
         * @propertyOf AppointmentController
         * @returns boolean
         * @description represents the case where the appointment passed to this controller is undefined. This should rarely be the case and should be logged immediately if this ever becomes true.
         */
        vm.corrupted_appointment = false;

        vm.TestUser = Patient.getTestUser();
        vm.goToMap = goToMap;
        vm.hasWaitingTimes = true;
        //vm.hasWaitingTimes = hasWaitingTimes;
        vm.aboutAppointment = aboutAppointment;
        vm.moreEducationalMaterial = moreEducationalMaterial;
        vm.openMap = openMap;
        vm.nonZeroData = true;
        vm.historicalDelays = historicalDelays;

        activate();

        //////////////////////////////////////

        function activate() {
            var parameters = NavigatorParameters.getParameters();
            var language = UserPreferences.getLanguage().toUpperCase();
            navigatorName = parameters.Navigator;
            if(vm.TestUser) {
                vm.hasWaitingTimes = true
            }
            else {
                vm.hasWaitingTimes = false
            }


            $timeout(function(){
                vm.language = language;
                vm.app = parameters.Post;


                //This code launches the historical delays calculations as soon as the individual appointment is selected
                //It's moved to appointmentDelaysController so that the calculations start when the historical delays
                //tab is selected
/*
                if (!(vm.corrupted_appointment = !vm.app || Object.keys(vm.app).length === 0)) {
                    DelaysService.getWaitingTimes(vm.app, language)
                        .then(function(response) {
                            var sets = response.sets;
                            var sum = sets.set1 + sets.set2 + sets.set3 + sets.set4;
                            vm.delays.presenter = DelaysService.getPresenter(vm.app, response, language);
                            if (sum !== 0) {
                                vm.nonZeroData = true;
                                vm.delays.chart.updater.deliver([
                                    +((sets.set1 / sum) * 100).toFixed(2),
                                    +((sets.set2 / sum) * 100).toFixed(2),
                                    +((sets.set3 / sum) * 100).toFixed(2),
                                    +((sets.set4 / sum) * 100).toFixed(2)
                                ]);
                            } else{
                                vm.delays.presenter = DelaysService.getPresenter(vm.app, null, language)
                                vm.nonZeroData = false;
                            }
                        }).catch(function(err) {
                            $timeout(function () {
                                vm.delays.err = err;
                            });
                        });
                }*/
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
                NavigatorParameters.setParameters({'Navigator': navigatorName, 'Post': vm.app});
                $window[navigatorName].pushPage('./views/personal/appointments/appointment-historical-delays.html')
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

       /* function hasWaitingTimes () {


            //This can be used to create the historical delays tab
            // If hasWaitingTimes is false, it just won't be created and the user won't have the option
            //Currently commented out, because it needs information from delaysService within the individual appointment
            //tab. Once it doesn't need to be hidden in the app, this can be added






            var appointment = vm.app;
            var source;
            if (appointment && !appointment.UnavailableDelays && ((source = appointment.SourceDatabaseSerNum) === '2' || source === 2)) { // checks if the source has a parser in the listener. available parsers: [2]
                var current = new Date();
                var scheduledTime = appointment.ScheduledStartTime;
                var scheduledFullYear = scheduledTime.getFullYear();
                var currentFullYear = current.getFullYear();
                if (scheduledFullYear < currentFullYear) {
                    return true;
                } else if (scheduledFullYear === currentFullYear) {
                    var scheduledMonth = scheduledTime.getMonth();
                    var currentMonth = current.getMonth();
                    if (scheduledMonth < currentMonth) {
                        return true;
                    } else if (scheduledMonth === currentMonth) {
                        return current.getDate() >= scheduledTime.getDate();
                    }
                }
            }
            return false;
        }*/
    }
})();
