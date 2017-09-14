/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CalendarController', CalendarController);

    CalendarController.$inject = ['Appointments', '$timeout', '$location', '$anchorScroll','NavigatorParameters', 'UserPreferences', 'Logger'];

    /* @ngInject */
    function CalendarController(Appointments, $timeout, $location, $anchorScroll, NavigatorParameters, UserPreferences, Logger) {
        var vm = this;
        var flag;
        var todaysTimeMilliseconds;
        var choosenTimeMilliseconds;
        var today;
        var dateLast;
        var dateFirst;
        var navigatorName;

        //Set the calendar options
        vm.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 0,
            formatDay:'d',
            showWeeks:false
        };
        //Determines color for calendar dates based on appointments
        vm.showColor = showColor;
        //Obtains color for a given appointment
        vm.getStyle=getStyle;
        //Determines whether to show header at the end
        vm.showHeaderEnd = showHeaderEnd;
        //Determines whether or not to show red highlighted date per index
        vm.showChoosenDateHeader=showChoosenDateHeader;
        //Go to Appointment
        vm.goToAppointment=goToAppointment;
        //Go to Calendar options
        vm.goToCalendarOptions = goToCalendarOptions;
        vm.onDateChange = onDateChange;

        //monitors whether or not the calendar is displayed
        vm.showCalendar = true;

        vm.scrollerHeight = '';

        init();


        ////////////////////////////////////

        function init()
        {
            Logger.sendLog('Appointment', 'all');
            navigatorName = NavigatorParameters.getParameters().Navigator;

            //Obtaining and setting appointments from service
            vm.appointments=Appointments.getUserAppointments();
            vm.noAppointments = (vm.appointments.length === 0);
            vm.loading = !vm.noAppointments;
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


            waitForCalendar()
                .then(function(){
                    var divTreatment=document.getElementById('scrollerAppointments');
                    var heightTreatment=document.documentElement.clientHeight-document.documentElement.clientHeight*0.35-180;
                    if(divTreatment)divTreatment.style.height=heightTreatment+'px';
                    setTimeout(scrollToAnchor,100);
                    Appointments.setAsLoaded();
                })
        }

        function scrollToAnchor()
        {
            var anchor=findClosestAnchor();
            $location.hash(anchor);
            $anchorScroll();
        }

        function waitForCalendar()
        {
            return $timeout(function () {}, 500);
        }

        function goToCalendarOptions()
        {
            window[navigatorName].pushPage('./views/personal/appointments/calendar-options.html');
        }

        //Watcher for the calendar date
        function onDateChange() {
            choosenTimeMilliseconds = vm.dt.getTime();
            scrollToAnchor();
        }

        //Determines color for calendar dates based on appointments
        function showColor(date)
        {
            var result = vm.appointments.find(function(item){
                return  item.ScheduledStartTime.toDateString() == date.toDateString();
            });
            if(result)
            {
                if(date.getTime()> todaysTimeMilliseconds)
                {
                    return '#cf5c4c';
                }else if(date.getTime() == todaysTimeMilliseconds)
                {
                    return '#3399ff';
                }else{
                    return '#5CE68A';
                }
            }else{
                return 'rgba(255,255,255,0.0)';
            }
        }


        //Returns string with closest anchor
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

        //Finds the closest appointment that happens after the choosen appointment, this is use for scrolling
        //Could be done with binary search for an improvement
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

        //Obtains color for a given appointment
        function getStyle(index){
            var dateAppointment=vm.appointments[index].ScheduledStartTime;
            if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
                return '#3399ff';
            }else if(dateAppointment>today){
                return '#cf5c4c';
            }else{
                return '#5CE68A';
            }
        }

        //Determines whether to show header at the end
        function showHeaderEnd()
        {
            return vm.appointments.length > 0 && dateLast < choosenTimeMilliseconds;

        }

        //Determines when to show header of appointment vs red highlighted header
        function showChoosenDateHeader(index)
        {
            var same_date = false;
            var cur_date=new Date(vm.appointments[index].ScheduledStartTime);
            cur_date.setHours(0,0,0,0);
            cur_date=cur_date.getTime();

            if(index !== 0){
                var date_prev = new Date(vm.appointments[index - 1].ScheduledStartTime);
                date_prev.setHours(0,0,0,0);
                date_prev=date_prev.getTime();
                same_date = date_prev === cur_date;
            }

            vm.showHeaderNormalDay = (choosenTimeMilliseconds !== cur_date) && !same_date;

            if(index===0)
            {
                return choosenTimeMilliseconds === cur_date || choosenTimeMilliseconds < cur_date;
            }else
            {
                var date1=new Date(vm.appointments[index-1].ScheduledStartTime.getTime());
                date1.setHours(0,0,0,0);
                date1=date1.getTime();
                if(date1===cur_date)
                {
                    return false;
                }else{
                    return (cur_date > choosenTimeMilliseconds && date1 < choosenTimeMilliseconds) || cur_date === choosenTimeMilliseconds;
                }
            }
        }

        //Leaves to appointment
        function goToAppointment(appointment)
        {
            if(appointment.ReadStatus === '0') Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
            NavigatorParameters.setParameters({'Navigator':navigatorName, 'Post':appointment});
            window[navigatorName].pushPage('./views/personal/appointments/individual-appointment.html');
        }
    }
})();



