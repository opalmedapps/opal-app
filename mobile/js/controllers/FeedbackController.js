var myApp=angular.module('MUHCApp');
myApp.controller('FeedbackController',['Patient', 'RequestToServer','$scope', function(Patient, RequestToServer, $scope){
	$scope.suggestionText='';
	$scope.FirstName=Patient.getFirstName();
	$scope.LastName=Patient.getLastName();
	$scope.profilePicture=Patient.getProfileImage();
	$scope.enableSend=false;
	$scope.$watch('feedbackText',function(){
		if(($scope.feedbackText==''||!$scope.feedbackText)||$scope.emptyRating)
		{
			$scope.enableSend=false;
			if(!$scope.emptyRating) $scope.enableSend=true;
		}else{
			$scope.enableSend=true;
		}

	});
	$scope.submitFeedback=function(){
		if($scope.enableSend)
		{
			RequestToServer.sendRequest('Feedback',{FeedbackContent: $scope.feedbackText, AppRating:$scope.ratingValue});
			$scope.feedbackText='';
			$scope.submitted=true;
			console.log('submmited');
			$scope.enableSend = false;	
		}
		

	}
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
		for(var i = index+1; i < 5;i++)
		{
			$scope.rate[i].Icon = 'ion-ios-star-outline';
		}
	};



}]);
