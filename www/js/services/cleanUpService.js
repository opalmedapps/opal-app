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

    CleanUp.$inject = ['UserAuthorizationInfo','LocalStorage', 'Documents','Diagnoses',
        'Appointments','Patient','Doctors','TxTeamMessages','Questionnaires',
        'Announcements','EducationalMaterial','Notifications','UserPreferences',
        'UpdateUI', 'Tasks', 'PlanningSteps', 'LabResults'];

    /* @ngInject */
    function CleanUp(UserAuthorizationInfo, LocalStorage,Documents,Diagnoses,
                     Appointments,Patient,Doctors,TxTeamMessages,Questionnaires,
                     Announcements,EducationalMaterial,Notifications,UserPreferences,
                     UpdateUI, Tasks, PlanningSteps, LabResults) {
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
        }

        function clearSensitive(){
            LabResults.destroy();
            Documents.clearDocumentContent();
        }

    }

})();

