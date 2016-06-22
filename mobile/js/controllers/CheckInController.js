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
          $scope.shownAppointmentText='The date and time of your next appointment is, '+$filter('formatDateAppointmentTask')((Appointments.getUpcomingAppointment()).ScheduledStartTime);
        }else{
          if(Appointments.isThereAppointments())
          {
            $scope.shownAppointmentText='The date and time of your last appointment is, '+"\n"+ $filter('formatDateAppointmentTask')((Appointments.getLastAppointmentCompleted()).ScheduledStartTime);
          }else{
            $scope.shownAppointmentText='No appointments available';
          }
        }
        $scope.enableCheckin=false;
        if(CheckinService.haveNextAppointmentToday())
        {
          if(!CheckinService.isAlreadyCheckedin())
          {
            $scope.alert.message='You have an appointment today, checking your location...';
            $scope.loading=true;
            CheckinService.isAllowedToCheckin().then(function(response)
            {
              if(response)
              {
                console.log(response);
                $timeout(function(){
                  $scope.enableCheckin=true;
                  $scope.loading=false;
                  $scope.alert.message='Checkin to your appointment';
                });
              }else{
                $scope.alert.message='You have an appointment today, checkin allowed in the vecinity of the cancer center';
                $scope.loading=false;
                $scope.enableCheckin=false;
              }
            });
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
