var myApp=angular.module('MUHCApp',[]);
/**
*@ngdoc service
*@name MUHCApp.service:Appointments
*@requires $filter
*@requires MUHCApp.service:RequestToServer
*@requires $q
*@requires MUHCApp.service:UserAuthorizationInfo
*@requires $cordovaCalendar
*@description Sets the User appointment objects for the different views.
**/
myApp.service('Appointments', ['$q', 'RequestToServer','$cordovaCalendar','UserAuthorizationInfo', '$filter', 'UserPreferences','LocalStorage',function ($q,RequestToServer, $cordovaCalendar, UserAuthorizationInfo, $filter,UserPreferences,LocalStorage) {
    /**
    *@ngdoc property
    *@name  MUHCApp.service.#userAppointmentsArray
    *@propertyOf MUHCApp.service:Appointments
    *@description Array that contains all user appointments organized chronologically from most recent to least recent.
    **/
    var UserAppointmentsInNativeCalendar=[];
    var userAppointmentsArray = [];
    var treatmentSessionsObject = {};
    var appointmentsLocalStorage=[];
    
    var calendar={};
    var numberOfSessions=0;
    function searchAppointmentsAndDelete(appointments)
    {
      for (var i = 0; i < appointments.length; i++) {
        for (var j = 0; j < userAppointmentsArray.length; j++) {
           if(userAppointmentsArray[j].AppointmentSerNum==appointments[i].AppointmentSerNum)
           {
             userAppointmentsArray.splice(j,1);
             appointmentsLocalStorage.splice(j,1);
             break;
           }
        }

      }
    }
    /*
      * Setting User Calendar
      //This function takes the results from the sorted by date appointments and organizes them into an object with
        //hierarchical structure year->month->day->appointments for the day, the dayly appointments are arrays.
    */
    function setCalendar(appointments)
    {
      
      //Initializing local variables
      var year = -1;
      var month = -1;
      var day = -1;
      calendar = {};
      var calendarYear = {};
      var calendarMonth = {};
      //Loop goes through all the appointments in the sorted array of appointments, remember this only works if ap
      //appointments are already sorted
      for (var i = 0; i < appointments.length; i++) {

        //Gets year, month and day for appointment
        var tmpYear = (appointments[i].ScheduledStartTime).getFullYear();
        var tmpMonth = (appointments[i].ScheduledStartTime).getMonth() + 1;
        var tmpDay = (appointments[i].ScheduledStartTime).getDate();

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
                calendar[year] = {};
                calendar[year] = calendarYear;
                calendarYear = {};
                calendarMonth = {};
            }
            year = tmpYear;

        }

        //If statement just to defined objects and prevent exception in case certain day does not
        //have any appointments yet. It then adds to the calendaMonth object for that day the
        //appointment
        if (calendarMonth[tmpDay] === undefined) calendarMonth[tmpDay] = [];
        calendarMonth[tmpDay].push(appointments[i]);

      }
      //Last Month, of year
      calendarYear[month] = {};
      calendarYear[month] = calendarMonth;
      calendar[year] = {};
      calendar[year] = calendarYear;
    }
    function findClosestAppointmentForCheckin(todayAppointments)
    {
      var todayTime = (new Date()).getTime();
      var min = todayAppointments[0];
      var minDifference = Infinity;
      for (var i = 1; i < todayAppointments.length; i++) {
        var difference = Math.abs((todayAppointments[i].ScheduledStartTime).getTime() - todayTime);
        if(difference<minDifference)
        {
          minDifference = difference;
          min = todayAppointments[i];
        }
      }
      return min;
    }
    function getCheckinAppointment()
    {
      var todayAppointments = getAppointmentsInPeriod('Today');
      todayAppointments = todayAppointments.filter(function(appointment){
        return !appointment.hasOwnProperty('StatusClose');
      });
      if(todayAppointments.length >0)
      {
        return findClosestAppointmentForCheckin(todayAppointments);
      }else{
        return null;
      }
    }
    function getAppointmentsInPeriod(period)
    {
      //Variables for comparing dates
      var today=new Date();
      var day=today.getDate();
      var month=today.getMonth();
      var year=today.getFullYear();
      var time=today.getTime();
      var sorting=false;
      //If sorting=false then latest appointment will be last, else it will be first
      if(period=='Past') sorting=true;
      var array=[];
      for (var i = 0; i < userAppointmentsArray.length; i++) {
        var date=userAppointmentsArray[i].ScheduledStartTime;
        //If appointment is the same date add it to the array
          if(period=='Today'&&date.getDate() == day && date.getFullYear() == year && date.getMonth() == month)
          {
            array.push(userAppointmentsArray[i]);
            //If appointment is in the future add it to the array
          }else if(period=='Future'&&time<date.getTime())
          {
            array.push(userAppointmentsArray[i]);
          //ditto
          }else if(period=='Past'&&date.getTime()<=time){
            array.push(userAppointmentsArray[i]);
          }
      }
      //Sort it correctly for each case
      array=$filter('orderBy')(array, 'ScheduledStartTime',sorting);
      return array;
    }

    function addAppointmentsToService(appointments)
    {
      if (appointments === undefined) return;
      //Setting min date for upcoming appointment
      var min=Infinity;
      //Format date to javascript date
      var index=-1;
      numberOfSessions=0;
      appointmentsLocalStorage=appointmentsLocalStorage.concat(appointments);
      LocalStorage.WriteToLocalStorage('Appointments',appointmentsLocalStorage);
      // var today = new Date();
      // today.setDate(today.getDate()-10);
      for (var i = 0; i < appointments.length; i++) {
          appointments[i].ResourceName = (appointments[i].Resource.hasOwnProperty('Machine')) ? '':appointments[i].Resource.Doctor;
          appointments[i].ScheduledStartTime = $filter('formatDate')(appointments[i].ScheduledStartTime);
          //appointments[i].ScheduledStartTime = new Date(today);
          appointments[i].ScheduledEndTime =  $filter('formatDate')(appointments[i].ScheduledEndTime);
          // appointments[i].ScheduledEndTime  = new Date(today);
          // appointments[i].ScheduledEndTime.setMinutes(appointments[i].ScheduledEndTime.getMinutes()+15);
          // today.setDate(today.getDate()+1);
          userAppointmentsArray.push(appointments[i]);
      }
      //Sort Appointments chronologically most recent first
      userAppointmentsArray = $filter('orderBy')(userAppointmentsArray, 'ScheduledStartTime', false);
      //Extracts treatment session appointments
      treatmentSessionsObject = setTreatmentSessions(userAppointmentsArray);
      //Sets the calendar for easy extraction in the calendar view
      setCalendar(userAppointmentsArray);
    }
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
      function setTreatmentSessions(appointments)
      {
        var array = [];
          var number = 0;
          var completedBoolean = false;
          var currentAppointment = {};
          var Index = 0;
          var todayTime = (new Date()).getTime();
          for (var i = 0; i < userAppointmentsArray.length; i++) {
            if(userAppointmentsArray[i].AliasSerNum =='6'||userAppointmentsArray[i].AliasSerNum=='7'||userAppointmentsArray[i].AliasSerNum=='9')
            {
              number++;
              if(userAppointmentsArray[i].ScheduledStartTime.getTime() > todayTime)
              {
                  if(!completedBoolean)
                  {
                      userAppointmentsArray[i].TimeStatus = 'Next';
                      currentAppointment = userAppointmentsArray[i];
                      Index = number;
                      completedBoolean = true;
                  }else{
                    userAppointmentsArray[i].TimeStatus = 'Future';
                  }
              }else{
                userAppointmentsArray[i].TimeStatus = 'Past';
              }
              array.push(userAppointmentsArray[i]);
            }
          }
          return {Total: number, CurrentAppointment:{ Index: Index, Appointment: currentAppointment}, AppointmentList:array, Completed: !completedBoolean};
      }
      function manageAppointmentsInNativeCalendar(appointments,index)
      {
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
            eventToCalendar.title = (UserPreferences.getLanguage()=='EN')?appointments[indexValue].AppointmentType_EN:appointments[indexValue].AppointmentType_FR;
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
        *@methodOf MUHCApp.service:Appointments
        *@param {Object} appointments Appointment object obtain from Firebase
        *@description Function is called from the {@link MUHCApp.services:UpdateUI}. The function sets the userAppointmentsArray, TodayAppointments, FutureAppointments, PastAppointments for the Appointment List used in
        the {@link MUHCApp.controller:AppointmentListController AppointmentListController}, and calendar object used in the {@link MUHCApp.controller:CalendarController CalendarController}.
        **/
        setUserAppointments: function (appointments) {
        //Initializing Variables
            UserAppointmentsInNativeCalendar=[];
            userAppointmentsArray = [];
            appointmentsLocalStorage=[];
            calendar={};
            addAppointmentsToService(appointments);
        },
        /**
        *@ngdoc method
        *@name updateUserAppoinments
        *@methodOf MUHCApp.service:Appointments
        *@param {Object} appointments Appointments array that containts the new appointments
        *@description Updates the userAppointmentsArray by replacing or adding appointments to sync the model with the server
        **/
        updateUserAppointments:function(appointments)
        {
          searchAppointmentsAndDelete(appointments);
          addAppointmentsToService(appointments);
        },
          /**
        *@ngdoc method
        *@name getUserAppointments
        *@methodOf MUHCApp.service:Appointments
        *@returns {Boolean} Returns the userAppointmentsArray
        **/
        getUserAppointments: function () {

            return userAppointmentsArray;
        },
         /**
        *@ngdoc method
        *@name isThereNextAppointment
        *@methodOf MUHCApp.service:Appointments
        *@param {Object} appointments Appointments array that containts the new appointments
        *@returns {Boolean} Returns whether there is a next appointment for the user
        **/
        isThereNextAppointment:function(){
          var FutureAppointments=getAppointmentsInPeriod('Future');
          if(FutureAppointments.length===0)
          {
            return false;
          }else{
            return true;
          }
        },
         /**
        *@ngdoc method
        *@name isThereAppointments
        *@methodOf MUHCApp.service:Appointments
        *@param {Object} appointments Appointments array that containts the new appointments
        *@returns {Boolean} Returns whether the user has any appointments
        **/
        isThereAppointments:function()
        {
          if(userAppointmentsArray.length===0)
          {
            return false;
          }else{
            return true;
          }
        },
         /**
        *@ngdoc method
        *@name getAppointmentBySerNum
        *@methodOf MUHCApp.service:Appointments
        *@param {string} serNum AppointmentSerNum
        *@returns {Object} Returns whether object containing a matching appointment by using the AppointmentSerNum
        **/
        getAppointmentBySerNum:function(serNum){
            for (var i = 0; i < userAppointmentsArray.length; i++) {
                if(userAppointmentsArray[i].AppointmentSerNum==serNum){
                    return angular.copy(userAppointmentsArray[i]);
                }
            }
        },
          /**
        *@ngdoc method
        *@name getTodaysAppointments
        *@methodOf MUHCApp.service:Appointments
        *@param {string} serNum AppointmentSerNum
        *@returns {Array} Returns array of appointments for the day
        **/
        getTodaysAppointments: function () {
          return getAppointmentsInPeriod('Today');
        },
           /**
        *@ngdoc method
        *@name getFutureAppointments
        *@methodOf MUHCApp.service:Appointments
        *@param {string} serNum AppointmentSerNum
        *@returns {Object} Returns the future appointments for the patient
        **/
        getFutureAppointments: function () {
          return getAppointmentsInPeriod('Future');
        },
        /**
        *@ngdoc method
        *@name getAppointmentBySerNum
        *@methodOf MUHCApp.service:Appointments
        *@param {string} serNum AppointmentSerNum
        *@returns {Boolean} Returns whether object containing a matching appointment by using the AppointmentSerNum
        **/
        getPastAppointments: function () {
          return getAppointmentsInPeriod('Past');
        },
        /**
        *@ngdoc method
        *@name getAppointmentBySerNum
        *@methodOf MUHCApp.service:Appointments
        *@param {string} serNum AppointmentSerNum
        *@returns {Boolean} Returns whether object containing a matching appointment by using the AppointmentSerNum
        **/
        setAppointmentCheckin:function(serNum){
              var appointments=userAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                if(appointments[i].AppointmentSerNum==serNum){
                    userAppointmentsArray[i].Checkin='1';
                    appointmentsLocalStorage[i].Checkin = '1';
                    LocalStorage.WriteToLocalStorage('Appoinments',appointmentsLocalStorage);
                }
            }
        },
        /**
        *@ngdoc method
        *@name getAppointmentBySerNum
        *@methodOf MUHCApp.service:Appointments
        *@param {string} serNum AppointmentSerNum
        *@returns {Boolean} Returns whether object containing a matching appointment by using the AppointmentSerNum
        **/
        getLastAppointmentCompleted:function(){
          var pastApp= getAppointmentsInPeriod('Past');
          if(pastApp.length === 0) return -1;
          return pastApp[0];
        },
        /**
        *@ngdoc method
        *@name getAppointmentBySerNum
        *@methodOf MUHCApp.service:Appointments
        *@param {string} serNum AppointmentSerNum
        *@returns {Boolean} Returns whether object containing a matching appointment by using the AppointmentSerNum
        **/
        getUpcomingAppointment:function()
        {
          var FutureAppointments=getAppointmentsInPeriod('Future');
          if(FutureAppointments.length ===0) return -1;
          return FutureAppointments[0];
        },
           /**
        *@ngdoc method
        *@name getAppointmentBySerNum
        *@methodOf MUHCApp.service:Appointments
        *@param {string} serNum AppointmentSerNum
        *@returns {Boolean} Returns whether object containing a matching appointment by using the AppointmentSerNum
        **/
        getUserCalendar:function(){
            return calendar;
        },
        setChangeRequest:function(index,value){
            var appointments=userAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                if(appointments.AppointmentSerNum==index){
                    userAppointmentsArray[i].ChangeRequest=value;
                }
            }
        },
        getAppointmentsToday:function()
        {
           return getAppointmentsInPeriod('Today');
        },
        getCheckinAppointment:function()
        {
          return getCheckinAppointment();
        },
        setCheckinAppointmentAsClosed:function(serNum)
        {
          for (var i = 0; i < userAppointmentsArray.length; i++)
          {
            if(userAppointmentsArray[i].AppointmentSerNum == serNum)
            {
              userAppointmentsArray[i].StatusClose = true;
              appointmentsLocalStorage[i].StatusClose = true;
            }
            LocalStorage.WriteToLocalStorage('Appointments', appointmentsLocalStorage);
          }
        },
        isCheckinAppointment:function(appointment)
        {
          var checkInAppointment = getCheckinAppointment();
          if(checkInAppointment)
          {
            if(checkInAppointment.AppointmentSerNum == appointment.AppointmentSerNum)
            {
              return true;
            }else{
              return false;
            }
          }else{
            return false;
          }

        },
        getAppointmentName:function(serNum)
        {
          console.log(serNum);
          console.log(userAppointmentsArray);
          for (var i = 0; i < userAppointmentsArray.length; i++) {
            if(userAppointmentsArray[i].AppointmentSerNum == serNum)
            {
              console.log({NameEN:userAppointmentsArray[i].AppointmentType_EN, NameFR: userAppointmentsArray[i].AppointmentType_FR });
              return {NameEN:userAppointmentsArray[i].AppointmentType_EN, NameFR: userAppointmentsArray[i].AppointmentType_FR };
            }
          }
        },
        readAppointmentBySerNum:function(serNum)
        {
          for (var i = 0; i < userAppointmentsArray.length; i++) {
            if(userAppointmentsArray[i].AppointmentSerNum == serNum)
            {
              userAppointmentsArray[i].ReadStatus = '1';
              appointmentsLocalStorage[i].ReadStatus = '1';
              RequestToServer.sendRequest('Read',{"Id":serNum, "Field": "Appointments"});
              LocalStorage.WriteToLocalStorage('Appointments', appointmentsLocalStorage);
            }
          }
        },
        checkAndAddAppointmentsToCalendar:function(){
          var r=$q.defer();
          if(userAppointmentsArray.length>0)
          {
            console.log(userAppointmentsArray.length);
            manageAppointmentsInNativeCalendar(userAppointmentsArray,0).then(
              function(app){
                r.resolve(app);
              });
          }else{
            r.resolve('No appointments');
          }
          return r.promise;
        },
        getAppointmentUrl:function(serNum)
        {
          return './views/personal/appointments/individual-appointment.html';
        },
        //Getting radiotherapy treatment appointments
        getTreatmentAppointments:function()
        {
         if(treatmentSessionsObject.Total === 0||treatmentSessionsObject.Completed) return treatmentSessionsObject;
         var current = treatmentSessionsObject.CurrentAppointment.Appointment;
         if(current.ScheduledStartTime.getTime()<=(new Date()).getTime())
         {
           return setTreatmentSessions(userAppointmentsArray);
         }else{
           return treatmentSessionsObject;
         }
        },
        //Get number of unread news
        getNumberUnreadAppointments:function()
        {
          var array = [];
          var number = 0;
          for (var i = 0; i < userAppointmentsArray.length; i++) {
            if(userAppointmentsArray[i].ReadStatus == '0')
            {
              number++;
            }
          }
          return number;
        },
        //Input array or string sets the language of the appointments for controllers to use
        setAppointmentsLanguage:function(array)
        {
          var language = UserPreferences.getLanguage();
          //Check if array
          if (Object.prototype.toString.call( array ) === '[object Array]') {
            for (var i = 0; i < array.length; i++) {
              //set language
              if(!array[i].hasOwnProperty('Title')||!array[i].hasOwnProperty('Description')||!array[i].hasOwnProperty('ResourceName'))
              {
                if( array[i].Resource.hasOwnProperty('Machine')||Object.keys(array[i].Resource).length === 0)
                {
                  array[i].ResourceName = (language =='EN')? array[i].MapName_EN : array[i].MapName_FR;
                }else if(array[i].Resource.hasOwnProperty('Doctor')){
                  array[i].ResourceName = (language =='EN')? array[i].Resource.Doctor : array[i].Resource.Doctor;
                }else{
                  array[i].ResourceName = (language =='EN')? array[i].MapName_EN : array[i].MapName_FR;
                }
                array[i].Title = (language=='EN')? array[i].AppointmentType_EN : array[i].AppointmentType_FR;
                array[i].Description = (language == 'EN')? array[i].AppointmentDescription_EN : array[i].AppointmentDescription_FR;
              }
            }
          }else{
            //set language if string
            if(!array.hasOwnProperty('Title')||!array.hasOwnProperty('Description'))
            {
              array.Title = (language=='EN')? array.AppointmentType_EN : array.AppointmentType_FR;
              array.Description = (language == 'EN')? array.AppointmentDescription_EN: array.AppointmentDescription_FR;
            }
          }
          return array;
        },
        clearAppointments:function()
        {
           UserAppointmentsInNativeCalendar=[];
           userAppointmentsArray = [];
           treatmentSessionsObject = {};
           appointmentsLocalStorage=[];
           calendar={};
           numberOfSessions=0;
        }
    };
}]);
