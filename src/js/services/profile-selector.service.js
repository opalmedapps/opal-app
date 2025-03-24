 (function () {
    'use strict';

    angular
        .module('MUHCApp')
        .service('ProfileSelector', ProfileSelector);

    ProfileSelector.$inject = ['$window', 'Params', 'RequestToServer', 'Patient'];

    /**
     * @description Service that handle loading of a patient list for a given caregiver and selection of the profile.
     */
    function ProfileSelector($window, Params, RequestToServer, Patient) {
        let patientList;
        let currentSelectedProfile;

        return {
            init: init,
        }

        /**
         * @description Initialize the service once the user data is loaded.
         */
        async function init() {
            patientList = await requestPatientList();
            const patientSernum = getLocalStoragePatientSernum(Patient.getPatientSerNum());
            loadPatientProfile(patientSernum);
        }

        /**
         * @description Check if a patient Sernum is saved in localstorage, compare it to the current user.
         * @param {number} currentPatientSerNum Current UserPatient sernum
         * @returns {number} The patient sernum that needs to be used for initialization.
         */
        function getLocalStoragePatientSernum(currentPatientSerNum) {
            let savedPatientSernum = $window.localStorage.getItem('lastUsedPatient') || null;
            return (savedPatientSernum && (currentPatientSerNum !== savedPatientSernum)) ? savedPatientSernum : currentPatientSerNum;
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
                $window.localStorage.setItem('lastUsedPatient', currentSelectedProfile.patient_legacy_id);
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
                return result.data || [];
            } catch (error) {
                // TODO: Display error in the view (QSCCD-77)
                console.error(error);
            }
        }
    }
})();
