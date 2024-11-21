/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
angular.module('OpalApp')
.directive('rateMaterial', ['ProfileSelector', 'RequestToServer', function(ProfileSelector, RequestToServer) {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
        eduMaterialControlSerNum: '=serNum'
    },
    templateUrl: './views/personal/education/material-rating-template.html',
    link: function (scope, element) {

   	initRater();
	function initRater()
	{
        scope.rate = [];
		scope.submitted = false;
		scope.emptyRating = true;
		for(var i = 0; i < 5;i++)
		{
			scope.rate.push({
				'Icon':'ion-ios-star-outline'
			});
		}
	}
	scope.rateMaterial = function(index)
	{
		scope.emptyRating = false;
        scope.ratingValue = index+1;
		for(var i = 0; i < index+1;i++)
		{
			scope.rate[i].Icon = 'ion-star';
		}
		for(var i = index+1; i < 5;i++)
		{
			scope.rate[i].Icon = 'ion-ios-star-outline';
		}
	};
	scope.submit = function()
	{
        var patientSerNum = ProfileSelector.getPatientSerNum();
        var edumaterialControlSerNum = scope.eduMaterialControlSerNum;
        RequestToServer.sendRequest('EducationalMaterialRating',{'PatientSerNum':patientSerNum,'EducationalMaterialControlSerNum':edumaterialControlSerNum,'RatingValue':scope.ratingValue});
        scope.submitted = true;
	}
      
    }
  };
}]);
