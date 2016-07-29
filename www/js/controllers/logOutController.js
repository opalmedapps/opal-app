
//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('MUHCApp').controller('logOutController',['FirebaseService','UserAuthorizationInfo', '$state','RequestToServer','LocalStorage', 'Documents','Diagnoses','Appointments','Patient','Doctors','TxTeamMessages','Questionnaires','Announcements','EducationalMaterial','Notifications','UserPreferences','UpdateUI',function(FirebaseService, UserAuthorizationInfo,$state,RequestToServer,LocalStorage,Documents,Diagnoses,Appointments,Patient,Doctors,TxTeamMessages,Questionnaires,Announcements,EducationalMaterial,Notifications,UserPreferences,UpdateUI){
		RequestToServer.sendRequest('Logout');
		LocalStorage.resetUserLocalStorage();
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
		FirebaseService.getAuthentication().$unauth();
		$state.go('init');
}]);
