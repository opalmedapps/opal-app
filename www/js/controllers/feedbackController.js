//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
myApp.controller('FeedbackController',['Patient', 'RequestToServer', 'NetworkStatus','$scope', function(Patient, RequestToServer, NetworkStatus, $scope){
	$scope.suggestionText='';
	$scope.FirstName=Patient.getFirstName();
	$scope.LastName=Patient.getLastName();
	$scope.profilePicture=Patient.getProfileImage();
	$scope.enableSend=false;
	$scope.$watch('feedbackText',function(){
		if(($scope.feedbackText===''||!$scope.feedbackText))
		{
			$scope.enableSend = !$scope.emptyRating;
		}else{
			$scope.enableSend = !!NetworkStatus.isOnline();
		}

	});
	$scope.submitFeedback=function(type){
		if($scope.enableSend)
		{
			RequestToServer.sendRequest('Feedback',{FeedbackContent: $scope.feedbackText, AppRating:3, Type: type});
			$scope.feedbackText='';
			$scope.submitted=true;
			$scope.enableSend = false;
		}
	};

	initRater();

	function initRater()
	{
        $scope.rate = [];
		$scope.submitted = false;
		$scope.emptyRating = true;
		for(var i = 0; i < 5;i++)
		{
			$scope.rate.push({
				'Icon':'ion-ios-star-outline'
			});
		}
	}

	$scope.rateMaterial = function(index)
	{
		$scope.enableSend=true;
		$scope.emptyRating = false;
        $scope.ratingValue = index+1;
		for(var i = 0; i < index+1;i++)
		{
			$scope.rate[i].Icon = 'ion-star';
		}
		for(var j = index+1; j < 5;j++)
		{
			$scope.rate[j].Icon = 'ion-ios-star-outline';
		}
	};
}]);
