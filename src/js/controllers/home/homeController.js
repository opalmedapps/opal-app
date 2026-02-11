// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = [
        '$timeout', 'CheckInService', '$scope', '$filter', 'Navigator',
        'UserPreferences', 'NetworkStatus', 'UserHospitalPreferences', 'RequestToServer', 'Params',
        'User', 'ProfileSelector', '$interval', 'Permissions', 'NativeNotification',
    ];

    /* @ngInject */
    function HomeController($timeout, CheckInService, $scope, $filter, Navigator,
        UserPreferences, NetworkStatus, UserHospitalPreferences, RequestToServer, Params,
        User, ProfileSelector, $interval, Permissions, NativeNotification,
    ) {
        let vm = this;

        vm.checkinState = {
            noAppointments: true,
            allCheckedIn: false,
            message: 'DETECTING_LOCATION',
            canNavigate: false,
            checkinError: false,
            inRange: true
        };

        vm.accessLevel = ProfileSelector.getAccessLevel();
        vm.selectedHospitalToDisplay = UserHospitalPreferences.getHospitalFullName();

        // For displaying the closest upcoming appointment
        vm.closestAppointment = null;

        vm.homeDeviceBackButton = homeDeviceBackButton;
        vm.goToAppointments = goToAppointments;
        vm.goToCheckinAppointments = goToCheckinAppointments;
        vm.goToAboutOpal = goToAboutOpal;
        vm.goToPartners = goToPartners;
        vm.getPatientFirstName = getPatientFirstName;

        activate();

        //////////////////////////////////////////////////

        /*
         * PRIVATE METHODS
         * =================================
         */

        function activate() {
            Navigator.setNavigator(homeNavigator);

            // Get location permission
            Permissions.enablePermission('ACCESS_FINE_LOCATION').catch(console.error);

            //Initialize the page interval to refresh checkin state every 5 second
            setInterval();
            bindEvents();

            // Initialize the page data if online
            NetworkStatus.isOnline() ? homePageInit() : setPatientInfo();
        }

        /**
         * @ngdoc function
         * @name bindEvents
         * @description Sets up event bindings for this controller.
         */
        function bindEvents() {
            // Refresh the page on coming back from other pages
            homeNavigator.on('prepop', function (event) {
                const prepopPages = ['./views/home/checkin/checkin-list.html', 'views/personal/notifications/notifications.html'];
                if (prepopPages.includes(event.currentPage.name) && NetworkStatus.isOnline()) getDisplayData();

                // Refresh the display and restart the reload interval when going back to the home page
                $timeout(() => {
                    if (Navigator.getPageName() === 'home.html') {
                        getDisplayData();
                        setInterval();
                    }
                })
            });

            //This avoids constant repushing which causes bugs
            homeNavigator.on('prepush', event => {
                if (homeNavigator._doorLock.isLocked()) event.cancel();
                //stop the reload interval when leaving the home page
                cancelInterval();
            });

            //release the watchers
            $scope.$on('$destroy', () => {
                homeNavigator.off('prepop');
                homeNavigator.off('prepush');
                //stop the reload interval when leaving the home page
                cancelInterval();
            });
        }

        /**
         * Initializes the home page view by calling a bunch of helper function
         */
        function homePageInit() {
            // Get Data from the new backend api
            getDisplayData();
            //Initialize modal size based on font size
            initModalSize();
            //Set patient info
            setPatientInfo();
        }

        /**
         * @description Function to get view specific data from Django API
         */
        async function getDisplayData() {
            try {
                const result = await RequestToServer.apiRequest(Params.API.ROUTES.HOME);
                CheckInService.setAppointmentsForCheckIn(result.data?.daily_appointments);
                const checkinState = await CheckInService.updateCheckInState();
                $timeout(() => {
                    vm.notificationsUnreadNumber = result?.data?.unread_notification_count;
                    vm.checkinState = checkinState;
                    vm.closestAppointment = result?.data?.closest_appointment;

                    // Show or hide the chevron depending on whether check-in is possible
                    let button = $('#check-in-button');
                    button.toggleClass('non-navigable', !checkinState.canNavigate);
                });
            }
            catch (error) {
                // TODO: Error handling improvements: https://o-hig.atlassian.net/browse/QSCCD-463
                console.error(error);
            }
        }

        /**
         * @name setPatientInfo
         * @desc Sets the basic patient information in the view header that may or many not be available... but won't break app if not there and it makes the app look less broken if not internet connection
         */
        function setPatientInfo() {
            vm.userInfo = User.getUserInfo();
            vm.noUpcomingAppointments = false;
        }

        /**
         * Initialize the app's modal size based on the screen size
         */
        function initModalSize() {
            var fontSize = UserPreferences.getFontSize();
            var rcorners = document.getElementById("rcorners");
            if (fontSize === "xlarge") {
                rcorners.setAttribute("style", "height: 80%");
            }
            else if (fontSize === "large") {
                rcorners.setAttribute("style", "height: 60%");
            }
            else rcorners.setAttribute("style", "height: 50%");
        }

        /*
         * PUBLIC METHODS
         * =========================================
         */

        /**
         * Exits the app on pressing the back button
         * Note: For Android devices only
         */
        function homeDeviceBackButton() {
            NativeNotification.showConfirmation(
                $filter('translate')('EXIT_APP'),
                navigator?.app?.exitApp,
            );
        }

        /**
         * @desc Go to the About Opal page
         */
        function goToAboutOpal() {
            homeNavigator.pushPage('./views/home/about/about.html');
        }

        /**
         * Takes the user to the selected appointment to view more details about it
         */
        function goToAppointments() {
            // When the nearest appointment is for a patient in care,
            // by clicking on the widget should open the calendar for that patient (e.g., care receiver's calendar)
            if (ProfileSelector.getActiveProfile().patient_legacy_id !== vm?.closestAppointment?.patientsernum) {
                let currentPageParams = Navigator.getParameters();
                currentPageParams['previousProfile'] = ProfileSelector.getActiveProfile().patient_legacy_id;
                ProfileSelector.loadPatientProfile(vm.closestAppointment.patientsernum);
            }
            homeNavigator.pushPage('./views/personal/appointments/appointments.html');
        }

        /**
         * Takes the user to the checkin view
         */
        function goToCheckinAppointments() {
            homeNavigator.pushPage('./views/home/checkin/checkin-list.html');
        }

        /**
         * @description Takes the user to the partners page.
         */
        function goToPartners() {
            homeNavigator.pushPage(
                './views/templates/content.html',
                { contentType: 'partners', title: 'PARTNERS'},
            );
        }

        /**
         * @description set a interval to refresh the checkin state every 5 seconds
         */
        function setInterval() {
            vm.reloadInterval = $interval(function () {
                getDisplayData();
            }, 5000);
        }

        /**
         * @description cancel the interval
         */
        function cancelInterval() {
            $interval.cancel(vm.reloadInterval);
        }

        /**
         * @description get patient's first name for the appointment widget
         */
        function getPatientFirstName() {
            let selfPatientSerNum = User.getSelfPatientSerNum();
            if (selfPatientSerNum && selfPatientSerNum === vm?.closestAppointment?.patientsernum) {
                return $filter('translate')("YOU");
            }
            else {
                let confirmedProfiles = ProfileSelector.getConfirmedProfiles();
                let patient = confirmedProfiles.find(
                    patient_profile => patient_profile.patient_legacy_id === vm?.closestAppointment?.patientsernum
                );
                return patient ? patient.first_name : "";
            }
        }
    }
})();
