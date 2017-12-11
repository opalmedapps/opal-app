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

    CheckInService.$inject = ['$q', 'RequestToServer', 'Appointments', 'Patient'];

    /* @ngInject */
    function CheckInService($q, RequestToServer, Appointments, Patient) {

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#positionCheckinAppointment
         *@propertyOf MUHCApp.service:CheckinService
         *@description Object contains the last GPS position used when the patient tried to checkin to an appointment
         */
        var positionCheckinAppointment = {};

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#checkinApps
         *@propertyOf MUHCApp.service:CheckinService
         *@description Array contains the appointments to check in to.
         */
        var checkinApps = [];

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

        var state = {
            message: '',
            canNavigate: false,
            numberOfAppts: 0,
            checkinError: false,
            noAppointments: false,
            allCheckedIn: false
        };

        var checkinStateSet = false;
        var stateUpdated = false;
        var errorsExist = false;


        ///////////////////////////////////////////

        return {
            attemptCheckin: attemptCheckin,
            evaluateCheckinState: evaluateCheckinState,
            getCheckInApps: getCheckInApps,
            clear: clear,
        };

        ////////////////////////////////////////////

        function attemptCheckin(){
            var r = $q.defer();

            if(attemptedCheckin && areAllCheckedIn()){
                r.resolve('SUCCESS');
            } else if (attemptedCheckin && areCheckinErrors()){
                r.resolve('ERROR');
            } else{
                //This should only return true if all current appointments.checkin === 0 and there has been an attempted checkin. this implies an error has occurred
                hasAttemptedCheckin()
                    .then(function(attempted){
                        if(!attempted){
                            isAllowedToCheckIn()
                                .then(function(isAllowed){
                                    if(isAllowed){
                                        checkinToAllAppointments()
                                            .finally(function(res) {
                                                attemptedCheckin = true;
                                                updateCheckinState(res.appts);
                                                r.resolve(res.status);
                                            })
                                    } else r.resolve('NOT_ALLOWED')
                                })
                        }
                    })
                    .catch(function(){
                        r.resolve('ERROR')
                    })
            }

            return r.promise;
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
                setCheckinState('CHECKIN_NONE');
                r.resolve()
            } else if(alreadyCheckedIn(appts)){
                setCheckIn("CHECKIN_MESSAGE_AFTER" + setPlural(appts));
                r.resolve()
            } else if (checkinErrorsExist(appts)) {
                setCheckinState("CHECKIN_ERROR");
                r.resolve()
            } else {
                //This means at this point there exists appointments today and none of them have been checked in
                isAllowedToCheckIn()
                    .then(function(canCheckin){
                        if(!canCheckin) setCheckinState("NOT_ALLOWED", appts.length);
                        else setCheckinState("CHECKIN_MESSAGE_BEFORE" + setPlural(appts), appts.length);
                        r.resolve()
                    })
            }
            return r.promise
        }

        function updateCheckinState(checkedInAppts){

            if(checkedInAppts) Appointments.updateCheckedInAppointments(checkedInAppts);
            var appts = Appointments.getTodaysAppointments();

            //First evaluate the current state of existing appointments, see if they were already checked in and if so what the state is (all success or some errors)
            if(alreadyCheckedIn(appts)){
                setCheckIn("CHECKIN_MESSAGE_AFTER" + setPlural(appts));
            } else if (checkinErrorsExist(appts)) {
                setCheckinState("CHECKIN_ERROR");
            } else {
                 setCheckinState("NOT_ALLOWED", appts.length);
            }
        }

        function alreadyCheckedIn(appts){
            return appts.reduce(function(output, app){
                if(app.CheckIn === '0') return false;
            }, true);
        }

        function checkinErrorsExist(appts){
            var checkinExists = appts.reduce(function(output, app){
                if(app.CheckIn === '1') return true;
            }, false);

            if(!checkinExists) return false;

            return appts.reduce(function(output, app){
                if(app.CheckIn === '0') return true;
            }, false);
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
                case 'CHECKIN_ERROR':
                    attemptedCheckin = true;
                    errorsExist = true;
                    state.canNavigate = true;
                    state.numberOfAppts = 0;
                    state.checkinError = true;
                    state.noAppointments = false;
                    state.allCheckedIn = false;
                    break;
                case 'CHECKIN_MESSAGE_AFTER':
                case 'CHECKIN_MESSAGE_AFTER_PLURAL':
                    attemptedCheckin = true;
                    allCheckedIn = true;
                    state.canNavigate = true;
                    state.numberOfAppts = 0;
                    state.checkinError = false;
                    state.noAppointments = false;
                    state.allCheckedIn = true;
                    break;
                case 'CHECKIN_NONE':
                    state.canNavigate = false;
                    state.numberOfAppts = 0;
                    state.checkinError = false;
                    state.noAppointments = true;
                    state.allCheckedIn = false;
                    break;
                case 'CHECKIN_MESSAGE_BEFORE':
                case 'CHECKIN_MESSAGE_BEFORE_PLURAL':
                    state.canNavigate = true;
                    state.numberOfAppts = numAppts;
                    state.checkinError = false;
                    state.noAppointments = false;
                    state.allCheckedIn = false;
                    break;
                case 'NOT_ALLOWED':
                    state.canNavigate = false;
                    state.numberOfAppts = numAppts;
                    state.checkinError = false;
                    state.noAppointments = false;
                    state.allCheckedIn = false;
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
         *@ngdoc method
         *@name setCheckInApps
         *@methodOf MUHCApp.service:CheckinService
         *@description Sets todays appointments that can be checked into
         */
        function setCheckInApps(apps){
            checkinApps = apps;
        }

        /**
         *@ngdoc method
         *@name areAllCheckedIn
         *@methodOf MUHCApp.service:CheckinService
         *@description Function that returns whether or not todays appointments are all checked in
         **/
        function areAllCheckedIn(){
            return allCheckedIn;
        }

        function areCheckinErrors(){
            return errorsExist;
        }

        /**
         *@ngdoc method
         *@name areAllCheckedIn
         *@methodOf MUHCApp.service:CheckinService
         *@description Function that returns whether or not todays appointments are all checked in
         **/
        function setAllCheckedIn(bool){
            allCheckedIn = bool;
        }

        /**
         *@ngdoc method
         *@name isAllowedToCheckin
         *@methodOf MUHCApp.service:CheckinService
         *@description Function determines geographically whether user is allow to check-in. Works under the assumption
         * that all the checks to see if an appointment is today and open have already been done! It also updates
         * the positionCheckinAppointment property of the CheckinService. Note: The patient must be within 500m of
         * hospital to be able to checkin.
         *@returns {Promise} Returns a promise that resolves to success if the user is allowed to checkin
         */
        function isAllowedToCheckIn() {
            var r=$q.defer();
            navigator.geolocation.getCurrentPosition(function(position){
                var distanceMeters = 1000 * getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, 45.474127399999996, -73.6011402);
                if (distanceMeters <= 500) {
                    positionCheckinAppointment = {
                        'Latitude':position.coords.latitude,
                        'Longitude':position.coords.longitude,
                        'Accuracy':position.coords.accuracy
                    };
                    r.resolve(true);
                } else {
                    r.reject(false);
                }
            }, function(){
                r.reject(false);
            }, {
                maximumAge: 10000,
                timeout: 15000,
                enableHighAccuracy: true
            });

            return r.promise;
        }

        /**
         *@ngdoc method
         *@name hasAttemptedCheckin
         *@methodOf MUHCApp.service:CheckinService
         *@description Verifies if the user is already checked in for their appointment in the waiting room. Note: This
         * should only be called if none of today's appointment have their checkin flag set to 1.. because then
         * intuitively they have attempted checking in.
         *@returns {Promise} Returns a promise containing the CheckedIn boolean and the AppointmentSerNum.
         **/
        function hasAttemptedCheckin() {
            var r = $q.defer();

            //Request is sent with the AppointmentSerNum
            RequestToServer.sendRequestWithResponse('CheckCheckin', {PatientSerNum: Patient.getUserSerNum()})
                .then(function(response) {
                    //Response is either success or failure with the appointmentSerNum again in the data object
                    if (response.Data.hasOwnProperty('AttemptedCheckin') && response.Data.AttemptedCheckin == 'true') {
                        r.resolve(true);
                    } else {
                        console.log('Error validating checkin status with response: ' + JSON.stringify(response));
                        r.resolve(false);
                    }
                })
                .catch(function() {
                    r.reject(false);
                });
            return r.promise;
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

            var objectToSend = positionCheckinAppointment;
            objectToSend.PatientId = Patient.getPatientId();
            objectToSend.PatientSerNum = Patient.getPatientSerNum();

            RequestToServer.sendRequestWithResponse('Checkin', objectToSend)
                .then(function (response) {
                    //TODO: UPDATE LIST OF APPOINTMENTS THAT WERE SUCCESSFULLY CHECKED IN
                    r.resolve({status: 'SUCCESS', appts: response.Data.appointments});
                })
                .catch(function () {
                    r.reject({status: 'ERROR', appts: null});
                });

            return r.promise;
        }

        function setCheckIn(checkedinApps) {
            checkinApps = checkinApps.map(function(app){
                if(checkedinApps.includes(app.AppointmentSerNum)) app.Checkin = '1';
                return app;
            })
        }

        function clear() {
            checkinApps = [];
            allCheckedIn= false;
        }

        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1); // deg2rad below
            var dLon = deg2rad(lon2 - lon1);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        }

        function deg2rad(deg) {
            return deg * (Math.PI / 180);
        }
    }
})();

