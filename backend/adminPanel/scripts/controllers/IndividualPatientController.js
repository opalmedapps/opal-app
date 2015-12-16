var app=angular.module('adminPanelApp');
app.controller('IndividualPatientController',function ($rootScope, $log,$http,$scope, $state, Patient) {
	$scope.patient=Patient.getPatient();
	if(typeof $scope.patient=='undefined'){
		console.log('boom');
		$state.go('patients.search-patients');
	}
});