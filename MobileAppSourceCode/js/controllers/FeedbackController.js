var myApp=angular.module('MUHCApp');
myApp.controller('FeedbackController',['Patient', 'RequestToServer','$scope', function(Patient, RequestToServer, $scope){

	$scope.suggestionText='';
	$scope.FirstName=Patient.getFirstName();
	$scope.LastName=Patient.getLastName();

	$scope.submitFeedback=function(){
		RequestToServer.sendRequest('Feedback',{FeedbackContent: $scope.suggestionText});
		$scope.suggestionText='';

	}




}]);