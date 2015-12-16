var app=angular.module('adminPanelApp');

/**
 * @ngdoc function
 * @name adminPanelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the adminPanelApp
 */

app.controller('MainController',function ($rootScope, $scope, User,LoginModal,$timeout) {
  if($rootScope.loggedin){
    $rootScope.home=true;
    $rootScope.about=false;
  }else{
    $rootScope.home=false;
    $rootScope.about=true;
  }
  ($rootScope.NumberOfNewMessages>1)?$scope.messages='messages':$scope.messages='message';

  $scope.logout=function()
  {
    $rootScope.loggedin=false;
    $rootScope.home=false;
    $rootScope.about=true;
    $rootScope.currentUser=undefined;
    $rootScope.NumberOfNewMessages=0;
    window.localStorage.removeItem('OpalPanelUser');
    location.reload();

  }


User.getNumberOfPatientsForUserFromServer().then(function(data){
  console.log(data);
  if(User.getUserFields()==undefined){
    $rootScope.loggedin=false;
  }
  $rootScope.TotalNumberOfPatients=data[0].TotalNumberOfPatients;
  });
$scope.signin=function(){
  LoginModal()
  .then(function () {
        $timeout(function(){
          $rootScope.NumberOfDoctorPatients=User.getNumberOfDoctorPatients();
          console.log('$scope.NumberOfDoctorPatients');
        });
  });

}


});
