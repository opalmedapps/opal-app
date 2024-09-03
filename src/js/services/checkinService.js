/*
 * Filename     :   checkinService.js
 * Description  :   service that manages patient checkin
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */
import { AppointmentFromBackend } from '../models/personal/appointments/AppointmentFromBackend.js';

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

    CheckInService.$inject = ['$q', 'Appointments', 'Hospital', 'Location', 'Params', 'RequestToServer', 'UserPreferences'];

    /* @ngInject */
    function CheckInService($q, Appointments, Hospital, Location, Params, RequestToServer, UserPreferences) {

        /**
         * @description Array of today's appointments for check-in.
         *              This array may contain appointments from several different patients (in a caregiver context).
         * @type {AppointmentFromBackend[]}
         */
        let appointmentsForCheckIn = [];

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

        let initialState = {
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
         *@name  MUHCApp.service.#state
         *@propertyOf MUHCApp.service:CheckinService
         *@description Determines the current state of checkin for a given patient
         */
        var state = initialState;

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#checkinStateSet
         *@propertyOf MUHCApp.service:CheckinService
         *@description Determines whether the checkin state has been set, used for future reference
         */
        var checkinStateSet = false;

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#stateReloading
         *@propertyOf MUHCApp.service:CheckinService
         *@description Determines whether or not the checkin state need to be reloaded
         */
        var stateReloading = false;

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
            clear: clear,
            evaluateCheckinState: evaluateCheckinState,
            getAppointmentsForCheckIn: () => appointmentsForCheckIn,
            reloadingCheckinState: () => stateReloading = true,
            setAppointmentsForCheckIn: setAppointmentsForCheckIn,
        };

        ////////////////////////////////////////////

        async function attemptCheckin(patientSerNum){
            const isAllowed = await isWithinCheckinRange();
            if (!isAllowed) return 'CHECKIN_NOT_ALLOWED';

            const checkinResult = await checkInToAllAppointments(patientSerNum);
            attemptedCheckin = true;
            await updateCheckInState(checkinResult.appts);
            markAppointmentsCheckedIn(checkinResult.appts);
            return checkinResult.status;
        }

        async function evaluateCheckinState() {
            if (attemptedCheckin || checkinStateSet && !stateReloading) return state;
            await updateCheckInState();
            checkinStateSet = true;
            stateReloading = false;
            return state;
        }

        async function updateCheckInState() {
            // Evaluate the current state of appointments, to see if they were already checked in and if so what the state is (all success or some errors)
            if (appointmentsForCheckIn.length === 0) setCheckinState("CHECKIN_NONE");
            else if (alreadyCheckedIn()) setCheckinState("CHECKIN_MESSAGE_AFTER" + getPlural(appointmentsForCheckIn));
            else if (checkinErrorsExist()) setCheckinState("CHECKIN_ERROR");
            else {
                try {
                    const canCheckin = await isWithinCheckinRange();
                    if (canCheckin) {
                        const unCheckedInAppts = getUncheckedInApps();
                        let checkinStatus = "CHECKIN_MESSAGE_BEFORE" + getPlural(unCheckedInAppts);
                        if (unCheckedInAppts.length === 0) {
                            checkinStatus = "CHECKIN_MESSAGE_AFTER";
                        }
                        setCheckinState(checkinStatus, unCheckedInAppts.length);
                    } else {
                        setCheckinState("CHECKIN_NOT_ALLOWED", appointmentsForCheckIn.length);
                    }
                } catch (error) {
                    console.error(error);
                    setCheckinState("CHECKIN_NOT_ALLOWED", appointmentsForCheckIn.length);
                }
            }
        }

        function alreadyCheckedIn() {
            return appointmentsForCheckIn.every(apt => apt.Checkin == 1);
        }

        function checkinErrorsExist() {
            return appointmentsForCheckIn.some(apt => apt.Checkin == -1);
        }

        function getUncheckedInApps() {
            return appointmentsForCheckIn.filter(apt => apt.Checkin == 0);
        }

        function getPlural(appointments) {
            return appointments.length > 1 ? '_PLURAL' : '';
        }

        function setCheckinState(status, numAppointments){
            state.message = status;
            switch(status) {
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
                    state.numberOfAppts = numAppointments;
                    state.checkinError = false;
                    state.noAppointments = false;
                    state.allCheckedIn = false;
                    break;
                case "CHECKIN_NOT_ALLOWED":
                    state.canNavigate = false;
                    state.numberOfAppts = numAppointments;
                    state.checkinError = false;
                    state.noAppointments = false;
                    state.allCheckedIn = false;
                    state.inRange = false;
                    break;
            }
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
            const sites = await Hospital.requestSiteInfo();
            if (sites?.length === 0) throw new Error("No sites are defined for this institution");

            // To be in range, the user must be close enough to at least one of the available hospital sites
            let results = await Promise.allSettled(
                sites.map(site => Location.isInRange(site.latitude, site.longitude, Params.checkinRadiusMeters))
            );

            // If any promise rejected, throw a new error, otherwise, return true if at least one site is in range
            if (results.some(result => result?.status === 'rejected')) {
                console.error('Geolocation error', results);
                throw new Error("Failed to get geolocation information for check-in");
            }
            return results.some(result => result?.value === true);
        }

        /**
         *@ngdoc method
         *@name checkInToAllAppointments
         *@methodOf MUHCApp.service:CheckinService
         *@description Checks in a patient for all their appointments today.
         *@returns {Promise} Returns a promise containing the CheckedIn boolean and the AppointmentSerNum.
         **/
        async function checkInToAllAppointments(patientSerNum){
            try {
                const response = RequestToServer.sendRequestWithResponse(
                    'Checkin',
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    patientSerNum
                );
                return {status: 'SUCCESS', appts: response.Data};
            }
            catch (error) {
                throw {status: 'ERROR', appts: null};
            }
        }

        /**
         * @description Formats and saves the list of today's appointments for check-in.
         * @param appointments The list of appointments for check-in.
         */
        function setAppointmentsForCheckIn(appointments) {
            if (!appointments) return;

            // Format appointments from the backend format to the app's format
            appointmentsForCheckIn = [];
            appointments.forEach(appointment => {
                const formattedAppointment = new AppointmentFromBackend(appointment, UserPreferences.getLanguage());
                appointmentsForCheckIn.push(formattedAppointment);
            });

            // TODO why?
            // Sort chronologically with the most recent first
            appointmentsForCheckIn = $filter('orderBy')(appointmentsForCheckIn, 'ScheduledStartTime', false);
        }

        /**
         * @description Updates appointments to set them as checked-in locally.
         * @param appointments The list of appointments to update. The appointments are not updated directly,
         *                     instead, they're matched to those in the service by AppointmentSerNum, and updated there.
         */
        function markAppointmentsCheckedIn(appointments) {
            let serNumsToUpdate = appointments ? appointments.map(apt => apt.AppointmentSerNum) : [];
            appointmentsForCheckIn.forEach(apt => {
                if(serNumsToUpdate.includes(apt.AppointmentSerNum)) apt.Checkin = 1;
            });
        }

        function clear() {
            appointmentsForCheckIn = [];
            allCheckedIn = false;
            attemptedCheckin = false;
            state = initialState;
            checkinStateSet = false;
            stateReloading = false;
            errorsExist = false;
        }
    }
})();
