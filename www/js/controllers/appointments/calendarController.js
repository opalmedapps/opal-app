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
 *  @ngdoc controller
 *  @name MUHCApp.controllers: CalendarController
 *  @description
 *
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

        var flag;
        var todaysTimeMilliseconds;
        var choosenTimeMilliseconds;
        var today;
        var dateLast;
        var dateFirst;
        var navigatorName;


        /**
         * @ngdoc property
         * @name dateOptions
         * @propertyOf CalendarController
         * @returns object
         * @description used by the controller to feed the correct date properties to the calendar view
         */
        vm.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 0,
            formatDay:'d',
            showWeeks:false
        };

        /**
         * @ngdoc property
         * @name scrollerHeight
         * @propertyOf CalendarController
         * @returns string or int
         * @description used by the controller to determine where to scroll to in the appointment list
         */
        vm.scrollerHeight = '';

        /**
         * @ngdoc property
         * @name appointments
         * @propertyOf CalendarController
         * @returns array
         * @description used by the controller to display all of the user's appointments
         */
        vm.appointments = [];

        /**
         * @ngdoc property
         * @name noAppointments
         * @propertyOf CalendarController
         * @returns boolean
         * @description used by the controller to trigger the display of "no appointment" message
         */
        vm.noAppointments = false;

        /**
         * @ngdoc property
         * @name language
         * @propertyOf CalendarController
         * @returns string
         * @description used by the controller show the appropriate appointment information
         */
        vm.language = '';

        /**
         * @ngdoc property
         * @name dt
         * @propertyOf CalendarController
         * @returns Date
         * @description used by the controller to determine today's date
         */
        vm.dt = null;

        vm.showColor = showColor;
        vm.getStyle=getStyle;
        vm.showHeaderEnd = showHeaderEnd;
        vm.showChoosenDateHeader=showChosenDateHeader;
        vm.goToAppointment=goToAppointment;
        vm.goToCalendarOptions = goToCalendarOptions;
        vm.onDateChange = onDateChange;

        activate();

        ////////////////////////////////////

        /*************************
         *  PRIVATE FUNCTIONS
         *************************/

        function activate()
        {
            navigatorName = NavigatorParameters.getParameters().Navigator;

            /**
             * @ngdoc property
             * @name loading
             * @propertyOf CalendarController
             * @returns string or int
             * @description used by the controller show loading view
             */
            vm.loading = true;

            //the reason we add a delay here is because the calendar view needs to render first, otherwise the list takes up the entire view.
            // TODO: THINK OF MORE ELEGANT WAY TO PERFORM THIS THAT REDUCES LOAD TIME --> I.E. LIST VIRTUALIZATION
            $timeout(function(){
                vm.appointments=Appointments.getUserAppointments();
                vm.noAppointments = (vm.appointments.length === 0);
            }, 450)
                .then(function(){
                    vm.language = UserPreferences.getLanguage();

                    vm.dt = new Date();
                    vm.dt.setHours(0,0,0,0);
                    today = vm.dt;
                    flag=false;

                    //Getting time in milliseconds for today's appointment
                    todaysTimeMilliseconds =  today.getTime();
                    choosenTimeMilliseconds = todaysTimeMilliseconds;

                    if(vm.appointments.length>0)
                    {
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
                        var divTreatment=document.getElementById('scrollerAppointments');
                        var heightTreatment=document.documentElement.clientHeight-document.documentElement.clientHeight*0.35-180;
                        if(divTreatment)divTreatment.style.height=heightTreatment+'px';
                        setTimeout(scrollToAnchor, 50);
                    })
                })
        }

        /**
         * @ngdoc function
         * @name findClosestAnchor
         * @methodOf MUHCApp.controllers.CalendarController
         * @return string
         * @description
         * Returns string with closest anchor
         */
        function findClosestAnchor()
        {
            if(vm.appointments.length>0)
            {
                if(dateLast<choosenTimeMilliseconds) return 'lastAnchor';
                else if(dateFirst>choosenTimeMilliseconds) return 'firstAnchor';
                else{
                    var ind = findClosestAppointmentToTime(choosenTimeMilliseconds);
                    return 'anchorAppointments'+ ind;
                }
            }
            return 'firstAnchor';
        }

        //
        /**
         * @ngdoc function
         * @name findClosestAppointmentToTime
         * @methodOf MUHCApp.controllers.CalendarController
         * @param tmili the selected time in milliseconds
         * @return int the index of the appointment (if exists)
         * @description
         * Finds the closest appointment that happens after the chosen appointment, this is used for scrolling
         *
         */
        function findClosestAppointmentToTime(tmili)
        {
            for(var i =0;i<vm.appointments.length;i++)
            {
                var date = vm.appointments[i].ScheduledStartTime.getTime();
                if(date >= tmili)
                {
                    return i;
                }
            }
            return 0;
        }

        /**
         * @ngdoc function
         * @name scrollToAnchor
         * @methodOf MUHCApp.controllers.CalendarController
         * @description
         * scrolls to the desired position in the appointment list
         */
        function scrollToAnchor()
        {
            var anchor=findClosestAnchor();
            $location.hash(anchor);
            $anchorScroll();
        }

        /*************************
         *  PUBLIC METHODS
         *************************/

        /**
         * @ngdoc method
         * @name showColor
         * @methodOf MUHCApp.controllers.CalendarController
         * @param date Date object
         * @return string that represents the hex color of an appointment
         * @description
         * Determines color for calendar dates based on appointments
         */
        function showColor(date)
        {
            //check to see if an appointment exists at the selected date
            var result = vm.appointments.find(function(item){
                return item.ScheduledStartTime.toDateString() === date.toDateString();
            });

            var date_compare = new Date(date.toDateString());
            date_compare.setHours(0,0,0,0);

            //if an appointment exists
            if(result)
            {
                //if it is a future appointment...
                if(date_compare.getTime() > todaysTimeMilliseconds)
                {
                    return '#cf5c4c';
                } else if(date_compare.getTime() === todaysTimeMilliseconds) {
                    //it is an appointment today
                    return '#3399ff';
                }else{
                    //other wise it is a past appointment
                    return '#5CE68A';
                }
            }else{
                //otherwise there is no appointment, and doesn't need to have a color in the calendar
                return 'rgba(255,255,255,0.0)';
            }
        }

        /**
         * @ngdoc method
         * @name getStyle
         * @methodOf MUHCApp.controllers.CalendarController
         * @param index int representing index of appointment
         * @return string that represents the hex color of an appointment
         * @description
         * Obtains color for a given appointment to be displayed in the appointment list
         */
        function getStyle(index){
            var appointment_date = vm.appointments[index].ScheduledStartTime;

            //assume it is a past appointment?
            if(!appointment_date  || !today) return  '#5CE68A';

            //it is an appointment today
            if(today.getDate()===appointment_date .getDate()&&today.getMonth()===appointment_date .getMonth()&&today.getFullYear()===appointment_date .getFullYear()){
                return '#3399ff';
            }else if(appointment_date >today){
                //it is a future appointment
                return '#cf5c4c';
            }else{
                //it is a past appointment
                return '#5CE68A';
            }
        }

        /**
         * @ngdoc method
         * @name showHeaderEnd
         * @methodOf MUHCApp.controllers.CalendarController
         * @return boolean that tells view whether or not to show header
         * @description
         * Determines whether to show header at the end
         */
        function showHeaderEnd()
        {
            if(!vm.appointments) return false;
            return vm.appointments.length > 0 && dateLast < choosenTimeMilliseconds;

        }

        /**
         * @ngdoc method
         * @name showChosenDateHeader
         * @methodOf MUHCApp.controllers.CalendarController
         * @param index int position of appointment in array
         * @return boolean that tells view whether or not to show header
         * @description
         * Determines when to show header of appointment vs red highlighted header
         */
        function showChosenDateHeader(index)
        {
            // boolean for determining whether or not the current appointment and previous appointment have the same date
            var same_date_as_prev = false;

            //get the date of the selected appointment and formats it for easy comparison
            var selected_date=new Date(vm.appointments[index].ScheduledStartTime);
            selected_date.setHours(0,0,0,0);
            selected_date=selected_date.getTime();

            //if it's not the first appointment in the list...
            if(index !== 0) {
                //compare it to the appointment before and see if they share the same date
                var date_prev = new Date(vm.appointments[index - 1].ScheduledStartTime);
                date_prev.setHours(0,0,0,0);
                date_prev=date_prev.getTime();

                // if they share the same date, then you don't need to show the header, as it should be encompassed by a previous appointment on the same date
                same_date_as_prev = date_prev === selected_date;
            }

            // pretty cryptic property.. not really sure what the first expression represents
            vm.showHeaderNormalDay = (choosenTimeMilliseconds !== selected_date) && !same_date_as_prev;

            if(index===0) {
                return choosenTimeMilliseconds === selected_date || choosenTimeMilliseconds < selected_date;
            } else {
                var date1=new Date(vm.appointments[index-1].ScheduledStartTime.getTime());
                date1.setHours(0,0,0,0);
                date1=date1.getTime();
                if(date1===selected_date)
                {
                    return false;
                }else{
                    return (selected_date > choosenTimeMilliseconds && date1 < choosenTimeMilliseconds) || selected_date === choosenTimeMilliseconds;
                }
            }
        }

        /**
         * @ngdoc method
         * @name goToAppointment
         * @methodOf MUHCApp.controllers.CalendarController
         * @param appointment appointment object selected in view
         * @description
         * Takes user to the selected appointment
         */
        function goToAppointment(appointment)
        {
            if(appointment.ReadStatus === '0') Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
            NavigatorParameters.setParameters({'Navigator':navigatorName, 'Post':appointment});
            $window[navigatorName].pushPage('./views/personal/appointments/individual-appointment.html');
        }

        /**
         * @ngdoc method
         * @name goToCalendarOptions
         * @methodOf MUHCApp.controllers.CalendarController
         * @description
         * Takes user to the calendar legend
         */
        function goToCalendarOptions()
        {
            $window[navigatorName].pushPage('./views/personal/appointments/calendar-options.html');
        }

        /**
         * @ngdoc method
         * @name onDateChange
         * @methodOf MUHCApp.controllers.CalendarController
         * @description
         * Watcher for the calendar date that scrolls to the selected date in the appointment list
         */
        function onDateChange() {
            choosenTimeMilliseconds = vm.dt.getTime();
            scrollToAnchor();
        }
    }
})();



