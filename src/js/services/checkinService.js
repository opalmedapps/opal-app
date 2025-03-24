/*
 * Filename     :   checkinService.js
 * Description  :   service that manages patient checkin
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 *@name MUHCApp.service:CheckinService
 *@requires MUHCApp.service:RequestToServer
 *@requires MUHCApp.service:Appointments
 *@requires $q
 *@description Service that deals with the checkin functionality for the app
 **/

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('CheckInService', CheckInService);

    CheckInService.$inject = ['$q', 'Appointments', 'Hospital', 'Location', 'Params', 'Patient', 'RequestToServer', 'UserHospitalPreferences'];

    /* @ngInject */
    function CheckInService($q, Appointments, Hospital, Location, Params, Patient, RequestToServer, UserHospitalPreferences) {

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#allCheckedIn
         *@propertyOf MUHCApp.service:CheckinService
         *@description Determines whether all of appointments are checked in or not
         */
        var allCheckedIn = false;

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#attemptedCheckin
         *@propertyOf MUHCApp.service:CheckinService
         *@description Determines whether the patient has attempted checking in or not
         */
        var attemptedCheckin = false;

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#state
         *@propertyOf MUHCApp.service:CheckinService
         *@description Determines the current state of checkin for a given patient
         */
        var state = {
            message: '',
            canNavigate: false,
            numberOfAppts: 0,
            checkinError: false,
            noAppointments: false,
            allCheckedIn: false,
            inRange: true
        };

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#checkinStateSet
         *@propertyOf MUHCApp.service:CheckinService
         *@description Determines whether the checkin state has been set, used for future reference
         */
        var checkinStateSet = false;

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#stateUpdated
         *@propertyOf MUHCApp.service:CheckinService
         *@description Determines whether or not the checkin state has been updated since initial setting
         */
        var stateUpdated = false;

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#errorsExist
         *@propertyOf MUHCApp.service:CheckinService
         *@description Determines whether checkin errors currently exist
         */
        var errorsExist = false;


        ///////////////////////////////////////////

        return {
            attemptCheckin: attemptCheckin,
            evaluateCheckinState: evaluateCheckinState,
            getCheckInApps: getCheckInApps,
            clear: clear,
        };

        ////////////////////////////////////////////

        async function attemptCheckin(){
            if (attemptedCheckin && allCheckedIn) return 'SUCCESS';
            if (attemptedCheckin && errorsExist) return 'ERROR';

            const isAllowed = await isWithinCheckinRange();
            if (!isAllowed) return 'NOT_ALLOWED';

            const checkinResult = await checkinToAllAppointments();
            attemptedCheckin = true;
            updateCheckinState(checkinResult.appts);
            return checkinResult.status;
        }

        function evaluateCheckinState(){
            var r = $q.defer();

            if(attemptedCheckin || checkinStateSet && !stateUpdated){
                r.resolve(state);
            } else {
                initCheckinState()
                    .then(function(){
                        checkinStateSet = true;
                        r.resolve(state);
                    })
                    .catch(function(err){
                        r.resolve(err);
                    })
            }
            return r.promise;
        }

        function initCheckinState(){
            var r = $q.defer();

            var appts = Appointments.getTodaysAppointments();

            //First evaluate the current state of existing appointments, see if they were already checked in and if so what the state is (all success or some errors)
            if(appts.length === 0){
                setCheckinState("CHECKIN_NONE");
                r.resolve()
            } else if(alreadyCheckedIn(appts)){
                setCheckinState("CHECKIN_MESSAGE_AFTER" + setPlural(appts));
                r.resolve()
            } else if (checkinErrorsExist(appts)) {
                setCheckinState("CHECKIN_ERROR");
                r.resolve()
            } else {
                //This means at this point there exists appointments today and none of them have been checked in
                isWithinCheckinRange()
                    .then(function(canCheckin){

                        // console.log("can checkin : " + canCheckin);

                        if(!canCheckin) {
                            setCheckinState("NOT_ALLOWED", appts.length);
                        }
                        else {
                            setCheckinState("CHECKIN_MESSAGE_BEFORE" + setPlural(appts), appts.length);
                        }
                        r.resolve()
                    })
                    .catch(function() {
                        setCheckinState("NOT_ALLOWED", appts.length);
                        r.reject()
                    })
            }
            return r.promise
        }

        function updateCheckinState(checkedInAppts){

            if(checkedInAppts && checkedInAppts.length > 0) Appointments.updateCheckedInAppointments(checkedInAppts);
            var appts = Appointments.getTodaysAppointments();

            //First evaluate the current state of existing appointments, see if they were already checked in and if so what the state is (all success or some errors)
            if(alreadyCheckedIn(appts)){
                setCheckinState("CHECKIN_MESSAGE_AFTER" + setPlural(appts));
            } else if (checkinErrorsExist(appts)) {
                setCheckinState("CHECKIN_ERROR");
            } else {
                setCheckinState("NOT_ALLOWED", appts.length);
            }
        }

        function alreadyCheckedIn(appts){

            allCheckedIn = true;
            // Appointment.Checkin === '1'  means Checked-in
            // Appointment.Checkin === '0'  means NOT Checked-in
            // Appointment.Checkin === '-1' means ERROR

            appts.map(function(app){
                if(app.Checkin === '0') allCheckedIn = false;
            });

            return allCheckedIn;
        }

        // Appointment.Checkin === '1'  means Checked-in
        // Appointment.Checkin === '0'  means NOT Checked-in
        // Appointment.Checkin === '-1' means ERROR
        function checkinErrorsExist(appts){
            var checkinExists = false;

            appts.map(function(app){
                if(app.Checkin === '1') checkinExists = true;
            });

            if(!checkinExists) return false;

            var errors = false;

            appts.map(function(app){
                if(app.Checkin === '-1') errors = true;
            });

            return errors;
        }

        function setPlural(apps) {
            if (apps.length > 1) {
                return "_PLURAL";
            }
            return "";
        }

        function setCheckinState(status, numAppts){

            state.message = status;

            switch(status){
                case "CHECKIN_ERROR":
                    attemptedCheckin = true;
                    errorsExist = true;
                    state.canNavigate = true;
                    state.numberOfAppts = 0;
                    state.checkinError = true;
                    state.noAppointments = false;
                    state.allCheckedIn = false;
                    break;
                case "CHECKIN_MESSAGE_AFTER":
                case "CHECKIN_MESSAGE_AFTER_PLURAL":
                    attemptedCheckin = true;
                    allCheckedIn = true;
                    state.canNavigate = true;
                    state.numberOfAppts = 0;
                    state.checkinError = false;
                    state.noAppointments = false;
                    state.allCheckedIn = true;
                    break;
                case "CHECKIN_NONE":
                    state.canNavigate = false;
                    state.numberOfAppts = 0;
                    state.checkinError = false;
                    state.noAppointments = true;
                    state.allCheckedIn = false;
                    break;
                case "CHECKIN_MESSAGE_BEFORE":
                case "CHECKIN_MESSAGE_BEFORE_PLURAL":
                    state.canNavigate = true;
                    state.numberOfAppts = numAppts;
                    state.checkinError = false;
                    state.noAppointments = false;
                    state.allCheckedIn = false;
                    break;
                case "NOT_ALLOWED":
                    state.canNavigate = false;
                    state.numberOfAppts = numAppts;
                    state.checkinError = false;
                    state.noAppointments = false;
                    state.allCheckedIn = false;
                    state.inRange = false;
                    break;
            }
        }

        /**
         *@ngdoc method
         *@name getCheckInApps
         *@methodOf MUHCApp.service:CheckinService
         *@description Gets today's appointments that are able to be checked into
         *@returns {Array} Todays checkinable appointments
         */
        function getCheckInApps() {
            return Appointments.getTodaysAppointments();
        }

        /**
         * @desc Uses device GPS functionality to determine whether the user is in range to check in.
         *       The user is in range if their device is within a maximum radius of any of the sites linked to
         *       the current institution.
         * @author Stacey Beard
         * @date 2022-12-08
         * @returns {Promise<boolean>} Resolves to true if the user is in range, false if they aren't,
         *                             or throws an error if there is no site information or if the device can't be
         *                             geolocated.
         */
        async function isWithinCheckinRange() {
            // Get the list of sites and their coordinates from the backend
            const response = await Hospital.requestSiteInfo(UserHospitalPreferences.getHospital());
            if (response.count === '0') throw new Error("No sites are defined for this institution");
            const sites = response.results;

            // To be in range, the user must be close enough to at least one of the available hospital sites
            let results = await Promise.allSettled(
                sites.map(site => Location.isInRange(site.latitude, site.longitude, Params.checkinRadiusMeters))
            );

            // If any promise rejected, throw a new error, otherwise, return true if at least one site is in range
            if (results.some(result => result.status === 'rejected')) {
                console.error('Geolocation error', results);
                throw new Error("Failed to get geolocation information for check-in");
            }
            return results.some(result => result.value === true);
        }

        /**
         *@ngdoc method
         *@name checkinToAllAppointments
         *@methodOf MUHCApp.service:CheckinService
         *@description Checks the users in to all todays appointments.
         *@returns {Promise} Returns a promise containing the CheckedIn boolean and the AppointmentSerNum.
         **/
        function checkinToAllAppointments(){

            //Create a promise so this can be run asynchronously
            var r = $q.defer();

            var objectToSend = {};
            objectToSend.PatientSerNum = Patient.getPatientSerNum();

            RequestToServer.sendRequestWithResponse('Checkin', objectToSend)
                .then(function (response) { r.resolve({status: 'SUCCESS', appts: response.Data});})
                .catch(function () { r.reject({status: 'ERROR', appts: null}); });

            return r.promise;
        }

        function clear() {
            allCheckedIn= false;
            attemptedCheckin = false;
            checkinStateSet = false;
        }
    }
})();
