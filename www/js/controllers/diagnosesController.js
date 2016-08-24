//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
/**
 * @ngdoc controller
 * @name MUHCApp.controller:DiagnosesController
 * @requires $scope
 * @requires $timeout
 * @requires Diagnoses
 * @description Controller for the diagnoses view.
 */
var myApp=angular.module('MUHCApp');
myApp.controller('DiagnosesController',['$scope','$timeout','Diagnoses',function($scope,$timeout, Diagnoses){

  //load the diagnoses array into view
  $scope.diagnoses=Diagnoses.getDiagnoses();

}]);
