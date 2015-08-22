var myApp = angular.module('MUHCApp');
myApp.controller('NotificationsController', ['RequestToServer','Notifications', 'UpdateUI', '$scope', '$timeout','$rootScope', 'UserPreferences', function (RequestToServer, Notifications, UpdateUI, $scope,$timeout,$rootScope, UserPreferences) {
    //Clear Number of Notifications in menu once inside the notification center.
     $rootScope.showAlert=false;
     $rootScope.Notifications='';
     setViewNotifications();
     $scope.NotificationsArray=[];
    /*
    *   Refreshing pull down hook functionality for the notification center
    */
       function loadInfo(){
                var UserData=UpdateUI.UpdateUserFields();
                UserData.then(function(){
                    $timeout(function(){
                            setViewNotifications()
                        });
                 
                },function(error){
                    console.log(error);
                });
        };
         $scope.load = function($done) {
          $timeout(function() {
            loadInfo();
                $done();
                
          }, 2000);
        };   

    /*
    *   Notification Center Display View. 
    */
    function setViewNotifications(){
        var Language=UserPreferences.getLanguage();
        var notificationsArray=Notifications.getUserNotifications();
        
        if(notificationsArray.length===0){
            $scope.noNotifications=true;
            return;
        }
        $scope.noNotifications=false; 
        if(Language==='EN'){
            for (var i = 0; i < notificationsArray.length; i++) {
                notificationsArray[i].Name=notificationsArray[i].NotificationName_EN;
                notificationsArray[i].Description=notificationsArray[i].NotificationContent_EN;
            }
        }else{
            for (var i = 0; i < notificationsArray.length; i++) {
                notificationsArray[i].Name=notificationsArray[i].NotificationName_FR;
                notificationsArray[i].Description=notificationsArray[i].NotificationContent_FR;
            }
        }
        $timeout(function(){
            $scope.NotificationsArray=notificationsArray;
        });
    }

    $scope.goToNotification=function(index,notification){
            if(notification.ReadStatus==0){
                RequestToServer.sendRequest('NotificationRead',notification.NotificationSerNum);
            }
            Notifications.setNotificationReadStatus(index);
            myNavigator.pushPage('page1.html', {param:notification},{ animation : 'slide' } );
        }
}]);

myApp.controller('IndividualNotificationController',['$scope',function($scope){
 var page = myNavigator.getCurrentPage();
 var parameters=page.options.param;
 $scope.notification=parameters;
}]);
