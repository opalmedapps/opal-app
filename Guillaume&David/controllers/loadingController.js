//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//

angular.module('app').controller('loadingController',['Auth','UserData', '$state','$scope', function(UserData, Auth, $state,$scope){
	//console.log(this.FirstName);
	var count=0;
	var Waiting=function(){
		//$state.go('Home');
	setTimeout(function () {
				$scope.$apply(function () {	
				//console.log(this.FirstName);
					if(this.FirstName){
						$state.go('Home');
					}else{
						count++;
						if(count<1){
							Waiting();
						}else{
							console.log("Unable to Obtain Data");
							$state.go('logIn');
						}
					}
				
				});
			}, 5000);
	};
	
	Waiting();
	
}]);