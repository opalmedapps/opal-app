var myApp=angular.module('MUHCApp');
myApp.controller('TabsController',['$scope','$timeout',function($scope,$timeout){
  //Enter code here!!



  }]);
myApp.controller('personalTabController',['$scope','$timeout','Appointments','UserPlanWorkflow','$location',function($scope,$timeout,Appointments,UserPlanWorkflow,$location){
  personalNavigator.on('prepop',function(){
    $location.hash('');
  });
  $scope.personalDeviceBackButton=function()
  {
    console.log('device button pressed do nothing');

  }


  tabbar.once('postchange',function(event){
    if(typeof tabbar.parameter!=='undefined')
    {
      var param=tabbar.parameter;

      if(param=='Appointment')
      {
        delete tabbar.parameter;
        personalNavigator.pushPage('views/personal/appointments/appointments.html');
      }else if(param=='TreatmentPlan')
      {
        delete tabbar.parameter;
        personalNavigator.pushPage('views/personal/treatment-plan/treatment-plan.html');
      }
    }
  });


  //Setting up Appointments status
  if(Appointments.isThereNextAppointment())
  {
    $scope.appointmentTitle="Upcoming Appointment:";
    $scope.appointment=Appointments.getUpcomingAppointment();
  }else{
    $scope.appointmentTitle="Last Appointment:";
    $scope.appointment=Appointments.getLastAppointmentCompleted();
  }

  //Setting up status of treament plan
  if(UserPlanWorkflow.isCompleted())
  {
    console.log('completed')
    $scope.nameCurrentStage="Completed";
  }else{
    var index=UserPlanWorkflow.getNextStageIndex();
    $scope.outOf="Stage "+index+' of 6';
  }




}]);
myApp.controller('generalTabController',['$scope','$timeout',function($scope,$timeout){
//Enter code here!!
$scope.generalDeviceBackButton=function()
{
  console.log('device button pressed do nothing');

}
$scope.backButtonPressed=function()
{
  console.log('backbuttonpressed');
}


}]);
