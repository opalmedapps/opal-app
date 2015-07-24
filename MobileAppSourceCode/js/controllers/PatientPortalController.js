var myApp=angular.module('app');
myApp.controller('PatientPortalController',function($timeout,$scope){


$scope.doSomething=function(){


	console.log('Yeah buuuddy!!!');
}

var firebaseLink=new Firebase("https://blazing-inferno-1723.firebaseio.com/");
 firebaseLink.child('Updates').once('value', function (snapshot) {
        $timeout(function () {
            $scope.updates = snapshot.val();
            $scope.currentTime=new Date();
        
            $scope.arrayUpdates = Object.keys($scope.updates);
        });
    }, function (error) {
        console.log(error);
    });

});


myApp.controller('MessagePageController',function($timeout,$scope){


$scope.doSomething=function(){


	console.log('Yeah buuuddy!!!');
}

var firebaseLink=new Firebase("https://blazing-inferno-1723.firebaseio.com/");
 firebaseLink.child('Updates').once('value', function (snapshot) {
        $timeout(function () {
            $scope.updates = snapshot.val();
            $scope.currentTime=new Date();
        
            $scope.arrayUpdates = Object.keys($scope.updates);
        });
    }, function (error) {
        console.log(error);
    });

});