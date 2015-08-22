//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
/**
*@ngdoc controller
*@name MUHCApp.controller:HomeController
*@scope
*@requires $scope
*@requires $timeout
*@requires $filter
*@requires $cordovaNetwork
*@requires MUHCApp.services.Patient
*@requires MUHCApp.services.UpdateUI
*@requires MUHCApp.services.UserPlanWorkflow
*@element textarea
*@description
*Manages the logic of the home screen after log in, instatiates 
*/
var myApp = angular.module('MUHCApp');
myApp.controller('HomeController', ['Appointments','$scope','Patient','UpdateUI', '$timeout','$filter','$cordovaNetwork','UserPlanWorkflow','$rootScope', 'tmhDynamicLocale','$translate', '$translatePartialLoader', function (Appointments, $scope, Patient,UpdateUI,$timeout,$filter,$cordovaNetwork,UserPlanWorkflow, $rootScope,tmhDynamicLocale, $translate, $translatePartialLoader) {
    var updatedField=null;
       /**
        * @ngdoc method
        * @name load
        * @methodOf MUHCApp.controller:HomeController
        * @callback MUHCApp.controller:HomeController.loadInfo
        * @description
        * Pull to refresh functionality, calls {@link MUHCApp.service:UpdateUI} service through the callback to update all the fields, then using 
        * the {@link MUHCApp.service:UpdateUI} callback it updates the scope of the HomeController. 
        *
        *
        */
        if(!$rootScope.refresh){
            UpdateUI.UpdateUserFields();
        }
        
        /*$scope.locales = [
            { name: 'English', id: 'en' },
            { name: 'French', id: 'fr' },
            { name: 'Spanish', id: 'es' }
        ];

        $translatePartialLoader.addPart('home');
        $translate.refresh();
        $scope.updateLocale = function (locale) {
            tmhDynamicLocale.set(locale);
            $translate.use(locale);
        };*/
        $scope.doSomething=function(){
            console.log('I have swiped left');
        }
        $scope.load = function($done) {
          
          $timeout(function() {

            loadInfo();
                $done();
                
          }, 1000);
        };
        function loadInfo(){
           var dataVal= UpdateUI.UpdateUserFields();
           dataVal.then(function(data){
                $timeout(function(){
                    $scope.NextAppointment=(Appointments.getNextAppointment()).Object.ScheduledStartTime;
                    $scope.FirstName = Patient.getFirstName();
                    $scope.LastName = Patient.getLastName();
                    $scope.TelNum = Patient.getTelNum();
                    $scope.Email = Patient.getEmail();

                });
        });
       }

//Sets all the variables in the view. 
    $scope.dateToday=new Date();
    $scope.NextAppointmentDate=(Appointments.getNextAppointment()).Object.ScheduledStartTime;
    $scope.NextAppointmentType=(Appointments.getNextAppointment()).Object.AppointmentType;
    if($scope.NextAppointmentDate.getTime()-$scope.dateToday.getTime()>0) { $timeout(function(){$scope.showNextAppointment=true})}else{ $timeout(function(){$scope.showNextAppointment=false})};
    $scope.FirstName = Patient.getFirstName();
    $scope.LastName = Patient.getLastName();
    $scope.TelNum = Patient.getTelNum();
    $scope.Email = Patient.getEmail();
}]);


/**
* @ngdoc controller
* @scope
* @name MUHCApp.controller:ContactDoctorController
* @requires $scope
* @description Controller manages the logic for the contact page of the doctor, the user is directed here through
* the {@link MUHCApp.controller:HomeController HomeController} view.
*
**/
myApp.controller('ContactDoctorsController',['$scope','Doctors',function($scope,Doctors){   
    $scope.oncologists=Doctors.getOncologists();
    $scope.primaryPhysician=Doctors.getPrimaryPhysician();
    $scope.otherDoctors=Doctors.getOtherDoctors();
    console.log($scope.otherDoctors);
    $scope.goDoctorContact=function(doctor){
        if(doctor===undefined){
            myNavigator.pushPage('page2.html', {param:$scope.primaryPhysician},{ animation : 'slide' } );
        }else{
            myNavigator.pushPage('page2.html', {param:doctor},{ animation : 'slide' } );
        }   
    };
}]);
/**
* @ngdoc controller
* @scope
* @name MUHCApp.controller:ContactDoctorController
* @requires $scope
* @description Controller manages the logic for the contact page of the doctor, the user is directed here through
* the {@link MUHCApp.controller:HomeController HomeController} view.
*
**/
myApp.controller('ContactIndividualDoctorController',['$scope',function($scope){
 
 var page = myNavigator.getCurrentPage();
 $scope.doctor=page.options.param;
 if($scope.doctor.PrimaryFlag===1){
    $scope.header='Primary Physician';
 }else if($scope.doctor.OncologistFlag===1){
     $scope.header='Oncologist';
 }else{
    $scope.header='Doctor';
 }

}]);