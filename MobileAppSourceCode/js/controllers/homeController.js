//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
var myApp = angular.module('app');
myApp.controller('homeController', ['$scope', 'UserDataMutable','UpdateUI', '$timeout','$filter','$cordovaNetwork','UserTasksAndAppointments','LocalStorage',function ($scope, UserDataMutable,UpdateUI,$timeout,$filter,$cordovaNetwork,UserTasksAndAppointments,LocalStorage) {
    var updatedField=null;
        function loadInfo(){

           var dataVal= UpdateUI.UpdateUserFields();
           dataVal.then(function(data){
                setTimeout(function(){
                    $scope.$apply(function(){
                        $scope.NextAppointment=UserTasksAndAppointments.getCurrentTaskOrAppointment().Date;
                        $scope.FirstName = UserDataMutable.getFirstName();
                        $scope.LastName = UserDataMutable.getLastName();
                        $scope.TelNum = UserDataMutable.getTelNum();
                        $scope.Email = UserDataMutable.getEmail();
                        $scope.picture = UserDataMutable.getPictures();

                    });
                },20)}, function(error){console.log(error);});

        };


         $scope.load = function($done) {
          $timeout(function() {
            loadInfo();
                $done();

          }, 1000);
        };

    $scope.dateToday=new Date();
    console.log($scope.dateToday);
    $scope.NextAppointmentDate=UserTasksAndAppointments.getCurrentTaskOrAppointment().Date;
    $scope.NextAppointmentType=UserTasksAndAppointments.getCurrentTaskOrAppointment().Name;
    if($scope.NextAppointmentDate-$scope.dateToday>0) { $timeout(function(){$scope.showNextAppointment=true})}else{ $timeout(function(){$scope.showNextAppointment=false})};
    $scope.FirstName = UserDataMutable.getFirstName();
    $scope.LastName = UserDataMutable.getLastName();
    $scope.TelNum = UserDataMutable.getTelNum();
    $scope.Email = UserDataMutable.getEmail();
    $scope.picture = UserDataMutable.getPictures();

    $scope.goContact=function(type){
        myNavigator.pushPage('page2.html', {param:type},{ animation : 'slide' } );
    };

}]);

myApp.controller('ContactDoctorController',['$scope',function($scope){

 var page = myNavigator.getCurrentPage();
 var parameters=page.options.param;
 $scope.header=parameters;
 $scope.$watch('header',function(){
    $scope.valueData=page.options.param;
    $scope.notification=current[parameters];
     console.log(page);

 });
 var page = myNavigator.getCurrentPage();
    console.log(page.options.param);
    console.log("adas");



}]);
