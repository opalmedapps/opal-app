var myApp=angular.module('adminPanelApp');
myApp.directive('stars',function()
{
	return {
		restrict:'E',
		templateUrl:'./templates/directives/rate.html',
		link:function(scope,element,attrs)
		{
			scope.rate = [];
			initRater();
			function initRater()
			{
				var number = Math.round(Number(attrs["number"]));
				for (var i = 0; i < number; i++) {
					scope.rate.push({'Icon':'ion-star'});
				};
				for (var j = number; j < 5; j++) {
					scope.rate.push({'Icon':'ion-ios-star-outline'});
				};
			}
		}
	}



});