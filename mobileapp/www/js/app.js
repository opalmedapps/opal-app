var myApp=angular
	.module('app',[
		'ui.router','onsen'
		])
	.config(['$urlRouterProvider','$stateProvider',function($urlRouterProvider,$stateProvider){
		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('logIn',{
				url:'/',
				templateUrl:'templates/logIn.html',
				controller:'loginController'
			})
			.state('Home',{
				url:'/Home',
				templateUrl:'templates/home.html',
				controller:'homeController',
				resolve:{
					userD: ['UserAuthorizationInfo', function(UserAuthorizationInfo){return UserAuthorizationInfo.authorization;}]
				}
			})



	}]);



/*myApp.factory('Application',function Application(){
	var ready=false registeredListeners=[];
	var callListeners=function()
	{
		for (var i = registeredListeners.length - 1; i >= 0; i--) {
			registeredListeners[i]();
		};
	}


	return
	{
		
		isReady:function()
		{
			return ready;
		},
		makeReady:function(){
			ready=true;

		},
		registerListeners:function(callback){
			if(ready) callback();
			else registeredListeners.push(callback);

		}
		
	}
	};
});*/

myApp.service('UserAuthorizationInfo',function(){


		return {
			setUserAuthData: function(username,token,userPathFirebase,authorize)
			{
				this.UserName=username;
				this.UserToken=token;	
				this.authorization=authorize;	
			},
			getUserAuthData:function()
			{
				return {
					UserName:this.UserName,
					Token: this.UserToken,
					AuthorizationData:this.authorization


				};

			}
		};
	});

myApp.service('UserData',['UserAuthorizationInfo', function(UserAuthorizationInfo){
		var FirstName;
		var LastName;
		var Email;
		var TelNum;
		this.userAuthorized=UserAuthorizationInfo.authorization;
		var firebaseLink=new Firebase('https://luminous-heat-8715.firebaseio.com/users/'+UserAuthorizationInfo.UserName+'/fields');
			firebaseLink.on('value',function(snapshot){
  				var newPost=snapshot.val();
  								/*snapshot.forEach(function(data){
  									if(data.key()!=="logged"){
  									$("#addMe").append(data.key()+":"+data.val());
  									}
  									});*/
  				snapshot.forEach(function(data){
					displayChatMessage(data.key(), data.val());
					function displayChatMessage(name, text) {
                  if(name!=="logged"){
                  		
								if(name==="FirstName"){
                  					this.FirstName=text;
                  					//console.log(this.FirstName);

                  				}else if(name==="LastName"){
                  					this.LastName=text;
                  					//console.log(this.LastName);

                  				}else if(name==="Email"){
                  					this.Email=text;

                  				}else{
                  					this.TelNum=text;
                  				}
                  		
                  				
                  				//setTimeout(function () {$scope.$apply(function () {$scope.userId=authData.uid;});}, 500);

        					  // $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#addMe'));
        					   //$('#addMe')[0].scrollTop = $('#addMe')[0].scrollHeight;
                }
     						};	
  									
  					});
  								
  			});
		return ;






}]);





/*
/*myApp.run(function(UserAuthorizationInfo, Application){

	if(Application.isReady()){
		UserAuthorizationInfo.getUserAuthData.then(function(userData){
			data=UserData.getUserData();
		})
	}
});


/*myApp.factory('Application',function Application(){
	var ready=false registeredListeners=[];
	var callListeners=function()
	{
		for (var i = registeredListeners.length - 1; i >= 0; i--) {
			registeredListeners[i]();
		};
	}


	return
	{
		
		isReady:function()
		{
			return ready;
		},
		makeReady:function(){
			ready=true;

		},
		registerListeners:function(callback){
			if(ready) callback();
			else registeredListeners.push(callback);

		}
		
	}
	};
});

myApp.service('UserAuthorizationInfo',function(){


		return {
			setUserAuthData: function(username,token,userPathFirebase,authorize)
			{
				this.UserName=username;
				this.UserToken=token;	
				this.authorization=authorize;	
			},
			getUserAuthData:function()
			{
				return {
					UserName:this.UserName,
					Token: this.UserToken,
					AuthorizationData:this.authorization


				};

			}
		};
	});

myApp.service('UserData',['UserAuthorizationInfo', function(UserAuthorizationInfo){
		var FirstName;
		var LastName;
		var Email;
		var TelNum;
		

		return {
			getUserData:function(UserAuthorizationInfo){
				this.userAuthorized=UserAuthorizationInfo.authorization;
		
				var firebaseLink=new Firebase('https://blazing-inferno-1723.firebaseio.com/users/'+UserAuthorizationInfo.UserName+'/fields');
				firebaseLink.on('value',function(snapshot){
  				var newPost=snapshot.val();
  								/*snapshot.forEach(function(data){
  									if(data.key()!=="logged"){
  									$("#addMe").append(data.key()+":"+data.val());
  									}
  									});*/
  				/*snapshot.forEach(function(data){
					displayChatMessage(data.key(), data.val());
					function displayChatMessage(name, text) {
                  		if(name!=="logged"){
                  		
								if(name==="FirstName"){
                  					this.FirstName=text;
                  					//console.log(this.FirstName);

                  				}else if(name==="LastName"){
                  					this.LastName=text;
                  					//console.log(this.LastName);

                  				}else if(name==="Email"){
                  					this.Email=text;

                  				}else{
                  					this.TelNum=text;
                  				}
                  		
                  				
                  				//setTimeout(function () {$scope.$apply(function () {$scope.userId=authData.uid;});}, 500);

        					  // $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#addMe'));
        					   //$('#addMe')[0].scrollTop = $('#addMe')[0].scrollHeight;
                			}
     					};	
  									
  					});
  								
  				});
				return {
					FirstName:this.FirstName,
					LastName:this.LastName,
					Email:this.Email,
					TelNum:this.TelNum

				};
			}
		};






}]);*/