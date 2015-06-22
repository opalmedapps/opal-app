//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//

angular.module('app').controller('loadingController', ['$state', '$scope','UserDataMutable', 'UserAuthorizationInfo', 'UserInformation','UserPreferences', function ($state, $scope, UserDataMutable, UserAuthorizationInfo, UserInformation, UserPreferences) {
    console.log("loading");
 
    var Pictures;
    var FirstName;
    var LastName;
    var Email;
    var TelNum;
    var variableCountToGoHome = 0;
    var flagCompleted = 0;
    var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName + '/fields');
    mainLoadingFunction().then(goHome);

    function mainLoadingFunction() {
        var r = $.Deferred();
        firebaseLink.on("value", function (snapshot) {
            var newPost = snapshot.val();
            console.log(newPost.length);
            snapshot.forEach(function (data) {
                firebaseUserInformation(data.key(), data.val());
            });
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        r.resolve();
        console.log("Im returning!");
        return r;
    }
    var goHome = function () {
        console.log("Im going Home");
        $state.go('Home');
    };
    var firebaseUserInformation = function (nameOfFirebaseField, stringFirebaseValueContent) {
        var r = $.Deferred();
        if (nameOfFirebaseField !== "logged") {
            if (nameOfFirebaseField === "picture") {
                Pictures = stringFirebaseValueContent;
                variableCountToGoHome++;
            } else if (nameOfFirebaseField === "FirstName") {
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
        console.log(variableCountToGoHome);
        if (variableCountToGoHome === 5) {
            UserPreferences.setUserPreferences('Enabled','EN');
            UserInformation.setUserInformation(FirstName, LastName, Email, TelNum, Pictures, true);
            UserDataMutable.setData(FirstName, LastName, Pictures,TelNum, Email);
            
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