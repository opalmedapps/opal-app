angular.module('app')
    .controller('accountSettingController', ['UserDataMutable', 'UserPreferences','$scope', function (UserDataMutable, UserPreferences, $scope) {
    //UserDataMutable.setData($rootScope.FirstName, $rootScope.LastName, $rootScope.Pictures, $rootScope.TelNum, $rootScope.Email);
    //console.log(UserDataMutable.getFirstName());
    //var setNameFunction= UserDataMutable.setFirstName('as');
    $scope.editingDiv = {
        //editFirstNameDiv: false,
        //editLastNameDiv: false,
        editEmailDiv: false,
        editTelNumDiv: false,
        editLanDiv: false,
        editPasswordDiv: false,
        editSMSDiv:false

    };

    function printError(error) {
        console.log(error);
    }
    $scope.hideSectionsBut = function (onlyDivToShow) {
        for (var div in $scope.editingDiv) {
            console.log(onlyDivToShow);
            if ('' + div === '' + onlyDivToShow) {
                console.log("ete");
            }
            if (div !== onlyDivToShow) {
                //console.log($scope.editingDiv[div]);
                console.log(div);
                $scope.editingDiv[div] = false;

            }

        }
    };
    /* function alertDismissed() {
    // do something
  }

  navigator.notification.alert(
     'You are the winner!',  // message
     alertDismissed,         // callback
      'Game Over',            // title
      'Done'                  // buttonName
  );*/
    //console.log(UserDataMutable.FirstName);
    // UserDataMutable.setFirstName('david');
   // console.log(UserDataMutable.getFirstName());


   

    $scope.FirstName = UserDataMutable.getFirstName();
    $scope.LastName = UserDataMutable.getLastName();
    $scope.Email = UserDataMutable.getEmail();
    $scope.TelNum = UserDataMutable.getTelNum();
    $scope.smsPreference=UserPreferences.getSMS();
    $scope.Language=UserPreferences.getLanguage();
   // console.log($scope.Language);
   // console.log($scope.smsPreference);
    $scope.changeField = function (fieldToChange) {
        console.log(fieldToChange);
        if (fieldToChange === 'Password' || fieldToChange === 'Email') {
            var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");
            if (fieldToChange === 'Password') {
                changePassword();
            } else {
                changeEmail();

            }
           

        }else{
                function alertDismissed() {
    // do something
  }

  navigator.notification.alert(
     'You are the winner!',  // message
     alertDismissed,         // callback
      'Game Over',            // title
      'Done'                  // buttonName
  );
    //console.log(UserDataMutable.FirstName);
    // UserDataMutable.setFirstName('david');
   // console.log(UserDataMutable.getFirstName());

        }
    };





//Auxiliary functions to change the respective sections
    function changePassword() {
        var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");
        if ($scope.account.newPassword === $scope.account.rePassword) {


            ref.changePassword({
                email: $scope.Email,
                oldPassword: $scope.account.oldPassword,
                newPassword: $scope.account.newPassword
            }, function (error) {
                if (error) {
                    switch (error.code) {
                        case "INVALID_PASSWORD":
                            console.log("The specified user account password is incorrect.");
                            break;
                        case "INVALID_USER":
                            console.log("The specified user account does not exist.");
                            break;
                        default:
                            console.log("Error changing password:", error);
                    }
                } else {
                    console.log("User password changed successfully!");
                }
            });
        } else {
            printError('Passwords Don\'t Match');
        }


    }

    function changeEmail() {
        var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");
        ref.changeEmail({
            oldEmail: $scope.Email,
            newEmail: $scope.account.Email,
            password: $scope.account.emailPassword
        }, function (error) {
            if (error === null) {
                console.log("Email changed successfully");
            } else {
                console.log("Error changing email:", error);
            }
        });
    }




}]);