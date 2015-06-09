//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//

//angular.module('app')
	myApp.controller('homeController',['$scope','$state','$firebaseObject','UserData',function( $scope,$state,$firebaseObject,UserData){
		/*console.log(this.patientObject["FirstName"]);
		$scope.FirstName=this.patientObject["FirstName"];
		$scope.LastName=this.patientObject["LastName"];
		$scope.TelNum=this.patientObject["TelNum"];
		$scope.Email=this.patientObject["Email"];
		$scope.picture=this.patientObject["picture"];*/
		
		//var ref=new Firebase('http://blazing-inferno-1723.firebaseio.com/users/simplelogin:2/fields');
    	//var syncObject = $firebaseObject(ref);
    	/*syncObject.$loaded().then(function() {
        console.log("loaded record:", syncObject.$id, syncObject.someOtherKeyInData);

       // To iterate the key/value pairs of the object, use angular.forEach()
        setTimeout(function () {
        	$scope.$apply(function () {	
      		 angular.forEach(syncObject, function(value, key) {
     
			
       		if(key==="FirstName"){
       			$scope.FirstName=value;
       		}else if(key==="LastName"){
       			$scope.LastName=value;
       		}else if(key==="picture"){
       			$scope.picture=value;
       		}else if(key==="Email"){
       			$scope.Email=value;
       		}else if(key==="TelNum"){
       			$scope.TelNum=value;
       		}
          console.log(key, value);
          	});
		}, 4000);
       });
     });*/
		/*$scope.$watch('this.FirstName', function (newVal, oldVal, scope) {
   			 if(newVal) { 
     			scope.FirstName = newVal;
     			console.log(this.FirstName);
     			scope.LastName=this.LastName;
				scope.TelNum=this.TelNum;
				scope.Email=this.Email;
				scope.picture=this.image;

    		}
  		});*/

		setTimeout(function () {
			$scope.$apply(function () {	
				$scope.FirstName=this.FirstName;
				$scope.LastName=this.LastName;
				$scope.TelNum=this.TelNum;
				$scope.Email=this.Email;
				//console.log(this.FirstName);
				if(!this.Email){
					$scope.loaded=true;
				}
				$scope.picture=this.image;
				console.log($scope.picture);

			});
		}, 50);
	
		
	
 		


	}])