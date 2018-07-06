var app = angular.module('MUHCApp');
app.controller('questionnaireSummaryController',function($scope){


    $scope.setLine = function(){
        $scope.line = true;
        $scope.pie = false;
        $scope.histogram = false;
    };
    $scope.setPie = function(){
        $scope.line = false;
        $scope.pie = true;
        $scope.histogram = false;
    };
    $scope.setHistogram = function(){
        $scope.line = false;
        $scope.pie = false;
        $scope.histogram = true;
    };
});