var app=angular.module('MUHCApp')
app.controller('IndividualAppointmentController', ['$scope','$compile','uiCalendarConfig','Appointments','$timeout','$uibModalInstance','items','Appointments','CheckinService', function($scope,$compile,uiCalendarConfig,Appointments,$timeout,$uibModalInstance,items,Appointments,CheckinService)
{

  console.log(items);
  $scope.app=Appointments.getAppointmentBySerNum(items.id);
  if(Appointments.isThereNextAppointment()){
      var nextAppointment=Appointments.getUpcomingAppointment();
      if (nextAppointment.AppointmentSerNum==$scope.app.AppointmentSerNum) {
        if(CheckinService.haveNextAppointmentToday())
        {
          $scope.showMessage=true;
          if(!CheckinService.isAlreadyCheckedin())
          {
      			CheckinService.isAllowedToCheckin().then(function(value){
      				if(value)
              {
      					$timeout(function(){
      						  $scope.enableCheckin=true;
      					})
              }else{
      					$timeout(function(){
      						  $scope.enableCheckin=false;
      					})
              }
      			});

          }else{
            $scope.enableCheckin=false;
          }
        }else{
          $scope.enableCheckin=false;
        }

      }
    }
    $scope.checkin=function()
    {
    	CheckinService.checkinToAppointment();
    	$scope.messageCheckedIn="You have successfully checked in proceed to waiting room!";
    	$timeout(function(){
    		$scope.enableCheckin=false;
    	});
    }
  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };



}]);
