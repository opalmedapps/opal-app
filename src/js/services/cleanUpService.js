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
        'UpdateUI', 'Tasks', 'PlanningSteps', 'PatientTestResults', 'CheckInService', 
        'Constants'];

    function CleanUp(UserAuthorizationInfo, LocalStorage, Documents, Diagnoses,
                     Appointments, Patient, Doctors, TxTeamMessages, Questionnaires,
                     Announcements, EducationalMaterial, Notifications, UserPreferences,
                     UpdateUI, Tasks, PlanningSteps, PatientTestResults, CheckInService, Constants) {
        var service = {
            clear: clear,
            clearSensitive: clearSensitive
        };
        return service;
        
        ////////////////
        
        function clear() {    
            PatientTestResults.clear();
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
            Questionnaires.clearAllQuestionnaire();
            Announcements.clearAnnouncements();
            EducationalMaterial.clearEducationalMaterial();
            Notifications.clearNotifications();
            UserPreferences.clearUserPreferences();
            UserAuthorizationInfo.clearUserAuthorizationInfo();
            UpdateUI.clearUpdateUI();
            CheckInService.clear();
        }

        function clearSensitive() {
            PatientTestResults.clear();
            Documents.clearDocumentContent();
        }


    }

})();

