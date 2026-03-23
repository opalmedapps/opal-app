// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   cleanUpService.js
 * Description  :   Clears all the app data on New Login so there are no inconsistencies.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   08 Mar 2017
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('CleanUp', CleanUp);

    CleanUp.$inject = ['ConcurrentLogin', 'User', 'UserAuthorizationInfo', 'LocalStorage', 'Documents', 'Diagnoses',
        'Appointments', 'TxTeamMessages', 'Questionnaires',
        'Announcements', 'EducationalMaterial', 'Notifications', 'UserPreferences',
        'UpdateUI', 'PatientTestResults', 'CheckInService', 'ProfileSelector'];

    function CleanUp(ConcurrentLogin, User, UserAuthorizationInfo, LocalStorage, Documents, Diagnoses,
                     Appointments, TxTeamMessages, Questionnaires,
                     Announcements, EducationalMaterial, Notifications, UserPreferences,
                     UpdateUI, PatientTestResults, CheckInService, ProfileSelector) {
        let service = {
            clear: clear,
            clearSensitive: clearSensitive
        };
        return service;

        ////////////////

        function clear() {
            PatientTestResults.clear();
            LocalStorage.resetUserLocalStorage();
            Documents.clearDocuments();
            Documents.deleteDocumentsDownloaded(); // delete documents downloaded to be shared or viewed on Android (open in external viewer option)
            Diagnoses.clearDiagnoses();
            Appointments.clearAppointments();
            TxTeamMessages.clearTxTeamMessages();
            Questionnaires.clearAllQuestionnaire();
            Announcements.clearAnnouncements();
            EducationalMaterial.clearEducationalMaterial();
            Notifications.clearNotifications();
            User.clearUserData();
            UserPreferences.clearUserPreferences();
            UserAuthorizationInfo.clearUserAuthorizationInfo();
            UpdateUI.clearUpdateUI();
            CheckInService.clear();
            ConcurrentLogin.clearConcurrentLogin();
            ProfileSelector.clearProfile();
        }

        function clearSensitive() {
            PatientTestResults.clear();
        }
    }
})();
