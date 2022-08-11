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
            getSavedPatient(Patient.getPatientSerNum());
        }

        /**
         * @description Get the last patient data loaded from the localstorage
         * @param {number} currentPatientSerNum Current UserPatient sernum
         */
        function getSavedPatient(currentPatientSerNum) {
            let savedPatientSernum = $window.localStorage.getItem('profileId') || null;
            if (savedPatientSernum && (currentPatientSerNum !== savedPatientSernum)) changePatientProfile(savedPatientSernum);
        }

        /**
         * @description Change the current profile for a selected patient or previously loaded.
         * @param {number} requestedPatientSernum Patient sernum to be loaded
         */
        // TODO: As of now we NEED to have a `patient_legacy_id` to be able to get any data since data calls still go through the old listener. 
        // Once end point to get patient data are done, we will need to adjust this code in concequences.
        function changePatientProfile(requestedPatientSernum) {
            let result = patientList.find((item) => {
                return item.patient_legacy_id == requestedPatientSernum
            });
            if (result) {
                currentSelectedProfile = result;
                Patient.setSelectedProfile(currentSelectedProfile);
                $window.localStorage.setItem('profileId', currentSelectedProfile.patient_legacy_id);
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
