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
        appointments.forEach(appointment => {
            appointment.ScheduledStartTime = $filter('formatDate')(appointment.ScheduledStartTime);
            appointment.ScheduledEndTime =  $filter('formatDate')(appointment.ScheduledEndTime);
            appointment.LastUpdated =  $filter('formatDate')(appointment.LastUpdated);
            userAppointmentsArray.push(appointment);
        });

        LocalStorage.WriteToLocalStorage('Appointments',userAppointmentsArray);

        //Sort Appointments chronologically most recent first
        userAppointmentsArray = $filter('orderBy')(userAppointmentsArray, 'ScheduledStartTime', false);
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
            console.log(userAppointmentsArray);
            return userAppointmentsArray;
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
                    apt.Checkin = 1;
                }
                return apt
            })
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

        /**
         *@ngdoc method
         *@name clearAppointments
         *@methodOf MUHCApp.service:Appointments
         *@description Cleans all the Appointments service state and reinstantiates.
         **/
        clearAppointments:function()
        {
            userAppointmentsArray = [];
        },
    };
}]);
