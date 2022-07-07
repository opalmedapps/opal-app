(function () {
    'use strict';

    /**
     * @description Constants used to make requests to the listener.
     * @author Stacey Beard
     * @date 2021-12-08
     */
    angular
        .module("MUHCApp")
        .constant("RequestConstants", {
            CODE: {
                /** Response codes **/
                ENCRYPTION_ERROR: 1,
                SERVER_ERROR: 2,
                SUCCESS: 3,
                TOO_MANY_ATTEMPTS: 4,
                INVALID_VERSION: 5,
                CLIENT_ERROR: 400,
            },
            /**
             * The requests in the list below can be targeted to any patient to which the current user has access,
             * using the request attribute 'TargetPatientID' (managed by RequestToServer).
             * TODO Add checkin and questionnaire requests, and adapt them to use TargetPatientID
             */
            PATIENT_TARGETED_REQUESTS: [
                'DocumentContent',
                'GetOneItem',
                'PatientTestDateResults',
                'PatientTestDates',
                'PatientTestTypeResults',
                'PatientTestTypes',
                'Refresh',
            ],
        });
})();
