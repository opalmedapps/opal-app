var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.services:PatientAppointments
*@requires $filter
*@requires MUHCApp.service:RequestToServer
*@requires $q
*@requires MUHCApp.service:UserAuthorizationInfo
*@requires $cordovaCalendar
*@description Sets the User appointment objects for the different views.
**/
myApp.service('Appointments', ['$q', 'RequestToServer','$cordovaCalendar','UserAuthorizationInfo', '$filter', function ($q,RequestToServer, $cordovaCalendar, UserAuthorizationInfo, $filter) {
    /**
    *@ngdoc property
    *@name  UserAppointmentsArray
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Array that contains all user appointments organized chronologically from most recent to least recent.
    **/
    /**
    *@ngdoc property
    *@name  TodayAppointments
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Array that contains today's appointments organized in increasing order of date.
    *
    **/
    /**
    *@ngdoc property
    *@name  FutureAppointments
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Array that contains today's appointments organized in increasing order of date.
    *
    **/
    /**
    *@ngdoc property
    *@name  PastAppointments
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Array that contains Past's appointments organized in decreasing order of date.
    *
    **/
    /**
    *@ngdoc property
    *@name  calendar
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Contains the appointment calendar object organized in a {year}->{months}->{day}->[Array Of Appointments That Day] format
    *
    **/
        function findAppointmentInNativeCalendar(app)
        {
            var r=$q.defer();
            var appointmentsString=window.localStorage.getItem('NativeCalendarAppoinments');
            
            if(!appointmentsString){
                r.reject(app);
            }else{
                console.log(appointmentString);
                appointmentsObject=JSON.parse(appointmentsString);
                var appointments=appointmentsObject.AppointmentList;
                for(var i=0;i<appointments.length;i++){
                     var startDateApp=appointments[i].AppointmentSerNum;
                     if(startDateApp==app.AppointmentSerNum){
                        r.resolve(true);
                        return r.promise;
                     }
                }
                r.reject(app);
            }
          
            return r.promise;
        }
        function addEventToNativeCalendar(app){
            var appointmentsString=window.localStorage.getItem('NativeCalendarAppoinments');
            if(appointmentsString){
                appointmentsObject=JSON.parse(appointmentsString);
                appointmentsObject.AppointmentList.push(app);
                appointmentString=JSON.stringify(appointmentsObject);
                window.localStorage.setItem('NativeCalendarAppoinments',appointmentString);
            }else{
                objectToLocalStorage={};
                objectToLocalStorage.AppointmentList=[];
                objectToLocalStorage.AppointmentList.push(app);
                appointmentString=JSON.stringify(objectToLocalStorage);
                window.localStorage.setItem('NativeCalendarAppoinments',appointmentString);
            }
          
        }
    return {

         /**
        *@ngdoc method
        *@name setUserAppoinments
        *@methodOf MUHCApp.services:UserAppointments
        *@param {Object} appointments Appointment object obtain from Firebase
        *@description Function is called from the {@link MUHCApp.services:UpdateUI}. The function sets the UserAppointmentsArray, TodayAppointments, FutureAppointments, PastAppointments for the Appointment List used in
        the {@link MUHCApp.controller:AppointmentListController AppointmentListController}, and calendar object used in the {@link MUHCApp.controller:CalendarController CalendarController}.
        **/
        setUserAppointments: function (appointments) {
        //Initializing Variables
                this.UserAppointmentsInNativeCalendar=[];
                this.UserAppointmentsArray = [];
                this.TodayAppointments = [];
                this.FutureAppointments = [];
                this.PastAppointments = [];
                this.NextAppointment={};
                if (appointments === undefined) return;
                var keysArray = Object.keys(appointments);
                //Setting min date for upcoming appointment
                var min=Infinity;
                //Format date to javascript date
                for (var i = 0; i < keysArray.length; i++) {
                    appointments[keysArray[i]].ScheduledStartTime = $filter('formatDate')(appointments[keysArray[i]].ScheduledStartTime);
                    appointments[keysArray[i]].ScheduledEndTime =  $filter('formatDate')(appointments[keysArray[i]].ScheduledEndTime);
                    this.UserAppointmentsArray[i] = appointments[keysArray[i]];

                    //Sort them by upcoming, past categories. Today's appointment array can be past or upcoming
                    var today = new Date();
                    var todayDay = today.getDate();
                    var todayMonth = today.getMonth() + 1;
                    var todayYear = today.getFullYear();
                    var appointmentDate = (this.UserAppointmentsArray[i]).ScheduledStartTime;

                    var appointmentDateDay = appointmentDate.getDate();
                    var appointmentDateMonth = appointmentDate.getMonth() + 1;
                    var appointmentDateYear = appointmentDate.getFullYear();

                    //Deciding the appointments for the day
                    if (todayDay === appointmentDateDay && todayMonth === appointmentDateMonth && todayYear === appointmentDateYear) {
                        this.TodayAppointments.push(this.UserAppointmentsArray[i]);
                    }

                    //Deciding whether they are future or past appointments
                    var dateDiff = (today.getTime() - (this.UserAppointmentsArray[i].ScheduledStartTime).getTime());
                    if (dateDiff < 0) {
                        //Choosing the next appointment
                         if(-1*dateDiff<min){
                            this.NextAppointment.Object=this.UserAppointmentsArray[i];
                            this.NextAppointment.Index=i;
                            min=dateDiff;
                        }
                        this.FutureAppointments.push(this.UserAppointmentsArray[i]);
                    } else {
                        this.PastAppointments.push(this.UserAppointmentsArray[i]);
                    }
                }


                //Sort Appointments chronologically most recent first
                this.UserAppointmentsArray = $filter('orderBy')(this.UserAppointmentsArray, 'ScheduledStartTime', false);
                this.PastAppointments=$filter('orderBy')(this.PastAppointments, 'ScheduledStartTime',true);
                this.TodayAppointments=$filter('orderBy')(this.TodayAppointments, 'ScheduledStartTime',false);
                this.FutureAppointments=$filter('orderBy')(this.FutureAppointments, 'ScheduledStartTime',false);
                if(this.NextAppointment!==undefined&&this.NextAppointment.Object.ScheduledStartTime.getTime()<(new Date()).getTime()){
                    this.NextAppointment={};
                }
                console.log(this.UserAppointmentsArray);
        /*  
            * Setting User Calendar
            //The rest of this function takes the results from the sorted by date appointments and organizes them into an object with
             //hierarchical structure year->month->day->appointments for the day, the dayly appointments are arrays.  

        */
        //Initializing local variables
        var year = -1;
        var month = -1;
        var day = -1;
        this.calendar = {};
        var calendarYear = {};
        var calendarMonth = {};
        //If there are not appointments return -1;
        if (this.UserAppointmentsArray === undefined) return -1;
        //Loop goes through all the appointments in the sorted array of appointments, remember this only works if ap
        //appointments are already sorted
        for (var i = 0; i < this.UserAppointmentsArray.length; i++) {

            //Gets year, month and day for appointment
            var tmpYear = (this.UserAppointmentsArray[i].ScheduledStartTime).getFullYear();
            var tmpMonth = (this.UserAppointmentsArray[i].ScheduledStartTime).getMonth() + 1;
            var tmpDay = (this.UserAppointmentsArray[i].ScheduledStartTime).getDate();

            //if month has changed, since appointments in order, add the resulting appointments to for that month to the correspongding
            //calendar year. 
            if (month !== tmpMonth || (month === tmpMonth && year !== tmpYear)) {
                if (i > 0) {
                    calendarYear[month] = {};
                    calendarYear[month] = calendarMonth;
                    calendarMonth = {};
                }
                month = tmpMonth;
            }

            //if year has changed, add year to the calendar object and changed the year to the year it changed too
            if (year !== tmpYear) {
                if (i > 0) {
                    this.calendar[year] = {};
                    this.calendar[year] = calendarYear;
                    calendarYear = {};
                    calendarMonth = {};
                }
                year = tmpYear;

            }

            //If statement just to defined objects and prevent exception in case certain day does not
            //have any appointments yet. It then adds to the calendaMonth object for that day the 
            //appointment 
            if (calendarMonth[tmpDay] === undefined) calendarMonth[tmpDay] = [];
            calendarMonth[tmpDay].push(this.UserAppointmentsArray[i]);

        }
        //Last Month, of year
        calendarYear[month] = {};
        calendarYear[month] = calendarMonth;
        this.calendar[year] = {};
        this.calendar[year] = calendarYear;

        },
        /**
        *@ngdoc method
        *@name getUserAppointment
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} UserAppointmentArray 
        *@description Returns the Array of Appointments organized chronologically.
        **/
        getUserAppointments: function () {

            return this.UserAppointmentsArray;
        },
         /**
        *@ngdoc method
        *@name getTodaysAppointments
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} TodayAppointments 
        *@description Returns an Array with appointments for the day.
        **/
        getTodaysAppointments: function () {

            return this.TodayAppointments;
        },
         /**
        *@ngdoc method
        *@name getFutureAppointments
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} FutureAppointments 
        *@description Returns array of future appointments.
        **/
        getFutureAppointments: function () {
            return this.FutureAppointments;
        },
          /**
        *@ngdoc method
        *@name getPastAppointments
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} PastAppointments 
        *@description Returns array of past appointments.
        **/
        getPastAppointments: function () {
            return this.PastAppointments;
        },
        getNextAppointment:function(){
            return this.NextAppointment;
        },
         /**
        }
        *@ngdoc method
        *@name getUserCalendar
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Object} calendar
        *@description Returns the calendar object.
        **/
        getUserCalendar:function(){
            return this.calendar;
        },
        setChangeRequest:function(index,value){
            var appointments=this.UserAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                if(appointments.AppointmentSerNum==index){
                    this.UserAppointmentsArray[i].ChangeRequest=value;
                }
            }
        },
        checkAndAddAppointmentsToCalendar:function(){
            var appointments=this.UserAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                var startDate=appointments[i].ScheduledStartTime;
                var endDate = appointments[i].ScheduledEndTime;
                var title=appointments[i].AppointmentType;
                var location=appointments[i].Location;
                var notes='Source: ' +appointments[i].ResourceName;
                var eventToCalendar={};
                eventToCalendar={
                    title: title,
                    location: location,
                    notes: notes,
                    startDate: startDate,
                    endDate: endDate,
                    AppointmentSerNum:appointments[i].AppointmentSerNum
                    };
                findAppointmentInNativeCalendar(eventToCalendar).then(function(success){
                    console.log('Found events in Calendar');
                },function(app){
                    eventToNative={};
                    eventToNative.title=app.title;
                    eventToNative.location=app.location;
                    eventToNative.notes=app.notes;
                    eventToNative.startDate=app.startDate;
                    eventToNative.endDate=app.endDate;
                    console.log('Did not find the event, procceding to adding event');
                    addEventToNativeCalendar(app);
                    $cordovaCalendar.createEvent(eventToNative).then(function (result) {
                        console.log('appointment added');
                    }, function (err) {
                         navigator.notification.alert(
                            'An error occured while adding your appointments',  // message
                            alertDismissed,         // callback
                            'Error',            // title
                            'OK'                  // buttonName
                        );
                });
                });
                

            }

        }
    };
}]);
        
   