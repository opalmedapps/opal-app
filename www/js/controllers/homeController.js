//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
var myApp = angular.module('MUHCApp');
myApp.controller('HomeController', ['$state','Appointments', 'CheckinService','$scope','Patient','UpdateUI', '$timeout','$filter','$cordovaNetwork','UserPlanWorkflow','$rootScope', 'tmhDynamicLocale','$translate', '$translatePartialLoader','RequestToServer', '$location',function ($state,Appointments,CheckinService, $scope, Patient,UpdateUI,$timeout,$filter,$cordovaNetwork,UserPlanWorkflow, $rootScope,tmhDynamicLocale, $translate, $translatePartialLoader,RequestToServer,$location) {
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

        $scope.homeDeviceBackButton=function()
        {
          console.log('device button pressed do nothing');
          console.log(homeNavigator.getDeviceBackButtonHandler());

        }
        homeNavigator.on('prepop',function(){
          $location.hash('');
        });
        setTimeout(function(){
          $("#alertDemoInformationHome").addClass('animated fadeOutUp');
          $timeout(function(){
            $scope.hideDemoInformationHome=true;
          },1000);
        },3000)
        $scope.checkinButtonClass='button button--large';
        homePageInit();
        $scope.load = function($done) {
          RequestToServer.sendRequest('Refresh','All');
          $timeout(function() {
            loadInfo();
                $done();
          }, 5000);
        };

        function loadInfo(){
          UpdateUI.UpdateSection('All').then(function()
          {
            $timeout(function(){
              homePageInit();
            });
          });
       }
        function homePageInit(){
          setTabViews();
          $scope.checkinButtonLabel='Check-in';
          $scope.noUpcomingAppointments=false;
          //Setting up status
          if(!UserPlanWorkflow.isEmpty())
          {
            if(UserPlanWorkflow.isCompleted()){
              $scope.status='In Treatment';
            }else{
              $scope.status='Radiotherapy Treatment Planning';
            }
          }else{
            $scope.status='No treatment plan available';
          }
          //Next appointment information
          if(Appointments.isThereAppointments())
          {
            if(Appointments.isThereNextAppointment()){
                var nextAppointment=Appointments.getUpcomingAppointment();
                $scope.noAppointments=false;
                $scope.appointmentShown=nextAppointment;
                $scope.titleAppointmentsHome='Next Appointment';

            }else{
              console.log('boom');
              $scope.noUpcomingAppointments=true;
              var lastAppointment=Appointments.getLastAppointmentCompleted();
              $scope.nextAppointmentIsToday=false;
              $scope.appointmentShown=lastAppointment;
              $scope.titleAppointmentsHome='Last Appointment';
            }
          }else{
              $scope.noAppointments=true;
          }
          //Checking if user is allowed to checkin
          $scope.enableCheckin=false;
          if(CheckinService.haveNextAppointmentToday())
          {
            if(!CheckinService.isAlreadyCheckedin())
            {
              $scope.loading=true;
              CheckinService.isAllowedToCheckin().then(function(response)
              {
                if(response)
                {
                  console.log(response);
                  $timeout(function(){
                    $scope.enableCheckin=true;
                    $scope.loading=false;
                  });
                }else{
                  $scope.loading=false;
                  $scope.enableCheckin=false;
                }
              });
            }else{
              $scope.checkinButtonLabel='You are checked in';
              $scope.checkinButtonClass='button button--large-success';
              $scope.enableCheckin=false;
            }
          }else{
            $scope.enableCheckin=false;
          }

          //start by initilizing variables
          function setTabViews()
          {
            if(Appointments.isThereNextAppointment())
            {
              if(UserPlanWorkflow.isCompleted())
              {
                $scope.showAppointmentTab=false;
              }else{
                $scope.showAppointmentTab=true;
              }
            }else{
              $scope.showAppointmentTab=false;
            }
          }
          $scope.goToView=function(param)
          {
            if(Appointments.isThereNextAppointment())
            {
              if(UserPlanWorkflow.isCompleted())
              {
                //Status goes to next appointment details
                homeNavigator.pushPage('views/personal/appointment/individual-appointment.html');
              }else{
              homeNavigator.pushPage('views/personal/treatment-plan/individual-stage.html');
              }
            }else{
              if(UserPlanWorkflow.isCompleted())
              {
                //set active tab to personal, no future appointments, treatment plan completed
                tabbar.setActiveTab(1);
              }else{
                homeNavigator.pushPage('views/personal/treatment-plan/individual-stage.html');

              }
            }

          }
        //Basic patient information
        $scope.PatientId=Patient.getPatientId();
        console.log($scope.PatientId);
        $scope.Email=Patient.getEmail();
        $scope.FirstName = Patient.getFirstName();
        $scope.LastName = Patient.getLastName();
        $scope.ProfileImage=Patient.getProfileImage();
    }
    $scope.checkin=function(){
      $scope.checkinButtonLabel='You are checked in';
      $scope.checkinButtonClass='button button--large-success';
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
