var myApp=angular.module('MUHCApp');
myApp.controller('DiagnosesController',['$scope','$timeout','Diagnoses',function($scope,$timeout, Diagnoses){

  console.log('I am in there!')
  $scope.diagnoses=Diagnoses.getDiagnoses();
  console.log($scope.diagnoses);



}]);
