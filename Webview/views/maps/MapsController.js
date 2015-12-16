var myApp=angular.module('MUHCApp');
myApp.controller('MapsController',['Maps','$scope','$timeout',function(Maps,$scope,$timeout){

$scope.maps=Maps.getMaps();
$scope.selectedMap=$scope.maps[0];
$scope.showMap=function(map)
{
  $scope.selectedMap=map;
}

}])
