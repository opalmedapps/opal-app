// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   calendarController.js
 * Description  :   This file controls the displaying of appointments on the calendar and the UI interactions with it.
 * Created by   :   David Herrera
 * Date         :   May 20, 2015
 */

/**
 *  Manages the the displaying of appointments on the calendar and the UI interactions with it.
 *  It also controls the list of appointments that lie below the calendar.
 *  The list and calendar work in parallel.
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('CalendarController', CalendarController);

    CalendarController.$inject = ['$scope', '$timeout', 'Appointments', '$location', '$anchorScroll', 'Navigator',
        'UserPreferences', 'Params', 'Notifications'];

    /* @ngInject */
    function CalendarController($scope, $timeout, Appointments, $location, $anchorScroll, Navigator,
                                UserPreferences, Params, Notifications) {
        const vm = this;

        let todaysTimeMilliseconds;
        let chosenTimeMilliseconds;
        let today;
        let dateLast;
        let dateFirst;
        let navigator;

        /**
         * The date options that are fed into the appointment calendar
         * @type {{formatYear: string, startingDay: number, formatDay: string, showWeeks: boolean}}
         */
        vm.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 0,
            formatDay: 'd',
            showWeeks: false,
        };

        /**
         * The list of user appointments
         * @type {Array}
         */
        vm.appointments = [];

        /**
         * Flags whether or not appointments exist for a user
         * @type {boolean}
         */
        vm.noAppointments = false;

        /**
         * The user's preferred language
         * @type {string}
         */
        vm.language = '';

        /**
         * Today's date, which is fed into the calendar
         * @type {Date}
         */
        vm.todays_date = new Date();

        /**
         * DOM Functions
         */
        vm.showDotColor = showDotColor;
        vm.getListColor = getListColor;
        vm.showHeaderEnd = showHeaderEnd;
        vm.showChosenDateHeader = showChosenDateHeader;
        vm.goToAppointment = goToAppointment;
        vm.goToCalendarOptions = goToCalendarOptions;
        vm.onDateChange = onDateChange;
        vm.scrollToAnchor = scrollToAnchor;

        // Used by patient-data-handler
        vm.setAppointmentsView = setAppointmentsView;

        activate();

        //////////////////////////////////////////////////////

        /*************************
         *  PRIVATE FUNCTIONS
         *************************/

        function activate() {
            navigator = Navigator.getNavigator();

            bindEvents();

            // Get the user's language
            vm.language = UserPreferences.getLanguage();

            // Set today's hours to beginning of the day
            vm.todays_date.setHours(0,0,0,0);
            today = vm.todays_date;

            //Getting time in milliseconds for today's appointment
            todaysTimeMilliseconds =  today.getTime();
            chosenTimeMilliseconds = todaysTimeMilliseconds;

            // Initialize calendar styling
            initializeCalendarStyle();
        }

        /**
         * @description Updates and displays the visible list of appointments and calendar.
         */
        function setAppointmentsView() {
            vm.appointments = Appointments.getAppointments();
            vm.noAppointments = (vm.appointments.length === 0);
            if(vm.appointments.length>0) {

                //Setting time in milliseconds for last appointment
                dateLast=(new Date(vm.appointments[vm.appointments.length-1].ScheduledStartTime.getTime()));
                dateLast.setHours(0,0,0,0);
                dateLast = dateLast.getTime();

                //Setting time in milliseconds for first appointment
                dateFirst=(new Date(vm.appointments[0].ScheduledStartTime.getTime()));
                dateFirst.setHours(0,0,0,0);
                dateFirst = dateFirst.getTime();

                // Reset today's date and refresh calendar appointments' dots
                // When we click refresh circle button on the top-right corner.
                vm.todays_date = new Date();
                vm.todays_date.setHours(0,0,0,0);
            }

            // Scroll after a short delay to make sure the UI is fully loaded
            $timeout(scrollToAnchor, 500);
        }

        /**
         * Finds the closest anchor in the appointments list when it first renders.
         * The 'closest' anchor is the determined by the closest appointment at a chosen time
         * @returns {string}
         */
        function findClosestAnchor() {
            if(vm.appointments.length>0) {
                if(dateLast<chosenTimeMilliseconds) return 'lastAnchor';
                else if(dateFirst>chosenTimeMilliseconds) return 'firstAnchor';
                else{
                    let ind = findClosestAppointmentToTime(chosenTimeMilliseconds);
                    return 'anchorAppointments'+ ind;
                }
            }
            return 'lastAnchor';
        }

        /**
         * Finds closest appointment to a given time in milliseconds
         * @param tmili
         * @returns {number}
         */
        function findClosestAppointmentToTime(tmili) {
            for(let i =0;i<vm.appointments.length;i++) {
                if(vm.appointments[i].ScheduledStartTime.getTime() >= tmili) return i;
            }
            return 0;
        }

        /**
         * Scrolls to closest anchor
         */
        function scrollToAnchor() {
            let anchor=findClosestAnchor();
            $location.hash(anchor);
            $anchorScroll();
        }

        /**
         * Adjusts the calendar font size to the user's preferred font size
         */
        function initializeCalendarStyle(){
            let fontSize = UserPreferences.getFontSize();
            fontSize = fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
            let elem = document.querySelector('.fontDesc' + fontSize);
            let style = getComputedStyle(elem);
            fontSize = style.fontSize;
            createClass('.uib-datepicker table thead tr th button div', "font-size: " +  fontSize + "!important;");
        }

        /**
         * Dynamically generates CSS class
         * @param name
         * @param rules
         */
        function createClass(name,rules){
            let style = document.createElement('style');
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);
            if(!(style.sheet||{}).insertRule)
                (style.styleSheet || style.sheet).addRule(name, rules);
            else
                style.sheet.insertRule(name+"{"+rules+"}",0);
        }


        /*************************
         *  PUBLIC METHODS
         *************************/

        /**
         * Functions used by calendar to display the 'dots'
         * @param date
         * @returns {string}
         */
        function showDotColor(date) {
            if (vm.appointments.length === 0) {
                vm.appointments = Appointments.getAppointments();
            }

            // TODO: this is a huge bottleneck for the situation where a user has a bunch of appointments!!
            // TODO: can be optimized by creating a hashmap that maps date to a list of appointments
            //check to see if an appointment exists at the selected date
            let result = vm.appointments.find(function(item){
                return item.ScheduledStartTime.toDateString() === date.toDateString();
            });

            let appt_time = getMilliseconds(date);

            //if an appointment exists
            if(result) {
               return getAppointmentColor(appt_time);
            }else{
                return 'rgba(255,255,255,0.0)';
            }
        }

        /**
         * Determines appointment list color for each appointment
         * @param index
         * @returns {string}
         */
        function getListColor(index){
            let appointment_date = vm.appointments[index].ScheduledStartTime;
            let appointment_milli = getMilliseconds(appointment_date);
            return getAppointmentColor(appointment_milli)
        }

        /**
         * Determines whether to show the header at the end of the scroll list
         * @returns {boolean}
         */
        function showHeaderEnd() {
            if(!vm.appointments) return false;
            return vm.appointments.length > 0 && dateLast < chosenTimeMilliseconds;
        }
        /**
         * Determines whether or not to show the date header in the appointment list
         * @param {Number} index
         * @returns {boolean}
         */
        function showChosenDateHeader(index)
        {
            // whether or not the current appointment and previous appointment have the same date
            let same_date_as_prev = false;

            // Convert the appointment date at the given index to milliseconds
            let selected_date = getMilliseconds(vm.appointments[index].ScheduledStartTime);

            //if it's not the first appointment in the list...
            if(index !== 0) {
                //compare it to the appointment before and see if they share the same date
                let date_prev = getMilliseconds(vm.appointments[index - 1].ScheduledStartTime);

                // if they share the same date, then you don't need to show the header, as it should be encompassed by a previous appointment on the same date
                same_date_as_prev = date_prev === selected_date;

                // pretty cryptic property.. not really sure what the first expression represents
                vm.showHeaderNormalDay = (chosenTimeMilliseconds !== selected_date) && !same_date_as_prev;

                if(date_prev===selected_date) {
                    return false;
                }else{
                    return (selected_date > chosenTimeMilliseconds && date_prev < chosenTimeMilliseconds)
                        || selected_date === chosenTimeMilliseconds;
                }
            } else {
                // pretty cryptic property.. not really sure what the first expression represents
                vm.showHeaderNormalDay = (chosenTimeMilliseconds !== selected_date) && !same_date_as_prev;
                return chosenTimeMilliseconds === selected_date || chosenTimeMilliseconds < selected_date;
            }
        }

        /**
         * @description Opens the individual appointment view for a given appointment, and marks it as read.
         * @param {object} appointment The appointment to open.
         */
        function goToAppointment(appointment) {
            if(appointment.ReadStatus === '0') {
                Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
                // Mark corresponding notification as read
                Notifications.implicitlyMarkCachedNotificationAsRead(
                    appointment.AppointmentSerNum,
                    Notifications.appointmentNotificationTypes(),
                );
            }
            navigator.pushPage('./views/personal/appointments/individual-appointment.html', {'Post': appointment});
        }

        /**
         * Opens the calendar legend
         */
        function goToCalendarOptions() {
            navigator.pushPage('./views/personal/appointments/calendar-options.html');
        }

        /**
         * Scrolls to date when user interacts with the calendar
         */
        function onDateChange() {
            chosenTimeMilliseconds = vm.todays_date.getTime();
            scrollToAnchor();
        }

        /**
         * Converts a date to its milliseconds representation from the beginning of the day
         * @param date
         * @returns {*|number}
         */
        function getMilliseconds(date){
            let temp = new Date(date);
            return temp.setHours(0,0,0,0);
        }

        /**
         * Maps an appointment date to a color
         * @param date
         * @returns {string}
         */
        function getAppointmentColor(date){
            switch(true){
                // Future appointments
                case date > todaysTimeMilliseconds:
                    return '#cf5c4c';

                // Today's appointments
                case date === todaysTimeMilliseconds:
                    return '#3399ff';

                // Past appointments
                case date < todaysTimeMilliseconds:
                    return '#5CE68A';
            }
        }

        function bindEvents() {
            // Remove event listeners
            $scope.$on('$destroy', () => {
                $location.hash('');
                navigator.off('prepop');
            });

            // Reload user profile if appointments calendar was opened via Home tab,
            // and profile was implicitly changed.
            navigator.on('prepop', () => Navigator.reloadPreviousProfilePrepopHandler('home.html', ['Appointments']));
        }
    }
})();
