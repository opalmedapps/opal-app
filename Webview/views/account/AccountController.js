var myApp=angular.module('MUHCApp');
myApp.controller('AccountController',['$scope','UserPreferences','Patient',function($scope,UserPreferences,Patient){

  $scope.editingDiv = {
      //editFirstNameDiv: false,
      //editLastNameDiv: false,
      editEmailDiv: false,
      editTelNumDiv: false,
      editLanDiv: false,
      editPasswordDiv: false,
      editSMSDiv:false

  };
  $scope.hideSectionsBut = function (onlyDivToShow) {
        for (var div in $scope.editingDiv) {
            if (div !== onlyDivToShow) {
                //console.log($scope.editingDiv[div]);
                $scope.editingDiv[div] = false;

            }

        }
    };
    $scope.checkboxModel=UserPreferences.getEnableSMS();
    $scope.FirstName = Patient.getFirstName();
    $scope.LastName = Patient.getLastName();
    $scope.Email = Patient.getEmail();
    $scope.TelNum = Patient.getTelNum();
    $scope.Language=UserPreferences.getLanguage();
    $scope.sms=UserPreferences.getEnableSMS();

    if((window.localStorage.getItem('pass')).length>7){
        $scope.passwordLength=7;
    }else{
        $scope.passwordLength=window.localStorage.getItem('pass').length;
    }


    


}]);
