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

    AppointmentController.$inject = ['NavigatorParameters', 'UserPreferences', '$timeout', '$window'];

    /* @ngInject */
    function AppointmentController(NavigatorParameters, UserPreferences,  $timeout, $window) {

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

        vm.goToMap = goToMap;
        vm.aboutAppointment = aboutAppointment;

        activate();

        //////////////////////////////////////

        function activate() {
            var parameters = NavigatorParameters.getParameters();
            navigatorName = parameters.Navigator;

            $timeout(function(){
                vm.language = UserPreferences.getLanguage().toUpperCase();
                vm.app = parameters.Post;
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

        /**
         * @ngdoc method
         * @name aboutAppointment
         * @methodOf MUHCApp.controllers.AppointmentController
         * @description
         * Takes the user to the About-This-Appointment view of the specified appointment
         */
        function aboutAppointment () {
            $window[navigatorName].pushPage('./views/templates/content.html', {
                contentLink: vm.app["URL_"+ vm.language],
                contentType: vm.app["AppointmentType_"+ vm.language]
            });
        }

    }
})();