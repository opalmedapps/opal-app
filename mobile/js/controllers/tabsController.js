var myApp=angular.module('MUHCApp');
myApp.controller('TabsController',['$scope','$timeout','$translate','$translatePartialLoader',function($scope,$timeout,$translate,$translatePartialLoader){
  //Enter code here!!
  console.log('inside tabs controller');
  $translatePartialLoader.addPart('all-views');


  }]);
myApp.controller('personalTabController',['$scope','$timeout','Appointments','$translate','UserPlanWorkflow','TxTeamMessages','Documents','$location','RequestToServer','UpdateUI','NavigatorParameters','Notifications',function($scope,$timeout,Appointments,$translate, UserPlanWorkflow,TxTeamMessages,Documents,$location,RequestToServer,UpdateUI,NavigatorParameters,Notifications){
  personalNavigator.on('prepop',function(){
    setNewsNumbers();
  });
  setNewsNumbers();
  //Setting up numbers on the
  function setNewsNumbers()
  {
    $scope.appointmentsUnreadNumber = Appointments.getNumberUnreadAppointments();
    $scope.documentsUnreadNumber = Documents.getNumberUnreadDocuments();
    $scope.txTeamMessagesUnreadNumber = TxTeamMessages.getUnreadTxTeamMessages();
    $scope.notificationsUnreadNumber = Notifications.getNumberUnreadNotifications();
  }
  $scope.goToStatus = function()
  {
    NavigatorParameters.setParameters({'Navigator':'personalNavigator'});
    personalNavigator.pushPage('views/home/status/status.html');
  }
  $scope.personalDeviceBackButton=function()
  {
    console.log('device button pressed do nothing');

  }
  $scope.load = function($done) {
    RequestToServer.sendRequest('Refresh','Appointments');
    var updated=false;
    UpdateUI.update('Appointments').then(function()
    {
      $timeout(function(){
        updated=true;
        console.log(Appointments.getUserAppointments());
        $done();
      });
    });
    $timeout(function(){
        $done();
    },5000);
  };

  //Setting up Appointments status
  if(Appointments.isThereAppointments())
  {
    if(Appointments.isThereNextAppointment())
    {
      $scope.appointmentTitle="UPCOMINGAPPOINTMENT";
      $scope.appointment=Appointments.getUpcomingAppointment();
    }else{
      $scope.appointmentTitle= "LASTAPPOINTMENT";
      $scope.appointment=Appointments.getLastAppointmentCompleted();
    } 
  }
  

  //Setting up status of treament plan
  if(UserPlanWorkflow.isCompleted())
  {
    console.log('completed')
    $scope.nameCurrentStage="COMPLETED";
  }else{
    var index=UserPlanWorkflow.getNextStageIndex();
    $scope.outOf={index:index, total:6};
  }




}]);
myApp.controller('generalTabController',['$scope','$timeout','Announcements','Notifications','NavigatorParameters','$filter',function($scope,$timeout,Announcements,Notifications,NavigatorParameters,$filter){
var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

setNewsNumbers();
generalNavigator.on('prepop',function(){
  setNewsNumbers();
});
$scope.goToPatientCharter = function()
{
    console.log('heading to charter');
    NavigatorParameters.setParameters('initNavigator');
    generalNavigator.pushPage('./views/general/charter/charter.html');
};
$scope.goToGeneralSettings = function()
{
  NavigatorParameters.setParameters({'Navigator':'generalNavigator'});
  generalNavigator.pushPage('./views/init/init-settings.html')
};
$scope.reportIssuesMail = function()
{

       if(app){
           var email = {
            to: 'muhc.app.mobile@gmail.com',
            cc: '',
            bcc: [],
            subject: $filter("translate")("OPALPROBLEMSUBJECT"),
            body: '',
            isHtml: true
          };
          cordova.plugins.email.isAvailable(function(isAvailable){
              if(isAvailable)
              {
                cordova.plugins.email.open(email,function(sent){
                  console.log('email ' + (sent ? 'sent' : 'cancelled'));
                },this);
              }else{
                console.log('is not available');
              }
          });
       } 
}
$scope.goToParking = function()
{
  NavigatorParameters.setParameters('generalNavigator');
  generalNavigator.pushPage('views/general/parking/parking.html')
}
function setNewsNumbers()
{
  $scope.announcementsUnreadNumber = Announcements.getNumberUnreadAnnouncements();
}
$scope.generalDeviceBackButton=function()
{
  console.log('device button pressed do nothing');

};
$scope.backButtonPressed=function()
{
  console.log('backbuttonpressed');
};


}]);
