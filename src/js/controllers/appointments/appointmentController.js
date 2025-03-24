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

    AppointmentController.$inject = ['$scope', 'NavigatorParameters', 'UserPreferences', '$timeout', 'Browser'];

    /* @ngInject */
    function AppointmentController($scope, NavigatorParameters, UserPreferences, $timeout, Browser) {

        let vm = this;

        let navigator = null;
        let navigatorName = '';

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
         * @returns boolean
         * @description represents the case where the appointment passed to this controller is undefined. This should rarely be the case and should be logged immediately if this ever becomes true.
         */
        vm.corrupted_appointment = false;

        vm.goToMap = goToMap;
        vm.aboutAppointment = aboutAppointment;
        vm.moreEducationalMaterial = moreEducationalMaterial;
        vm.openMap = openMap;

        activate();

        //////////////////////////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();

            let parameters = NavigatorParameters.getParameters();
            let language = UserPreferences.getLanguage().toUpperCase();

            bindEvents();

            $timeout(function(){
                vm.language = language;
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
            navigator.pushPage('./views/general/maps/individual-map.html');
        }

        function aboutAppointment()
        {
            navigator.pushPage('./views/personal/appointments/about-appointment.html');
        }

        /**
         * @ngdoc method
         * @name aboutAppointment
         * @methodOf MUHCApp.controllers.AppointmentController
         * @description
         * Takes the user to the About-This-Appointment view of the specified appointment
         */
        function moreEducationalMaterial() {
            navigator.pushPage('./views/templates/content.html', {
                contentLink: vm.app["URL_"+ vm.language],
                contentType: vm.app["AppointmentType_" + vm.language]
            });
            
        }

        function openMap(){
            let url = vm.app["MapUrl_"+ vm.language];
            Browser.openInternal(url, true);
        }

        function bindEvents() {
            // Remove event listeners
            $scope.$on('$destroy', () => navigator.off('prepop'));

            // Reload user profile if appointment was opened via Notifications tab,
            // and profile was implicitly changed.
            navigator.on('prepop', () => NavigatorParameters.reloadPreviousProfilePrepopHandler());
        }
    }
})();
