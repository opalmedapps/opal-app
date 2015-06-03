'use strict'
			
angular.module('myApp', []).controller('LogInController',function($scope) {
	
		//Data binding fields used for testing purposes to make sure that Angular is working fine and that the user 
		//indeed authenticates
		$scope.name="Succesful";
		var userId="";
		$scope.userId="asdas";
		
		//Creating reference to firebase link
		var myDataRef = new Firebase('https://blazing-inferno-1723.firebaseio.com/users');
		
 		//Function submit for the login button submit, authenticates the user through firebase by updating 
 		//field logged to true
    	$scope.submit=function(){
    		var username=$scope.signup.email;
    		var password=$scope.signup.password;	
    				
    		function authHandler(error, authData) {
  					if (error) {
   							console.log("Login Failed!", error);	 
  					} else {
  						setTimeout(function () {$scope.$apply(function () {$scope.userId=authData.uid;});}, 500);
  						userId=authData.uid;
  						var data=userId+"/fields";
  						var userRef=myDataRef.child(data);
  						userRef.update({logged: 'true'});
						userRef.onDisconnect().update({logged: 'false'});
  						quickWriteUp(data);
  						console.log("Authenticated successfully with payload:", authData);
 						}
					}
    				myDataRef.authWithPassword({
  						email    : username,
 					    password : password
					}, authHandler);	
				}
				//myDataRef.unauth(); <-- use this for the logging out
				
		//This function accesses all the fields for that particular user and posts them to the html, also for testing
		//purposes but it will be useful when displaying in the other views later
				var quickWriteUp=function(usid){
				var UserDatRef=myDataRef.child(usid);
				UserDatRef.on('value',function(snapshot){
  				var newPost=snapshot.val();
  								/*snapshot.forEach(function(data){
  									if(data.key()!=="logged"){
  									$("#addMe").append(data.key()+":"+data.val());
  									}
  									});*/
  				snapshot.forEach(function(data){
					displayChatMessage(data.key(), data.val());
					function displayChatMessage(name, text) {
        					$('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#addMe'));
        					$('#addMe')[0].scrollTop = $('#addMe')[0].scrollHeight;
     						};	
  									
  					});
  								
  			});
 		};
			});
			
