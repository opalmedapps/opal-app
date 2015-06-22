//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//

var myApp = angular.module('app');
myApp.controller('homeController', ['$scope', '$state', '$firebaseObject', 'UserAuthorizationInfo', 'UserDataMutable','$timeout', '$q',function ($scope, $state, $firebaseObject, UserAuthorizationInfo, UserDataMutable,$timeout,$q) {

    var updatedField=null;
    //setTimeout(function () {
    //    $scope.$apply(function () {
        function loadInfo(){
            var r=$q.defer();
            var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName);
            firebaseLink.once('value', function (snapshot) {
                var newPost = snapshot.val();
                var fields=newPost.fields;
                var images=newPost.images;
                var update=newPost.Update;
                console.log(newPost);
                $scope[update]=newPost.fields[newPost.Update];
                setTimeout(function(){
                    $scope.$apply(function(){
                        console.log($scope);
                        
                    });
                },50);

                r.resolve;

            })
        };


         $scope.load = function($done) {
          $timeout(function() {
            loadInfo();
                $done();
                
          }, 1000);
        };


    /*$scope.load = function ($done) {
        setTimeout(function () {
            var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName);
            firebaseLink.once('value', function (snapshot) {
                var newPost = snapshot.val();
                var fields=newPost.fields;
                var images=newPost.images;
                var update=newPost.Update;
                console.log(newPost);
                $scope.FirstName=newPost.fields[newPost.Update];
                setTimeout(function(){
                    $scope.$apply(function(){
                        console.log($scope.FirstName);
                    });
                },50);
                snapshot.forEach(function (data) {
                    if(data.key()==='fields'){
                        var fields = data.val();
                    }else if(data.key()==='images'){
                        var images=data.val();
                    }else{
                        var update=data.val()
                    }
                    if (update&&fields){
                        $scope.FirstName=update;
                    }

                });

            });

            $done();
        }, 1000);
    };*/
    $scope.FirstName = UserDataMutable.getFirstName();
    $scope.LastName = UserDataMutable.getLastName();
    $scope.TelNum = UserDataMutable.getTelNum();
    $scope.Email = UserDataMutable.getEmail();
    $scope.picture = UserDataMutable.getPictures();
    //console.log($scope.picture);

    // });
    //}, 50);






}]);