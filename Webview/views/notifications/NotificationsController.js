angular.module('MUHCApp')
.controller('NotificationsController', ['$scope','$state', '$timeout','$filter', 'UserAuthorizationInfo','Notifications', 'UserPreferences', 'RequestToServer','Appointments','Documents','$rootScope',function ($scope,$state, $timeout,$filter, UserAuthorizationInfo,Notifications,UserPreferences,RequestToServer,Appointments,Documents,$rootScope) {

setViewNotifications();

function setViewNotifications(){
  $rootScope.Notifications='';
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
            notificationsArray[i].Name=notificationsArray[i].NotificationPublishedType_EN;
            notificationsArray[i].Content=notificationsArray[i].NotificationContent_EN;
        }
    }else{
        for (var i = 0; i < notificationsArray.length; i++) {
            notificationsArray[i].Name=notificationsArray[i].NotificationPublishedType_FR;
            notificationsArray[i].Content=notificationsArray[i].NotificationContent_FR;
        }
    }
    console.log(notificationsArray);
    $timeout(function(){
        $scope.notifications=notificationsArray;
    });


}

$scope.goToNotification=function(index,notification)
{
        console.log(notification.Type);
        if(notification.ReadStatus==='0'){
            RequestToServer.sendRequest('NotificationRead',notification.NotificationSerNum);
            Notifications.setNotificationReadStatus(index);
        }
        if(notification.Type==='Appointment'){
            var app=Appointments.getAppointmentBySerNum(notification.TypeSerNum);
            $state.go('app.Appointments');
        }else if(notification.Type==='Document'){
            console.log('doing it');
            var doc=Documents.getDocumentBySerNum(notification.TypeSerNum);
            $state.go('app.Documents');
           // menu.setMainPage('views/scansNDocuments.html', {closeMenu: true});
        }

}




}]);
