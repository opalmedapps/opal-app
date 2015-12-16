var app=angular.module('adminPanelApp');
app.controller('SearchPatientsController' , function (api,$scope,Patient,$state) {

		var patients=api.getAllPatients();
		patients.then(function(patients,error){
			console.log(error);
			console.log(patients);
			$scope.patients=patients;
		});
		$scope.goToPatient=function(patient)
	   	{
				Patient.setPatient(patient);
				Patient.getPatientUserFromServer().then(function(rows)
				{
					console.log(rows);
					Patient.setPatientUser(rows.data.Username);

					var patientLocal=Patient.getPatientUser();
					console.log(patientLocal);
					objectToLocalStorage={"Username":rows.data.Username};
					window.localStorage.setItem('OpalAdminPanelPatient',JSON.stringify(objectToLocalStorage));
					$state.go('patients.patient');
				});
	   	};

});
