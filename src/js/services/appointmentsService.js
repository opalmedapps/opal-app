/*
 * Filename     :   appointmentsService.js
 * Description  :   
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */
 
var myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:Appointments
 *@requires $filter
 *@requires MUHCApp.service:RequestToServer
 *@requires MUHCApp.service:LocalStorage
 *@requires MUHCApp.service:User
 *@requires MUHCApp.service:UserPreferences
 *@description Sets the appointments and provides an API to access them
 **/

myApp.service('Appointments', ['$filter','LocalStorage','RequestToServer','UserPreferences', 'User',
    function ($filter, LocalStorage, RequestToServer, UserPreferences, User) {

    /**
     *@ngdoc property
     *@name  MUHCApp.service.#userAppointmentsArray
     *@propertyOf MUHCApp.service:Appointments
     *@description Array that contains all user appointments organized chronologically from most recent to least recent.
     **/
    var userAppointmentsArray = [];
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#treatmentSessionsObject
     *@propertyOf MUHCApp.service:Appointments
     *@description Object that contains three properties, all treatment sessions, the current treatment session, and step in treatment session.
     **/
    var treatmentSessionsObject = {};

    var firstLoad = true;

    var calendar={};
    var numberOfSessions=0;
    function searchAppointmentsAndDelete(appointments)
    {
        //
        //
        for (var i = 0; i < appointments.length; i++) {
            for (var j = 0; j < userAppointmentsArray.length; j++) {
                if(userAppointmentsArray[j].AppointmentSerNum==appointments[i].AppointmentSerNum)
                {
                    userAppointmentsArray.splice(j,1);
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
        let year = -1;
        let month = -1;
        let day = -1;
        calendar = {};
        let calendarYear = {};
        let calendarMonth = {};
        //Loop goes through all the appointments in the sorted array of appointments, remember this only works if ap
        //appointments are already sorted
        for (let i = 0; i < appointments.length; i++) {

            //Gets year, month and day for appointment
            let tmpYear = appointments[i].ScheduledStartTime?.getFullYear();
            let tmpMonth = appointments[i].ScheduledStartTime?.getMonth() + 1;
            let tmpDay = appointments[i].ScheduledStartTime?.getDate();

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
        const todayTime = (new Date()).getTime();
        let min = todayAppointments[0];
        let minDifference = Infinity;
        for (let i = 1; i < todayAppointments.length; i++) {
            const difference = Math.abs((todayAppointments[i].ScheduledStartTime).getTime() - todayTime);
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
            return todayAppointments;
        }else{
            return [];
        }
    }

    function getAppointmentsInPeriod(period)
    {
        //Variables for comparing dates
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth();
        const year = today.getFullYear();
        const time = today.getTime();

        //If sorting=false then latest appointment will be last, else it will be first
        const sorting = period == 'Past';
        let array=[];

        userAppointmentsArray.forEach(appointment => {
            const date = appointment.ScheduledStartTime;
            //If appointment is the same date add it to the array
            if(period == 'Today' && date.getDate() == day && date.getFullYear() == year && date.getMonth() == month)
            {
                array.push(appointment);
                //If appointment is in the future add it to the array
            }else if (period == 'Future' && time < date.getTime())
            {
                array.push(appointment);
                //ditto
            }else if( period == 'Past' && date.getTime() <= time){
                array.push(appointment);
            }
        });

        //Sort it correctly for each case
        array = $filter('orderBy')(array, 'ScheduledStartTime',sorting);
        return array;
    }

    function addAppointmentsToService(appointments)
    {


        if (appointments === undefined) return;

        //Format date to javascript date
        numberOfSessions=0;
        
        appointments.forEach(appointment => {
            appointment.ScheduledStartTime = $filter('formatDate')(appointment.ScheduledStartTime);
            appointment.ScheduledEndTime =  $filter('formatDate')(appointment.ScheduledEndTime);
            appointment.LastUpdated =  $filter('formatDate')(appointment.LastUpdated);
            userAppointmentsArray.push(appointment);
        });

        LocalStorage.WriteToLocalStorage('Appointments',userAppointmentsArray);

        //Sort Appointments chronologically most recent first
        userAppointmentsArray = $filter('orderBy')(userAppointmentsArray, 'ScheduledStartTime', false);
        //Extracts treatment session appointments
        treatmentSessionsObject = setTreatmentSessions(userAppointmentsArray);
        //Sets the calendar for easy extraction in the calendar view
        setCalendar(userAppointmentsArray);
    }

    function setTreatmentSessions()
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
    return {
        /**
         *@ngdoc method
         *@name setUserAppoinments
         *@methodOf MUHCApp.service:Appointments
         *@param {Array} appointments Appointments array obtain from Firebase
         *@description Function is called from the {@link MUHCApp.services:UpdateUI}. The function is an initializer for the service, it sets all the properties for the appointment list and calendar used in
         the {@link MUHCApp.controller:ScheduleController ScheduleController}.
         **/
        setUserAppointments: function (appointments) {
            //Initializing Variables
            userAppointmentsArray = [];
            calendar={};
            addAppointmentsToService(appointments);
        },
        /**
         *@ngdoc method
         *@name setCheckinAppointments
         *@methodOf MUHCApp.service:Appointments
         *@param {Array} appointments Appointments array obtain from Firebase
         *@description Function is called from the {@link MUHCApp.services:UpdateUI}. The function is an initializer for the service, it sets all the properties for the checkin used.
         **/
        setCheckinAppointments: function (appointments) {
            //Initializing Variables
            userAppointmentsArray = [];
            const selfPatientSerNum = User.getSelfPatientSerNum();
            if (!appointments) return;
            appointments.forEach(appointment => {
                let patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}'s appointments`;
                if ((UserPreferences.getLanguage()=='FR')) {
                    patientName = `Rendez-vous pour ${appointment.patient.first_name} ${appointment.patient.last_name}`;
                }
                if (selfPatientSerNum && appointment.patient.patientsernum === selfPatientSerNum) {
                    patientName = (UserPreferences.getLanguage()=='EN') ? 'Your appointments' : 'Vos rendez-vous';
                }

                let checkinStatus = appointment.checkin == 1 ? 'success' : 'info';
                checkinStatus = appointment.checkinpossible == 0 && checkinStatus ? 'warning' : checkinStatus;
                const localAppointment = {
                    AppointmentSerNum: appointment.appointmentsernum,
                    Checkin: appointment.checkin,
                    CheckinPossible: appointment.checkinpossible,
                    CheckinInstruction_EN: appointment.checkininstruction_en,
                    CheckinInstruction_FR: appointment.checkininstruction_fr,
                    PatientSerNum: appointment.patient.patientsernum,
                    ScheduledStartTime: $filter('formatDate')(appointment.scheduledstarttime),
                    ScheduledEndTime: $filter('formatDate')(appointment.scheduledendtime),
                    LastUpdated: $filter('formatDate')(appointment.lastupdated),
                    State: appointment.state,
                    RoomLocation_EN: appointment.roomlocation_en,
                    RoomLocation_FR: appointment.roomlocation_fr,
                    AppointmentType_EN: appointment.alias.aliasname_en,
                    AppointmentType_FR: appointment.alias.aliasname_fr,
                    MapUrl_EN: appointment.hospitalmap?.mapurl_en,
                    MapUrl_FR: appointment.hospitalmap?.mapurl_fr,
                    MapName_EN: appointment.hospitalmap?.mapname_en,
                    MapName_FR: appointment.hospitalmap?.mapname_fr,
                    MapDescription_EN: appointment.hospitalmap?.mapdescription_en,
                    MapDescription_FR: appointment.hospitalmap?.mapdescription_fr,
                    ResourceDescription: (UserPreferences.getLanguage()=='EN') ? appointment.alias.aliasname_en:appointment.alias.aliasname_fr,
                    patientName: patientName,
                    CheckInStatus: checkinStatus,
                }
                userAppointmentsArray.push(localAppointment);
            });

            //Sort Appointments chronologically most recent first
            userAppointmentsArray = $filter('orderBy')(userAppointmentsArray, 'ScheduledStartTime', false);
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
         *@name nextAppointmentExists
         *@methodOf MUHCApp.service:Appointments
         *@param {Object} appointments Appointments array that containts the new appointments
         *@returns {Boolean} Returns whether there is a next appointment for the user
         **/
        nextAppointmentExists:function(){
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
         *@name appointmentsExist
         *@methodOf MUHCApp.service:Appointments
         *@param {Object} appointments Appointments array that containts the new appointments
         *@returns {Boolean} Returns whether the user has any appointments
         **/
        appointmentsExist:function()
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
         *@returns {Object} Returns appointment object that matches the AppointmentSerNum parameter
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

        updateCheckedInAppointments: function(appts){
            appts = appts.map(function(apt){
                return apt.AppointmentSerNum
            });

            userAppointmentsArray = userAppointmentsArray.map(function(apt) {
                if(appts.includes(apt.AppointmentSerNum)) {

                    // console.log("updating appointment", apt);

                    apt.Checkin = 1;
                }
                return apt
            })
        },
        /**
         *@ngdoc method
         *@name getFutureAppointments
         *@methodOf MUHCApp.service:Appointments
         *@returns {Array} Returns the future appointments for the patient
         **/
        getFutureAppointments: function () {
            return getAppointmentsInPeriod('Future');
        },
        /**
         *@ngdoc method
         *@name getPastAppointments
         *@methodOf MUHCApp.service:Appointments
         *@returns {Array} Returns the past appointments for the patient
         **/
        getPastAppointments: function () {
            return getAppointmentsInPeriod('Past');
        },
        /**
         *@ngdoc method
         *@name setAppointmentCheckin
         *@methodOf MUHCApp.service:Appointments
         *@param {string} serNum AppointmentSerNum
         *@description Sets the checkin to 1 for a particular appointments making sure fields are synced
         **/
        setAppointmentCheckin:function(serNum){
            var appointments=userAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                if(appointments[i].AppointmentSerNum==serNum){
                    userAppointmentsArray[i].Checkin='1';
                    LocalStorage.WriteToLocalStorage('Appointments',userAppointmentsArray);
                    break;
                }
            }
        },
        /**
         *@ngdoc method
         *@name getLastAppointmentCompleted
         *@methodOf MUHCApp.service:Appointments
         *@returns {Object} Returns last completed appointment object
         **/
        getLastAppointmentCompleted:function(){
            var pastApp= getAppointmentsInPeriod('Past');
            if(pastApp.length === 0) return -1;
            return pastApp[0];
        },
        /**
         *@ngdoc method
         *@name getUpcomingAppointment
         *@methodOf MUHCApp.service:Appointments
         *@param {string} serNum AppointmentSerNum
         *@returns {Object} Returns upcoming appointment object
         **/
        getUpcomingAppointment:function()
        {
            var FutureAppointments=getAppointmentsInPeriod('Future');
            if(FutureAppointments.length ===0) return -1;
            return FutureAppointments[0];
        },
        /**
         *@ngdoc method
         *@name getUserCalendar
         *@methodOf MUHCApp.service:Appointments
         *@param {string} serNum AppointmentSerNum
         *@returns {Object} Returns object containing the calendar representation for appointments i.e. {'2015':'May':{[AppointmentObject]}}
         **/
        getUserCalendar:function(){
            return calendar;
        },
        /**
         *@ngdoc method
         *@name getCheckinAppointment
         *@methodOf MUHCApp.service:Appointments
         *@param {string} serNum AppointmentSerNum
         *@returns {Object} Returns object containing checkin appointment
         **/
        getCheckinAppointment:function()
        {
            return getCheckinAppointment();
        },

        getCheckinAppointments:function(){

        },
        /**
         *@ngdoc method
         *@name setCheckinAppointmentAsClosed
         *@methodOf MUHCApp.service:Appointments
         *@param {string} serNum AppointmentSerNum
         *@description Sets the appointment as closed so that if a next the app shows the appropiate user appointment
         **/
        setCheckinAppointmentAsClosed:function(serNum)
        {
            for (var i = 0; i < userAppointmentsArray.length; i++)
            {
                if(userAppointmentsArray[i].AppointmentSerNum == serNum)
                {
                    userAppointmentsArray[i].StatusClose = true;
                }
                LocalStorage.WriteToLocalStorage('Appointments', userAppointmentsArray);
            }
        },
        /**
         *@ngdoc method
         *@name isCheckinAppointment
         *@methodOf MUHCApp.service:Appointments
         *@param {Object} appointment Appointment object
         *@returns {Boolean} Returns whether an appointment is the checkin appointment
         **/
        isCheckinAppointment:function(appointment)
        {
            var checkInAppointment = getCheckinAppointment();
            if(checkInAppointment)
            {
                for (app in checkInAppointment) {
                    if (checkInAppointment[app].AppointmentSerNum == appointment.AppointmentSerNum) {
                        return true;
                    }
                }
                return false;
            }else{
                return false;
            }

        },

        /**
         *@ngdoc method
         *@name readAppointmentBySerNum
         *@methodOf MUHCApp.service:Appointments
         *@param {Object} serNum AppointmentSerNum
         *@description Sets ReadStatus to 1 to all the states of data. i.e. database, device, and device storage.
         **/
        readAppointmentBySerNum:function(serNum)
        {
            for (var i = 0; i < userAppointmentsArray.length; i++) {
                if(userAppointmentsArray[i].AppointmentSerNum == serNum)
                {
                    userAppointmentsArray[i].ReadStatus = '1';
                    RequestToServer.sendRequest('Read',{"Id":serNum, "Field": "Appointments"});
                    LocalStorage.WriteToLocalStorage('Appointments', userAppointmentsArray);
                }
            }
        },
        /**
         *@ngdoc method
         *@name getAppointmentUrl
         *@methodOf MUHCApp.service:Appointments
         *@param {Object} serNum AppointmentSerNum
         *@description The function returns a url that the Notifications service uses to identify the page to send a certain notification
         *@returns {Promise} Returns the url correspoding to the page for individual-appointments
         **/
        getAppointmentUrl:function(serNum)
        {
            return './views/personal/appointments/individual-appointment.html';
        },
        //Getting radiotherapy treatment appointments
        /**
         *@ngdoc method
         *@name getTreatmentAppointments
         *@methodOf MUHCApp.service:Appointments
         *@description The function checks that the treatment appointments are still in the valid range, if not it reinstantiates the object to add the right treatment sessions.
         *@returns {String} Returns all the treatment appointments
         **/
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
        isThereNextTreatment:function(){
            return !angular.equals({}, treatmentSessionsObject.CurrentAppointment.Appointment);
        },

        /**
         *@ngdoc method
         *@name clearAppointments
         *@methodOf MUHCApp.service:Appointments
         *@description Cleans all the Appointments service state and reinstantiates.
         **/
        clearAppointments:function()
        {
            userAppointmentsArray = [];
            treatmentSessionsObject = {};
            calendar={};
            numberOfSessions=0;
        },

        getRecentCalledAppointment: function () {
            var todaysAppointments = [];
            todaysAppointments = getAppointmentsInPeriod('Today');

            var now=new Date();


            // Calculate difference between now and all todays appointments that are checked in, have a room and not completed
            var timeDiff = todaysAppointments.map(function (obj) {
                if (obj.Checkin == '1' && obj.RoomLocation_EN && obj.Status.toLowerCase().indexOf('completed') == -1) {
                    return Math.abs(now - obj.LastUpdated);
                } else {
                    return Infinity;
                }
            });

            // Find the min difference, this is the one you are called to.
            var lowest = 0;
            for (var i = 1; i < timeDiff.length; i++) {
                if (timeDiff[i] < timeDiff[lowest]) lowest = i;
            }

            // Check if all array elements are the same.
            if (!!timeDiff.reduce(function(a, b){ return (a === b) ? a : NaN; })){
                return {RoomLocation_EN: ""};
            }



            return todaysAppointments[lowest];
        },

        setAsLoaded: function() {
            firstLoad = false;
        },

        isFirstLoad: function() {
            return firstLoad

        }

    };
}]);
