var myApp = angular.module('MUHCApp');
myApp.controller('NotificationsController', ['RequestToServer','Notifications', 'UpdateUI', '$scope', '$timeout','$rootScope', 'UserPreferences', 'Appointments', 'Documents','Notes', function (RequestToServer, Notifications, UpdateUI, $scope,$timeout,$rootScope, UserPreferences, Appointments, Documents, Notes) {
    //Clear Number of Notifications in menu once inside the notification center.

    /*
    *   Refreshing pull down hook functionality for the notification center
    */
        setViewNotifications();
       function loadInfo(){
                var UserData=UpdateUI.UpdateSection('Notifications');
                UserData.then(function(){
                            setViewNotifications()
                });
        };
         $scope.load = function($done) {
           RequestToServer.sendRequest('Refresh','Notifications');
          $timeout(function() {
            loadInfo();
                $done();

          }, 3000);
        };
    /*
    *   Notification Center Display View.
    */
    function setViewNotifications(){
      $rootScope.showAlert=false;
      $rootScope.Notifications='';
      $rootScope.TotalNumberOfNews='';

      $scope.NotificationsArray=[];
        var Language=UserPreferences.getLanguage();
        var notificationsArray=Notifications.getUserNotifications();
        console.log(notificationsArray);
        if(notificationsArray.length===0){
            $scope.noNotifications=true;
            return;
        }

        $scope.noNotifications=false;
        if(Language==='EN'){
            for (var i = 0; i < notificationsArray.length; i++) {
                notificationsArray[i].Name=notificationsArray[i].AliasName_EN;
                notificationsArray[i].Content=notificationsArray[i].AliasDescription_EN;
            }
        }else{
            for (var i = 0; i < notificationsArray.length; i++) {
                notificationsArray[i].Name=notificationsArray[i].AliasName_FR;
                notificationsArray[i].Content=notificationsArray[i].AliasDescription_FR;
            }
        }
        $timeout(function(){
          $scope.NotificationsArray=notificationsArray;
        });

    }

    $scope.goToNotification=function(index,notification){
        console.log(notification.Type);
        if(notification.ReadStatus==='0'){
            RequestToServer.sendRequest('NotificationRead',notification.NotificationSerNum);
            Notifications.setNotificationReadStatus(index);
        }
        generalNavigator.pushPage('./views/general/announcements/individual-notification.html',{param:notification},{ animation : 'slide' } );

    }
}]);

myApp.controller('IndividualNotificationController',['$scope','Notifications',function($scope,Notifications){

  if(typeof generalNavigator!=='undefined'&&typeof generalNavigator.getCurrentPage()!=='undefined'&&typeof generalNavigator.getCurrentPage().options.param !=='undefined')
  {
      var page=generalNavigator.getCurrentPage();
      var parameters=page.options.param;
      delete page.options.param;
      $scope.notification=parameters;
      $scope.showTab=false;
  }else{
    $scope.notification=Notifications.getLastNotification();
    console.log($scope.notification);
    $scope.showTab=true;

  }
}]);
