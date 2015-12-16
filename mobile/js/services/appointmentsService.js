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
myApp.service('Appointments', ['$q', 'RequestToServer','$cordovaCalendar','UserAuthorizationInfo', '$filter', 'UserPreferences',function ($q,RequestToServer, $cordovaCalendar, UserAuthorizationInfo, $filter,UserPreferences) {
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
      function findAppointmentIndexInArray(array, serNum)
      {
        for (var i = 0; i < array.length; i++) {
          if(array[i].AppointmentSerNum==serNum)
          {
            return i;
          }
        }
        return -1;

      }
      function manageAppointmentsInNativeCalendar(appointments,index)
      {
        //var appointments=this.UserAppointmentsArray;
        var indexValue=index;
        var r=$q.defer();
        var today=new Date();
        if(index===appointments.length||typeof index=='undefined')
        {
          r.resolve('Done adding all appointments');
        }else{
          var startDate=appointments[indexValue].ScheduledStartTime;
          console.log(appointments[indexValue]);
          if(today<startDate)
          {
            var eventToCalendar={};
            var tmp=new Date(appointments[indexValue].ScheduledStartTime);
            var endDate = tmp.setHours(startDate.getHours()+1);
            eventToCalendar.startDate=startDate;
            eventToCalendar.endDate=endDate;
            (UserPreferences.getLanguage()=='EN')?eventToCalendar.title=appointments[indexValue].AppointmentType_EN:eventToCalendar.title=appointments[indexValue].AppointmentType_FR;
            eventToCalendar.location=appointments[index].Location;
            eventToCalendar.notes='Source: ' +appointments[indexValue].ResourceName;
            if(isAppointmentInNativeCalendar(appointments[indexValue].AppointmentSerNum))
            {
              console.log('Found event in Calendar');
              var newIndex=indexValue+1;
              r.resolve(manageAppointmentsInNativeCalendar(appointments,newIndex));
            }else{
              $cordovaCalendar.createEvent(eventToCalendar).then(function (result) {
                  addEventToNativeCalendar(appointments[indexValue].AppointmentSerNum);
                  var newIndex=indexValue+1;
                  r.resolve(manageAppointmentsInNativeCalendar(appointments,newIndex));
              }, function (err) {
                  console.log(err);
                   navigator.notification.alert(
                      'An error occured while adding your appointments',  // message
                      function(error){
                        console.log(error);
                      },         // callback
                      'Error',            // title
                      'OK'                  // buttonName
                  );
                  var newIndex=indexValue+1;
                  r.resolve(manageAppointmentsInNativeCalendar(appointments,newIndex));
              });
            }

          }else{
            var newIndex=indexValue+1;
            r.resolve(manageAppointmentsInNativeCalendar(appointments,newIndex));
          }
        }
        return r.promise;
      }
        function isAppointmentInNativeCalendar(serNum)
        {
            var appointmentsString=window.localStorage.getItem('NativeCalendarAppoinments');
            if(!appointmentsString){
                return false;
            }else{
                console.log(appointmentsString);
                appointmentsObject=JSON.parse(appointmentsString);
                var appointmentList=appointmentsObject.AppointmentList;
                for(var i=0;i<appointmentList.length;i++){
                     if(appointmentList[i]===serNum){
                        return true;
                     }
                }
                return false;
            }
        }
        function addEventToNativeCalendar(serNum){
            var appointmentsString=window.localStorage.getItem('NativeCalendarAppoinments');
            if(appointmentsString){
                appointmentsObject=JSON.parse(appointmentsString);
                appointmentsObject.AppointmentList.push(serNum);
                appointmentString=JSON.stringify(appointmentsObject);
                window.localStorage.setItem('NativeCalendarAppoinments',appointmentString);
            }else{
                objectToLocalStorage={};
                objectToLocalStorage.AppointmentList=[serNum];
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
                var index=-1;
                var numberOfSessions=0;
                for (var i = 0; i < keysArray.length; i++) {
                    appointments[keysArray[i]].ScheduledStartTime = $filter('formatDate')(appointments[keysArray[i]].ScheduledStartTime);
                    appointments[keysArray[i]].ScheduledEndTime =  $filter('formatDate')(appointments[keysArray[i]].ScheduledEndTime);
                    this.UserAppointmentsArray[i] = appointments[keysArray[i]];
                    if(appointments[keysArray[i]].AppointmentType_EN=='Daily Radiotherapy Treatment Session'||appointments[keysArray[i]].AppointmentType_EN=='First Radiotherapy Treatment Session'||appointments[keysArray[i]].AppointmentType_EN=='Final Radiotherapy Treatment Session')
                    {
                      numberOfSessions++;
                    }

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
                    var dateDiff = this.UserAppointmentsArray[i].ScheduledStartTime-today;
                    if (dateDiff > 0) {
                        //Choosing the next appointment
                         if(dateDiff<min){
                            this.NextAppointment.Object=this.UserAppointmentsArray[i];
                            this.NextAppointment.Index=i;
                            index=i;
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

                var sessionNumber = 1;
                for (var i = 0; i < this.UserAppointmentsArray.length; i++) {
                  if(this.UserAppointmentsArray[i].AppointmentType_EN=='Daily Radiotherapy Treatment Session'||this.UserAppointmentsArray[i].AppointmentType_EN=='Final Radiotherapy Treatment Session'||this.UserAppointmentsArray[i].AppointmentType_EN=='First Radiotherapy Treatment Session')
                  {
                    this.UserAppointmentsArray[i].sessionNumber="Session "+sessionNumber+ " of "+ numberOfSessions;
                    sessionNumber++;
                  }

                }
                console.log(this.UserAppointmentsArray);
                if(this.NextAppointment.hasOwnProperty('Index')){
                    for (var i = 0; i < keysArray.length; i++) {
                        if(this.NextAppointment.Object.AppointmentSerNum==this.UserAppointmentsArray[i].AppointmentSerNum)
                        {
                           this.NextAppointment.Index=i;
                        }


                    };
                }else{

                  this.NextAppointment.Object={};
                  this.NextAppointment.Index=-1;
                  console.log(this.NextAppointment.Object);
                }
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
        isThereNextAppointment:function(){
          if(this.FutureAppointments.length==0)
          {
            return false;
          }else{
            return true;
          }
        },
        isThereAppointments:function()
        {
          if(this.UserAppointmentsArray.length==0)
          {
            return false;
          }else{
            return true;
          }
        },
        getAppointmentBySerNum:function(serNum){
            for (var i = 0; i < this.UserAppointmentsArray.length; i++) {
                if(this.UserAppointmentsArray[i].AppointmentSerNum==serNum){
                    return this.UserAppointmentsArray[i];
                }
            };
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
        setAppointmentCheckin:function(serNum, val){
              var appointments=this.UserAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                if(appointments[i].AppointmentSerNum==serNum){
                    this.UserAppointmentsArray[i].Checkin=val;
                }
            }
        },
         /**
        }
        }
        *@ngdoc method
        *@name getUserCalendar
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Object} calendar
        *@description Returns the calendar object.
        **/
        getLastAppointmentCompleted:function(){
          if(this.PastAppointments.length==0) return -1;
          return this.PastAppointments[0];
        },
        getUpcomingAppointment:function()
        {
          if(this.FutureAppointments.length==0) return -1;
          return this.FutureAppointments[0];
        },
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
        checkinNextAppointment:function()
        {
          console.log()
          this.FutureAppointments[0].Checkin='1';
          var nextAppointmentSerNum=this.FutureAppointments[0].AppointmentSerNum;
          console.log(this.FutureAppointments[0].AppointmentSerNum);
          console.log(this.TodayAppointments);
          var index=findAppointmentIndexInArray(this.TodayAppointments, nextAppointmentSerNum);

          this.TodayAppointments[index].Checkin='1';
          this.UserAppointmentsArray[this.NextAppointment.Index].Checkin='1';

        },
        checkAndAddAppointmentsToCalendar:function(){
          var r=$q.defer();
          if(this.UserAppointmentsArray.length>0)
          {
            console.log(this.UserAppointmentsArray.length);
            manageAppointmentsInNativeCalendar(this.UserAppointmentsArray,0).then(
              function(app){
                r.resolve(app);
              });
          }else{
            r.resolve('No appointments');
          }
          return r.promise;
        }
    };
}]);
