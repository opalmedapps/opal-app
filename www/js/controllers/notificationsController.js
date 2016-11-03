/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var myApp = angular.module('MUHCApp');
myApp.controller('NotificationsController', ['RequestToServer','Notifications', 'UpdateUI',
  '$scope', '$timeout','$rootScope', 'UserPreferences', 'Appointments',
  'Documents','NavigatorParameters', 'Permissions', '$filter',
  function (RequestToServer, Notifications, UpdateUI, $scope,$timeout,$rootScope,
            UserPreferences, Appointments, Documents, NavigatorParameters, Permissions, $filter) {
    init();

    function init()
    {
      $scope.noNotifications = true;
      var notifications = Notifications.getUserNotifications();
      if (notifications.length > 0)  $scope.noNotifications = false;
      notifications = Notifications.setNotificationsLanguage(notifications);
      $scope.notifications = $filter('orderBy')(notifications,'notifications.DateAdded',true);
      console.log($scope.notifications);
      Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'Storage access disabled. Unable to write documents.');
    }


    //Show header function helper
    $scope.showHeader=function(index, length)
    {
      if (index === 0){
        return true;
      }
      if (index === length-1){
      }else {
        var previous = (new Date($scope.notifications[index+1].DateAdded)).setHours(0,0,0,0);
        var current = (new Date($scope.notifications[index].DateAdded)).setHours(0,0,0,0);
        //console.log(index, current !== previous);
        return (current !== previous);
      }
    };
    $scope.goToNotification=function(index,notification){
      console.log(notification);
      console.log(index);
      if(notification.ReadStatus==='0'){
        RequestToServer.sendRequest('Read',{"Id":notification.NotificationSerNum, "Field":"Notifications"});
        Notifications.readNotification(index,notification);
      }
      var post = (notification.hasOwnProperty('Post')) ? notification.Post : Notifications.getNotificationPost(notification);
      if(notification.hasOwnProperty('PageUrl'))
      {
        NavigatorParameters.setParameters({'Navigator':'personalNavigator', 'Post':post});
        personalNavigator.pushPage(notification.PageUrl);
      }else{
        var result = Notifications.goToPost(notification.NotificationType, post);
        if(result !== -1  )
        {
          NavigatorParameters.setParameters({'Navigator':'personalNavigator', 'Post':post});
          personalNavigator.pushPage(result.Url);
        }
      }
    }

  }]);

myApp.controller('IndividualNotificationController',['$scope','Notifications','NavigatorParameters',function($scope,Notifications,NavigatorParameters){
  console.log(NavigatorParameters.getParameters());

}]);
