/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('logOutController', logOutController);

    logOutController.$inject = ['FirebaseService','UserAuthorizationInfo',
        '$state','RequestToServer','LocalStorage', 'Documents','Diagnoses',
        'Appointments','Patient','Doctors','TxTeamMessages','Questionnaires',
        'Announcements','EducationalMaterial','Notifications','UserPreferences',
        'UpdateUI', 'Tasks', 'PlanningSteps'];

    /* @ngInject */
    function logOutController(FirebaseService, UserAuthorizationInfo,
                              $state,RequestToServer,LocalStorage,Documents,Diagnoses,
                              Appointments,Patient,Doctors,TxTeamMessages,Questionnaires,
                              Announcements,EducationalMaterial,Notifications,UserPreferences,
                              UpdateUI, Tasks, PlanningSteps) {
        var vm = this;
        vm.title = 'logOutController';

        activate();

        ////////////////

        function activate() {

            console.log('Resetting services...');

            RequestToServer.sendRequest('Logout');
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
            FirebaseService.getAuthentication().$signOut();
            console.log($state.go('init'));
        }
    }

})();
