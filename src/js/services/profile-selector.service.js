import {Observer} from "../models/utility/observer";
 
 (function () {
    'use strict';

    angular
        .module('MUHCApp')
        .service('ProfileSelector', ProfileSelector);

    ProfileSelector.$inject = ['$timeout', '$window', 'Params', 'RequestToServer', 'Patient', 'User'];

    /**
     * @description Service that handle loading of a patient list for a given caregiver and selection of the profile.
     */
    function ProfileSelector($timeout, $window, Params, RequestToServer, Patient, User) {
        const profileObserver = new Observer();
        let patientList;
        let currentSelectedProfile;

        return {
            init: init,
            getPatientList: () => patientList,
            loadPatientProfile: loadPatientProfile,
            getActiveProfile: () => currentSelectedProfile,
            observeProfile: fun => profileObserver.attach(fun),
            getConfirmedProfiles: getConfirmedProfiles,
        }

        /**
         * @description Initialize the service once the user data is loaded.
         */
        async function init() {
            patientList = await requestPatientList();
            let loggedInUserPatientId = Patient.getPatientSerNum();
            User.setUserProfile(patientList, loggedInUserPatientId)
            const patientSernum = getLocalStoragePatientSernum(loggedInUserPatientId);
            loadPatientProfile(patientSernum);
        }

        /**
         * @returns The list of confirmed relationship only.
         */
        function getConfirmedProfiles() {
            return patientList.filter(patient => patient.status === Params.relationshipStatus.confirmed);
        }

        /**
         * @description Check if a patient Sernum is saved in localstorage, compare it to the current user.
         * @param {number} currentPatientSerNum Current UserPatient sernum
         * @returns {number} The patient sernum that needs to be used for initialization.
         */
        function getLocalStoragePatientSernum(currentPatientSerNum) {
            let savedPatientSernum = $window.localStorage.getItem('profileId') || null;
            let savedPatientStatus = patientList.find(item => item.patient_legacy_id === savedPatientSernum).status;
            return (savedPatientSernum && savedPatientStatus === Params.relationshipStatus.confirmed && (currentPatientSerNum !== savedPatientSernum)) ? savedPatientSernum : currentPatientSerNum;
        }

        /**
         * @description Find in the list and load a profile as the current selected profile.
         *              Set the patient sernum in local storage.
         * @param {number} requestedPatientSernum Patient sernum to be set as selected.
         */
        // TODO: As of now we NEED to have a `patient_legacy_id` to be able to get any data since data calls still go through the old listener. 
        // Once endpoints to get patient's data are done, we will need to adjust this code in consequences.
        function loadPatientProfile(requestedPatientSernum) {
            let result = patientList.find((item) => item.patient_legacy_id == requestedPatientSernum);
            if (result) {
                currentSelectedProfile = result;
                Patient.setSelectedProfile(currentSelectedProfile);
                $window.localStorage.setItem('profileId', currentSelectedProfile.patient_legacy_id);
                $timeout(() => {
                    profileObserver.notify();
                });
            } else {
                // TODO: Display error in the view (QSCCD-77)
                console.error('Error selecting patient', requestedPatientSernum)
            }
        }

        /**
         * @description Call the Django backend to get a list of patient for a given caregiver.
         * @returns {object} List of patient for a given caregivers
         */
        async function requestPatientList() {
            try {
                const requestParams = Params.API.ROUTES.PATIENTS;
                const result = await RequestToServer.apiRequest(requestParams);
                const formatedResult = assignColor(result.data) ? result.data : [];
                return formatedResult
            } catch (error) {
                // TODO: Display error in the view (QSCCD-77)
                console.error(error);
            }
        }

        /**
         * Add color to the the passed profile.
         * @param {object} profiles - The profile we need to assign a color too. 
         * @returns {object} Profiles data with it's color added.
         */
        function assignColor(profiles) {
            const colorList = [
                '#53BB96',
                '#037AFF',
                '#FF8351',
                '#FEC63D',
                '#B38DF7',
                '#C9BB1C',
                '#1CC925',
                '#1C59C9',
                '#871CC9'
            ];
            profiles.forEach((item, index) => {
                profiles[index].color = (index >= colorList.length) ? `#${Math.floor(Math.random()*16777215).toString(16)}` : colorList[index];
            });
            return profiles;
        }
    }
})();
