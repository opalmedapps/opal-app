var myApp=angular.module('MUHCApp');
myApp.controller('FeedbackController',['Patient', 'RequestToServer','$scope', function(Patient, RequestToServer, $scope){
	$scope.suggestionText='';
	$scope.FirstName=Patient.getFirstName();
	$scope.LastName=Patient.getLastName();
	$scope.profilePicture=Patient.getProfileImage();
	$scope.enabledSend=false;
	$scope.$watch('feedbackText',function(){
		if($scope.feedbackText==''||!$scope.feedbackText)
		{
			$scope.enableSend=false;
		}else{
			$scope.enableSend=true;
		}

	});
	$scope.submitFeedback=function(){
		RequestToServer.sendRequest('Feedback',{FeedbackContent: $scope.feedbackText});
		$scope.feedbackText='';
		$scope.alertFeedback="Feedback sent, thank you for your feedback!";

	}



}]);
