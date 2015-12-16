angular.module('MUHCApp')
    .controller('CheckInController', ['$scope', 'CheckinService','$timeout','Appointments', '$filter', 'RequestToServer','UpdateUI', function ($scope, CheckinService,$timeout,Appointments,$filter,RequestToServer,UpdateUI) {
      
      initCheckin();
      $scope.load = function($done) {
        $timeout(function() {
          RequestToServer.sendRequest('Refresh','Appointments');
          loadInfo();
              $done();
        }, 3000);
      };
      function loadInfo(){
        UpdateUI.UpdateSection('Appointments').then(function()
        {
          initCheckin();
        });
     }
      function initCheckin(){
        $scope.alert={};
        if(Appointments.isThereNextAppointment())
        {
          $scope.shownAppointmentText='The date and time of your next appointment is:'+$filter('formatDateAppointmentTask')((Appointments.getUpcomingAppointment()).ScheduledStartTime);
        }else{
          if(Appointments.isThereAppointments())
          {
            $scope.shownAppointmentText='The date and time of your last appointment is:'+"\n"+ $filter('formatDateAppointmentTask')((Appointments.getLastAppointmentCompleted()).ScheduledStartTime);
          }else{
            $scope.shownAppointmentText='No appointments available';
          }
        }

        if(CheckinService.haveNextAppointmentToday())
        {
          $scope.alert.message='You have an appointment today, checkin allowed in the vecinity of the hospital';
          if(!CheckinService.isAlreadyCheckedin())
          {
              if(CheckinService.isAllowedToCheckin())
              {
                $scope.enableCheckin=true;
                $scope.alert.message='Checkin to your appointment';
              }
          }else{
            $scope.enableCheckin=false;
            $scope.alert.message='You have checked in to your appointment, procceed to waiting room';
          }
        }else{
          $scope.enableCheckin=false;
          $scope.alert.message='Checkin allowed on the day of your appointment';
        }
      }

      $scope.checkin=function()
      {
        CheckinService.checkinToAppointment();
        $scope.alert.message='You have successfully checked in to your appointment, proceed to waiting room';
        $scope.enableCheckin=false;

      }
}]);
