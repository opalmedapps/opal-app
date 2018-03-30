/*
 * Filename     :   calendarController.js
 * Description  :   This file controls the displaying of appointments on the calendar and the UI interactions with it.
 * Created by   :   David Herrera
 * Date         :   May 20, 2015
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *  Manages the the displaying of appointments on the calendar and the UI interactions with it.
 *  It also controls the list of appointments that lie below the calendar.
 *  The list and calendar work in parallel.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CalendarController', CalendarController);

    CalendarController.$inject = ['Appointments', '$timeout', '$location', '$anchorScroll','NavigatorParameters', 'UserPreferences', '$window'];

    /* @ngInject */
    function CalendarController(Appointments, $timeout, $location, $anchorScroll, NavigatorParameters, UserPreferences, $window) {
        var vm = this;

        var todaysTimeMilliseconds;
        var choosenTimeMilliseconds;
        var today;
        var dateLast;
        var dateFirst;
        var navigatorName;

        /**
         * The date options that are fed into the appointment calendar
         * @type {{formatYear: string, startingDay: number, formatDay: string, showWeeks: boolean}}
         */
        vm.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 0,
            formatDay:'d',
            showWeeks:false
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
         * The user's preferred language/
         * Either 'EN' or 'FR'
         * @type {string}
         */
        vm.language = '';

        /**
         * Today's date, which is fed into the calendar
         * @type {Date}
         */
        vm.todays_date = new Date();

        /**
         * Flag to toggle loading icon
         * @type {boolean}
         */
        vm.loading = true;

        /**
         * DOM Functions
         */
        vm.showDotColor = showDotColor;
        vm.getListColor = getListColor;
        vm.showHeaderEnd = showHeaderEnd;
        vm.showChosenDateHeader = showChosenDateHeader;
        vm.goToAppointment=goToAppointment;
        vm.goToCalendarOptions = goToCalendarOptions;
        vm.onDateChange = onDateChange;

        activate();

        //////////////////////////////////////////////////////

        /*************************
         *  PRIVATE FUNCTIONS
         *************************/

        function activate() {

            // Get the user's language
            vm.language = UserPreferences.getLanguage();

            // Set today's hours to beginning of the day
            vm.todays_date.setHours(0,0,0,0);
            today = vm.todays_date;

            //Getting time in milliseconds for today's appointment
            todaysTimeMilliseconds =  today.getTime();
            choosenTimeMilliseconds = todaysTimeMilliseconds;

            // Initialize calendar styling
            initializeCalendarStyle();

            // Get the name of the current navigator
            navigatorName = NavigatorParameters.getParameters().Navigator;

            //the reason we add a delay here is because the calendar view needs to render first, otherwise the list takes up the entire view.
            // TODO: THINK OF MORE ELEGANT WAY TO PERFORM THIS THAT REDUCES LOAD TIME --> I.E. LIST VIRTUALIZATION
            $timeout(function(){
                vm.appointments=Appointments.getUserAppointments();
                vm.noAppointments = (vm.appointments.length === 0);
            }, 450)
                .then(function(){
                    if(vm.appointments.length>0) {

                        //Setting time in milliseconds for last appointment
                        dateLast=(new Date(vm.appointments[vm.appointments.length-1].ScheduledStartTime.getTime()));
                        dateLast.setHours(0,0,0,0);
                        dateLast = dateLast.getTime();

                        //Setting time in milliseconds for first appointment
                        dateFirst=(new Date(vm.appointments[0].ScheduledStartTime.getTime()));
                        dateFirst.setHours(0,0,0,0);
                        dateFirst = dateFirst.getTime();
                    }

                    $timeout(function(){
                        vm.loading = false;
                        setScrollHeight();
                        setTimeout(scrollToAnchor, 50);
                    })
                })
        }

        /**
         * Finds the closest anchor in the appointments list when it first renders.
         * The 'closest' anchor is the determined by the closest appointment at a chosen time
         * @returns {string}
         */
        function findClosestAnchor() {
            if(vm.appointments.length>0) {
                if(dateLast<choosenTimeMilliseconds) return 'lastAnchor';
                else if(dateFirst>choosenTimeMilliseconds) return 'firstAnchor';
                else{
                    var ind = findClosestAppointmentToTime(choosenTimeMilliseconds);
                    return 'anchorAppointments'+ ind;
                }
            }
            return 'firstAnchor';
        }

        /**
         * Finds closest appointment to a given time in milliseconds
         * @param tmili
         * @returns {number}
         */
        function findClosestAppointmentToTime(tmili) {
            for(var i =0;i<vm.appointments.length;i++) {
                if(vm.appointments[i].ScheduledStartTime.getTime() >= tmili) return i;
            }
            return 0;
        }

        /**
         * Scrolls to closest anchor
         */
        function scrollToAnchor() {
            var anchor=findClosestAnchor();
            $location.hash(anchor);
            $anchorScroll();
        }

        /**
         * Adjusts the calendar font size to the user's preferred font size
         */
        function initializeCalendarStyle(){
            var fontSize = UserPreferences.getFontSize();
            fontSize = fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
            var elem = document.querySelector('.fontDesc' + fontSize);
            var style = getComputedStyle(elem);
            fontSize = style.fontSize;
            createClass('.uib-datepicker table thead tr th button div', "font-size: " +  fontSize + "!important;");
        }

        /**
         * Dynamically generates CSS class
         * @param name
         * @param rules
         */
        function createClass(name,rules){
            var style = document.createElement('style');
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);
            if(!(style.sheet||{}).insertRule)
                (style.styleSheet || style.sheet).addRule(name, rules);
            else
                style.sheet.insertRule(name+"{"+rules+"}",0);
        }

        /**
         * Initializes the scroll height for when the appointments load
         */
        function setScrollHeight(){
            var divTreatment = document.getElementById('scrollerAppointments');
            var heightTreatment = document.documentElement.clientHeight-document.documentElement.clientHeight*0.35-180;
            if(divTreatment) divTreatment.style.height=heightTreatment+'px';
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
            if(vm.appointments.length === 0){
                vm.appointments=Appointments.getUserAppointments();
            }

            // TODO: this is a huge bottleneck for the situation where a user has a bunch of appointments!!
            // TODO: can be optimized by creating a hashmap that maps date to a list of appointments
            //check to see if an appointment exists at the selected date
            var result = vm.appointments.find(function(item){
                return item.ScheduledStartTime.toDateString() === date.toDateString();
            });

            var appt_time = getMilliseconds(date);

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
            var appointment_date = vm.appointments[index].ScheduledStartTime;
            var appointment_milli = getMilliseconds(appointment_date);
            return getAppointmentColor(appointment_milli)
        }

        /**
         * Determines whether to show the header at the end of the scroll list
         * @returns {boolean}
         */
        function showHeaderEnd() {
            if(!vm.appointments) return false;
            return vm.appointments.length > 0 && dateLast < choosenTimeMilliseconds;
        }

        /**
         * Determines whether or not to show the date header in the appointment list
         * @param index
         * @returns {boolean}
         */
        function showChosenDateHeader(index)
        {
            // whether or not the current appointment and previous appointment have the same date
            var same_date_as_prev = false;

            // Convert the appointment date at the given index to milliseconds
            var selected_date = getMilliseconds(vm.appointments[index].ScheduledStartTime);

            //if it's not the first appointment in the list...
            if(index !== 0) {
                //compare it to the appointment before and see if they share the same date
                var date_prev = getMilliseconds(vm.appointments[index - 1].ScheduledStartTime);

                // if they share the same date, then you don't need to show the header, as it should be encompassed by a previous appointment on the same date
                same_date_as_prev = date_prev === selected_date;

                // pretty cryptic property.. not really sure what the first expression represents
                vm.showHeaderNormalDay = (choosenTimeMilliseconds !== selected_date) && !same_date_as_prev;

                if(date_prev===selected_date) {
                    return false;
                }else{
                    return (selected_date > choosenTimeMilliseconds && date_prev < choosenTimeMilliseconds)
                        || selected_date === choosenTimeMilliseconds;
                }
            } else {
                // pretty cryptic property.. not really sure what the first expression represents
                vm.showHeaderNormalDay = (choosenTimeMilliseconds !== selected_date) && !same_date_as_prev;
                return choosenTimeMilliseconds === selected_date || choosenTimeMilliseconds < selected_date;
            }
        }

        /**
         * Takes the user to their appointment details
         * @param appointment
         */
        function goToAppointment(appointment) {
            if(appointment.ReadStatus === '0') Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
            NavigatorParameters.setParameters({'Navigator':navigatorName, 'Post':appointment});
            $window[navigatorName].pushPage('./views/personal/appointments/individual-appointment.html');
        }

        /**
         * Opens the calendar legend
         */
        function goToCalendarOptions() {
            $window[navigatorName].pushPage('./views/personal/appointments/calendar-options.html');
        }

        /**
         * Scrolls to date when user interacts with the calendar
         */
        function onDateChange() {
            choosenTimeMilliseconds = vm.todays_date.getTime();
            scrollToAnchor();
        }

        /**
         * Converts a date to its milliseconds representation from the beginning of the day
         * @param date
         * @returns {*|number}
         */
        function getMilliseconds(date){
            var temp = new Date(date);
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
    }
})();



