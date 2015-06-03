angular.module('app')
	.controller('homeController',['$scope','$state','UserData',function($scope,$state,UserData){

		setTimeout(function () {
			$scope.$apply(function () {	
				$scope.FirstName=this.FirstName;
				$scope.LastName=this.LastName;
				$scope.TelNum=this.TelNum;
				$scope.Email=this.Email;
				console.log(this.FirstName);
				if(!this.Email){
					$scope.loaded=true;
				}
			});
		}, 2000);
		
	
 		


	}])