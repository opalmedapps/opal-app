/*
 * Filename     :   cleanUpService.js
 * Description  :   Clears all the app data on New Login so there are no inconsistencies.
 * Created by   :   David Herrera, Robert Maglieri 
 * Date         :   08 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('CleanUp', CleanUp);

    CleanUp.$inject = ['UserAuthorizationInfo', 'LocalStorage', 'Documents', 'Diagnoses',
        'Appointments', 'Patient', 'Doctors', 'TxTeamMessages', 'Questionnaires',
        'Announcements', 'EducationalMaterial', 'Notifications', 'UserPreferences',
        'UpdateUI', 'Tasks', 'PlanningSteps', 'LabResults', 'CheckInService', 'Constants'];

    /* @ngInject */
    function CleanUp(UserAuthorizationInfo, LocalStorage, Documents, Diagnoses,
                     Appointments, Patient, Doctors, TxTeamMessages, Questionnaires,
                     Announcements, EducationalMaterial, Notifications, UserPreferences,
                     UpdateUI, Tasks, PlanningSteps, LabResults, CheckInService, Constants) {
        var service = {
            clear: clear,
            clearSensitive: clearSensitive
        };
        return service;

        ////////////////

        function clear() {
            LabResults.destroy();
            LocalStorage.resetUserLocalStorage();
            Tasks.destroy();
            PlanningSteps.destroy();
            Documents.clearDocuments();
            Documents.deleteDocumentsDownloaded();  // delete documents downloaded to be viewed on Android (view in external viewer option)
            Diagnoses.clearDiagnoses();
            Appointments.clearAppointments();
            Patient.clearPatient();
            Doctors.clearDoctors();
            TxTeamMessages.clearTxTeamMessages();
            Questionnaires.clearQuestionnaires();
            Announcements.clearAnnouncements();
            EducationalMaterial.clearEducationalMaterial();
            Notifications.clearNotifications();
            UserPreferences.clearUserPreferences();
            UserAuthorizationInfo.clearUserAuthorizationInfo();
            UpdateUI.clearUpdateUI();
            CheckInService.clear();

            /**
             * Delete All Cookies
             */
            if (Constants.app) {
                window.cookieMaster.clear(
                    function () {
                        console.log('Cookies have been cleared');
                    },
                    function () {
                        console.log('Cookies could not be cleared');
                    });
            }
        }

        function clearSensitive() {
            LabResults.destroy();
            Documents.clearDocumentContent();
        }


    }

})();

