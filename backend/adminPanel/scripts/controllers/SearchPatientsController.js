var app=angular.module('adminPanelApp');
app.controller('SearchPatientsController' , function (api,$scope,Patient,$state,$rootScope, Credentials) {

		$scope.appFolder=Credentials.mobileAppFolder;
		var patients=api.getAllPatients();

		patients.then(function(patients,error){
			console.log(error);
			console.log(patients);
			$scope.patients=patients;
		});
		$scope.$watch('searchPatient',function(){
			if(typeof $scope.patients !=='undefined')
			{
				closeOtherPatients("-1");
			}
		});
		$scope.goToPatient=function(patient)
	   	{
	   		if(patient.expanded)
	   		{
	   			patient.expanded=false;
	   		}else{
	   			patient.expanded=true;
		   		closeOtherPatients(patient.PatientSerNum);
		   		$rootScope.checkSession();
				Patient.setPatient(patient);
				console.log(patient);
				console.log($scope.patients)
				Patient.getPatientUserFromServer().then(function(rows)
				{
					console.log(rows);
					Patient.setPatientUser(rows.data.Username);

					var patientLocal=Patient.getPatientUser();
					console.log(patientLocal);
					objectToLocalStorage={"Username":rows.data.Username};
					window.localStorage.setItem('OpalAdminPanelPatient',JSON.stringify(objectToLocalStorage));
					//$state.go('patients.patient');
				});
	   		}

	   	};
	   	function closeOtherPatients(serNum)
	   	{
	   		for (var i = $scope.patients.length - 1; i >= 0; i--) {
	   			if($scope.patients[i].PatientSerNum!==serNum)
   				{
   					$scope.patients[i].expanded=false;
   				}
	   		};
	   	}

});
