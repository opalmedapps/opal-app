var myApp = angular.module('MUHCApp');

myApp.controller('QuestionsController', ['Questionnaire','$scope', '$sce', function(Questionnaire, $scope, $sce){
	$scope.show = function(id)
	{

		console.log(id);
		if($scope.hasOwnProperty('popover'))
		{
			$scope.popover.show(id);
		}
	}
	ons.createPopover('./views/personal/questionnaires/popover.html').then(function(popover){
		console.log(popover);
		$scope.popover = popover;
		
	});
	$scope.Questions = Questionnaire.getQuestions();
	$scope.maxNumberOfQuestions = Questionnaire.getMaxQuestions();
	$scope.toSafeHTML = function(question){
		return $sce.trustAsHtml(question.questionText);
	};
}]);

myApp.controller('BeginButtonController', ['$scope', function($scope){

	if(typeof personalNavigator!=='undefined'&&typeof personalNavigator.getCurrentPage()!=='undefined'&&typeof personalNavigator.getCurrentPage().options.param!=='undefined')
	{
		console.log('personal');
		var param=personalNavigator.getCurrentPage().options.param;
		delete personalNavigator.getCurrentPage().options.param;
		$scope.navigator=param;
	}

	if(typeof homeNavigator!=='undefined'&&typeof homeNavigator.getCurrentPage()!=='undefined'&&typeof homeNavigator.getCurrentPage().options.param!=='undefined')
	{
		console.log('home');
		var param=homeNavigator.getCurrentPage().options.param;
		delete homeNavigator.getCurrentPage().options.param;
		$scope.navigator=param;
	}
	$scope.beginButton = function(){
		console.log($scope.navigator);
		if($scope.navigator=='home')
		{
			homeNavigator.pushPage('views/personal/questionnaires/questionnaires.html');
		}else{
			personalNavigator.pushPage('views/personal/questionnaires/questionnaires.html');
		}
	};
}]);

myApp.controller('PopoverController', ['$scope', function($scope) {
	ons.createPopover('views/personal/questionnaires/popover.html').then(function(popover) {
		$scope.popover = popover;
	});

	$scope.show = function(e) {
		$scope.popover.show(e);
	};
}]);
