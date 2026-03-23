// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   appointmentController.js
 * Description  :   This file controls the individual appointment view.
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
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

    AppointmentController.$inject = ['$scope', '$timeout', 'Browser', 'Navigator'];

    /* @ngInject */
    function AppointmentController($scope, $timeout, Browser, Navigator) {
        let vm = this;

        let navigator = null;

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

            bindEvents();

            $timeout(function(){
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
                contentLink: vm.app.URL,
                contentType: vm.app.AppointmentType,
                title: 'MORE_EDU_MATERIAL',
            });

        }

        function openMap(){
            let url = vm.app.MapUrl;
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
