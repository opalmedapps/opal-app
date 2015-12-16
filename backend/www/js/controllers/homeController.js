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
myApp.controller('HomeController', ['$state','Appointments', 'CheckinService','$scope','Patient','UpdateUI', '$timeout','$filter','$cordovaNetwork','UserPlanWorkflow','$rootScope', 'tmhDynamicLocale','$translate', '$translatePartialLoader','RequestToServer', function ($state,Appointments,CheckinService, $scope, Patient,UpdateUI,$timeout,$filter,$cordovaNetwork,UserPlanWorkflow, $rootScope,tmhDynamicLocale, $translate, $translatePartialLoader,RequestToServer) {
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
        homePageInit();
        $scope.load = function($done) {

          $timeout(function() {
            RequestToServer.sendRequest('Refresh','All');
            loadInfo();
                $done();
          }, 3000);
        };

        function loadInfo(){
          UpdateUI.UpdateSection('All').then(function()
          {
            homePageInit();
          });
       }
        function homePageInit(){
        if(UserPlanWorkflow.isEmpty())
        {
          if(UserPlanWorkflow.isCompleted()){
            $scope.status='In Treatment';
          }else{
            $scope.status='Radiotherapy Treatment Planning';
          }
        }else{
          $scope.status='No treatment plan available!';
        }

        if(CheckinService.haveNextAppointmentToday())
        {
          if(!CheckinService.isAlreadyCheckedin())
          {
              if(CheckinService.isAllowedToCheckin())
              {
                $scope.enableCheckin=true;
              }else{
                $scope.enableCheckin=false;
              }
          }else{
            $scope.enableCheckin=false;
          }
        }else{
          $scope.enableCheckin=false;
        }

        if(Appointments.isThereAppointments())
        {
          if(Appointments.isThereNextAppointment()){
              var nextAppointment=Appointments.getUpcomingAppointment();
              $scope.noAppointments=false;
              $scope.appointmentShown=nextAppointment;
              $scope.titleAppointmentsHome='Next Appointment';
          }else{
            var lastAppointment=Appointments.getLastAppointmentCompleted();
            $scope.nextAppointmentIsToday=false;
            $scope.appointmentShown=lastAppointment;
            $scope.titleAppointmentsHome='Last Appointment';
          }
        }else{
            $scope.noAppointments=true;
        }

        $scope.Email=Patient.getEmail();
        $scope.FirstName = Patient.getFirstName();
        $scope.LastName = Patient.getLastName();
        $scope.ProfileImage=Patient.getProfileImage();
    }
    $scope.checkin=function(){
      CheckinService.checkinToAppointment();
      $scope.alert.message='You have successfully checked in to your appointment, proceed to waiting room';
      $scope.enableCheckin=false;
    }

//Sets all the variables in the view.

}]);


myApp.controller('WelcomeHomeController',function($scope,Patient){
    $scope.FirstName = Patient.getFirstName();
    $scope.LastName = Patient.getLastName();
    $scope.welcomeMessage="We are happy to please you with some quality service";
});
