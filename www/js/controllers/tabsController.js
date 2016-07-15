var myApp=angular.module('MUHCApp');
myApp.controller('TabsController',['$scope','$timeout','$translate','$translatePartialLoader',function($scope,$timeout,$translate,$translatePartialLoader){
  //Enter code here!!
  console.log('inside tabs controller');
  $translatePartialLoader.addPart('all-views');


  }]);
myApp.controller('personalTabController',['$scope','$timeout','Appointments','$translate','UserPlanWorkflow','TxTeamMessages','Documents','$location','RequestToServer','UpdateUI','NavigatorParameters','Notifications','Questionnaires',function($scope,$timeout,Appointments,$translate, UserPlanWorkflow,TxTeamMessages,Documents,$location,RequestToServer,UpdateUI,NavigatorParameters,Notifications,Questionnaires){
  
  //Its possible for a notification to have been read such as a document since this controller has already been instantiated
  // we will have to check to sync that number on the badges for the tabs on the personal page.
  personalNavigator.on('prepop',function(){
    setNewsNumbers();
  });
  $scope.load = function($done) {
      RequestToServer.sendRequest('Refresh','All');
      UpdateUI.update('All').then(function()
      {
          updated=true;
          $timeout(function()
          {
            initPersonalTab();
          });
          $done();
      });
      $timeout(function(){
          $done();
      },5000);
    };
  //Sets appointments and treatment plan stage tab
  initPersonalTab();

  //Setting up numbers on the
  function setNewsNumbers()
  {
    $scope.appointmentsUnreadNumber = Appointments.getNumberUnreadAppointments();
    $scope.documentsUnreadNumber = Documents.getNumberUnreadDocuments();
    $scope.txTeamMessagesUnreadNumber = TxTeamMessages.getUnreadTxTeamMessages();
    $scope.notificationsUnreadNumber = Notifications.getNumberUnreadNotifications();
    $scope.questionnairesUnreadNumber = Questionnaires.getNumberOfUnreadQuestionnaires();
  }

  //Must have a function to go to status as we must set the navigator as a parameter
  $scope.goToStatus = function()
  {
    NavigatorParameters.setParameters({'Navigator':'personalNavigator'});
    personalNavigator.pushPage('views/home/status/status.html');
  };

  //Creating a device button
  var backButtonPressed = 0;
  $scope.personalDeviceBackButton=function()
  {
    backButtonPressed++;
    if(backButtonPressed==2)
    {
      tabbar.setActiveTab(0);
      backButtonPressed = 0;
    }
  };

  //Init function for this controller
  function initPersonalTab()
  {
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
      //Setting up badges
      setNewsNumbers();
  }
}]);


myApp.controller('generalTabController',['$scope','$timeout','Announcements','RequestToServer','UpdateUI','Notifications','NavigatorParameters','$filter',function($scope,$timeout,Announcements,RequestToServer,UpdateUI,Notifications,NavigatorParameters,$filter){
var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
setNewsNumbers();
generalNavigator.on('prepop',function(){
  setNewsNumbers();
});

$scope.load = function($done) {
      RequestToServer.sendRequest('Refresh','All');
      UpdateUI.update('All').then(function()
      {
          updated=true;
          $timeout(function()
          {
            setNewsNumbers();
          });
          $done();
      });
      $timeout(function(){
          $done();
      },5000);
    };
    
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
};
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
