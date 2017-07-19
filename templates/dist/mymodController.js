(function()
{
    var myApp = angular.module('MUHCApp');
    myApp.controller("MymodController",['$scope',function($scope)
    {
        console.log("MymodController is worksing");
        //Insert Code
        $scope.list = [
            {"Title":"Opal Module 1"},
            {"Title":"Opal Module 2"},
            {"Title":"Opal Module 3"},
            {"Title":"Opal Module 4"},
            {"Title":"Opal Module 5"},
            {"Title":"Opal Module 6"}
        ];
    }]);
})();