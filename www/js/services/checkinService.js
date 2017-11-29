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


        ///////////////////////////////////////////

        return {
            getCheckInApps: getCheckInApps,
            setCheckInApps: setCheckInApps,
            isAllowedToCheckIn: isAllowedToCheckIn,
            hasAttemptedCheckin: hasAttemptedCheckin,
            checkinToAllAppointments: checkinToAllAppointments,
            areAllCheckedIn: areAllCheckedIn,
            setAllCheckedIn: setAllCheckedIn,
            clear: clear
        };

        ////////////////////////////////////////////

        /**
         *@ngdoc method
         *@name getCheckInApps
         *@methodOf MUHCApp.service:CheckinService
         *@description Gets today's appointments that are able to be checked into
         *@returns {Array} Todays checkinable appointments
         */
        function getCheckInApps() {
            return checkinApps;
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
                    r.resolve('CHECK_IN_PERMITTED');
                } else {
                    r.reject('NOT_ALLOWED');
                }
            }, function(){
                r.reject('LOCATION_ERROR');
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
            RequestToServer.sendRequestWithResponse('CheckCheckin', {PatientSerNum: Patient.getPatientSerNum()})
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
                    console.log("response after checking in..." + JSON.stringify(response));
                    r.resolve(response);
                })
                .catch(function (error) {
                    r.reject(error);
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

