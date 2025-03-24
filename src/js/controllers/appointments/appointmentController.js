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
 *  @description
 *
 *  Manages the individual appointment detail view. It receives parameters via the Navigator service
 *  and then displays the appointment details to the user.
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('AppointmentController', AppointmentController);

    AppointmentController.$inject = ['$scope', 'Navigator', 'UserPreferences', '$timeout', 'Browser'];

    /* @ngInject */
    function AppointmentController($scope, Navigator, UserPreferences, $timeout, Browser) {

        let vm = this;

        let navigator = null;

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

        vm.aboutAppointment = aboutAppointment;
        vm.moreEducationalMaterial = moreEducationalMaterial;
        vm.openMap = openMap;

        activate();

        //////////////////////////////////////

        function activate() {
            navigator = Navigator.getNavigator();

            let parameters = Navigator.getParameters();
            let language = UserPreferences.getLanguage().toUpperCase();

            bindEvents();

            $timeout(function(){
                vm.language = language;
                vm.app = parameters.Post;
            });
        }

        function aboutAppointment()
        {
            navigator.pushPage('./views/personal/appointments/about-appointment.html', {'Post': vm.app});
        }

        /**
         * @ngdoc method
         * @name aboutAppointment
         * @description
         * Takes the user to the About-This-Appointment view of the specified appointment
         */
        function moreEducationalMaterial() {
            navigator.pushPage('./views/templates/content.html', {
                contentLink: vm.app["URL_"+ vm.language],
                contentType: vm.app["AppointmentType_" + vm.language],
                title: 'MORE_EDU_MATERIAL',
            });
            
        }

        function openMap(){
            let url = vm.app["MapUrl_"+ vm.language];
            Browser.openInternal(url, true);
        }

        function bindEvents() {
            // Remove event listeners
            $scope.$on('$destroy', () => navigator.off('prepop'));

            // Reload user profile if appointment was opened via notifications or check-in,
            // and profile was implicitly changed.
            navigator.on('prepop', () => Navigator.reloadPreviousProfilePrepopHandler(['checkin-list.html', 'notifications.html']));
        }
    }
})();
