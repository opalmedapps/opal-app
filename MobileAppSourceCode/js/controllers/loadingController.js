//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//

angular.module('app').controller('loadingController', ['$rootScope','$state', '$scope','UpdateUI', 'UserAuthorizationInfo','UserPreferences', '$q','LocalStorage','$http', function ($rootScope,$state, $scope, UpdateUI, UserAuthorizationInfo, UserPreferences, $q,LocalStorage,$http) {


    var Pictures;
    var FirstName;
    var LastName;
    var Email;
    var TelNum;
    var variableCountToGoHome = 0;
    var flagCompleted = 0;
    if (!UserAuthorizationInfo.UserName) {
      UserAuthorizationInfo.loadUserAuthData;
    }
    var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName + '/fields');

    function mainLoadingFunction() {
      $http.get("http://www.httpbin.org/ip")
      .success( function(data) {
        console.log("you are connected to internet with ip : ",data);
        firebaseLink.once("value", function (snapshot) {
            var newPost = snapshot.val();
            if(newPost.FirstName===undefined){
                mainLoadingFunction();
            }
            snapshot.forEach(function (data) {
                firebaseUserInformation(data.key(), data.val());
            });
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
            $state.go('logIn');
        });
      })
      .error(function(data){
        console.log("No internet , trying to load from localStorage");
        if ( LocalStorage.get('UserName') ) {
             UpdateUI.loadLocally();
             $state.go('Home');
        } else {
        $state.go('logIn');
      }
      });

    }

    mainLoadingFunction();


    var firebaseUserInformation = function (nameOfFirebaseField, stringFirebaseValueContent) {
        if (nameOfFirebaseField !== "logged") {
            if (nameOfFirebaseField === "FirstName") {
                FirstName = stringFirebaseValueContent;
                variableCountToGoHome++;
                console.log(FirstName);

            } else if (nameOfFirebaseField === "LastName") {
                LastName = stringFirebaseValueContent;
                variableCountToGoHome++;
                console.log(LastName);

            } else if (nameOfFirebaseField === "Email") {
                Email = stringFirebaseValueContent;
                variableCountToGoHome++;

            } else if (nameOfFirebaseField === "TelNum") {
                TelNum = stringFirebaseValueContent;
                variableCountToGoHome++;
            }
        }
        if (variableCountToGoHome === 4) {
            var updateUI=UpdateUI.UpdateUserFields();
            updateUI.then(function(data){
                if(Object.keys(data.Notifications).length!==0){
                    $rootScope.Notifications=Object.keys(data.Notifications).length;
                }
                UserPreferences.setUserPreferences(data.EnableSMS,data.Language);
                //Firebase.goOffline();
                $state.go('Home');
            },function(error){
                console.log(error);

            });
            //flagCompleted=1;
            //return r;
        }


    };



    function writeErrorMessage(){
        $("#errorMessage").html("");
        $("#errorMessage").append("<h5 class='bg-danger'><strong>" + "Unable to Obtain Information from Server, redirecting to login page" + "</strong></h5>");
        //$('<div/>').text(text).appendTo($('#addMe'));
        $('#errorMessage')[0].scrollTop = $('#addMe')[0].scrollHeight;
    }

}]);

//Older non dynamic version, for testing purposes only
   /*var count = 0;
    var Waiting = function () {
        //$state.go('Home');
        setTimeout(function () {
            $scope.$apply(function () {
                //console.log(this.FirstName);
                if (this.FirstName) {
                    $state.go('Home');
                } else {
                    count++;
                    if (count < 1) {
                        Waiting();
                    } else {
                        console.log("Unable to Obtain Data");
                        $state.go('logIn');
                    }
                }

            });
        }, 3000);
    };

    Waiting();*/
    //$state.go('logIn');
