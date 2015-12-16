var myApp=angular.module('MUHCApp');
myApp.controller('ContactsController',['$scope','Doctors','$timeout','UpdateUI', function($scope,Doctors,$timeout,UpdateUI){
    $scope.oncologists=Doctors.getOncologists();
    $scope.primaryPhysician=Doctors.getPrimaryPhysician();
    $scope.otherDoctors=Doctors.getOtherDoctors();
    $scope.goDoctorContact=function(doctor){
      $timeout(function(){
        $scope.doctorSelected=doctor;
      });

    };
    $scope.itemArray = Doctors.getContacts();
    $scope.doctorSelected=$scope.oncologists[0];


}]);
