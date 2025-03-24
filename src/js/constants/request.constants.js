(function () {
    'use strict';

    /**
     * @description Constants used to make requests to the listener.
     * @author Stacey Beard
     * @date 2021-12-08
     */
    angular
        .module('OpalApp')
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
             * The requests in the list below are targeted to a patient to which the current user has access,
             * using the request attribute 'TargetPatientID' (added by RequestToServer).
             */
            PATIENT_TARGETED_REQUESTS: [
                'Checkin',
                'DocumentContent',
                'GetOneItem',
                'PatientTestDateResults',
                'PatientTestDates',
                'PatientTestTypeResults',
                'PatientTestTypes',
                'Questionnaire',
                'QuestionnaireSaveAnswer',
                'QuestionnaireUpdateStatus',
                'Refresh',
                'Read',
                'Studies',
            ],
        });
})();
