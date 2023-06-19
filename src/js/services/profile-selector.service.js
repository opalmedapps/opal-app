import {Observer} from "../models/utility/observer";
 
 (function () {
    'use strict';

    angular
        .module('MUHCApp')
        .service('ProfileSelector', ProfileSelector);

    ProfileSelector.$inject = ['$timeout', '$window', 'Params', 'RequestToServer', 'User'];

    /**
     * @description Service that handle loading of a patient list for a given caregiver and selection of the profile.
     */
    function ProfileSelector($timeout, $window, Params, RequestToServer, User) {
        const profileObserver = new Observer();
        let patientList;
        let currentSelectedProfile;

        return {
            init: init,
            getPatientList: () => patientList,
            loadPatientProfile: loadPatientProfile,
            getActiveProfile: () => currentSelectedProfile,
            getConfirmedProfiles: getConfirmedProfiles,
            clearProfile: clearProfile,

            // Functions to get info from the current profile
            getFirstName: () => currentSelectedProfile?.first_name,
            getPatientSerNum: () => currentSelectedProfile?.patient_legacy_id,
            getAccessLevel: () => currentSelectedProfile?.data_access,
        }

        /**
         * @description Initialize the service once the user data is loaded.
         */
        async function init() {
            patientList = await requestPatientList();
            await User.initUser();
            const patientSerNum = getLocalStoragePatientSerNum();
            loadPatientProfile(patientSerNum);
        }

        /**
         * @returns The list of confirmed relationship only.
         */
        function getConfirmedProfiles() {
            return patientList.filter(patient => patient.status === Params.relationshipStatus.confirmed);
        }

        /**
         * @description Returns the PatientSerNum stored in localstorage, representing the last viewed profile.
         *              If none is found, returns undefined.
         * @returns {number} The PatientSerNum of the last viewed profile.
         */
        function getLocalStoragePatientSerNum() {
            return $window.localStorage.getItem('profileId') || undefined;
        }

        /**
         * @description Find in the list and load a profile as the current selected profile.
         *              Set the patient sernum in local storage.
         *              If the requested profile is invalid (for example, because the SerNum wasn't provided, or
         *              because the relationship was revoked), fall back onto any valid profile.
         * @param {number} requestedPatientSerNum The PatientSerNum of the profile to load.
         */
        // TODO: As of now we NEED to have a `patient_legacy_id` to be able to get any data since data calls still go through the old listener. 
        // Once endpoints to get patient's data are done, we will need to adjust this code in consequences.
        function loadPatientProfile(requestedPatientSerNum) {
            // Validate that the requested profile can be loaded. If not, fall back onto some other valid profile.
            currentSelectedProfile = getConfirmedProfiles().find((item) => item.patient_legacy_id == requestedPatientSerNum)
                || getConfirmedProfiles()[0];

            // If no profile can be loaded (e.g. because all profiles are pending), proceed without loading one.
            if (!currentSelectedProfile) return;

            $window.localStorage.setItem('profileId', currentSelectedProfile.patient_legacy_id);
            $timeout(() => {
                profileObserver.notify();
            });
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

        /**
         * Clear the profile for the logout user.
         * @param {void}.
         * @returns {void}.
         */
        function clearProfile() {
            patientList = [];
            currentSelectedProfile = null;
        }
    }
})();
