var myApp=angular.module('MUHCApp');
/**
*
*
*
*
**/
myApp.service('Notifications',['$rootScope','$filter','RequestToServer', function($rootScope,$filter,RequestToServer){
    this.notifications={};
    function setNotificationsNumberAlert(){
        $rootScope.TotalNumberOfNews=$rootScope.Notifications+$rootScope.NumberOfNewMessages;
        if($rootScope.TotalNumberOfNews===0)$rootScope.TotalNumberOfNews='';
        if($rootScope.NumberOfNewMessages===0) $rootScope.NumberOfNewMessages='';
        if($rootScope.Notifications===0) {
            $rootScope.Notifications='';
            $rootScope.noNotifications=true;
        }else{
            $rootScope.noNotifications=false;
        }
    }
    return{
        setUserNotifications:function(notifications){
            this.Notifications=[];
            $rootScope.Notifications=0;
            if(notifications===undefined){
                setNotificationsNumberAlert();
               return;
            }
            var notificationsKeys=Object.keys(notifications);
            for (var i = 0; i < notificationsKeys.length; i++) {
                notifications[notificationsKeys[i]].DateAdded=$filter('formatDate')(notifications[notificationsKeys[i]].DateAdded);
                if(notifications[notificationsKeys[i]].ReadStatus==='0'){
                    $rootScope.Notifications+=1;
                }
                this.Notifications.push(notifications[notificationsKeys[i]]);
            };
            console.log(this.Notifications);
            this.Notifications=$filter('orderBy')(this.Notifications,'DateAdded',true);
            console.log(this.Notifications);
            setNotificationsNumberAlert();
        },
         getUserNotifications:function(){
            return this.Notifications;
        },
        setNotificationReadStatus:function(notificationIndex){
            this.Notifications[notificationIndex].ReadStatus='1';
            RequestToServer.sendRequest('Notification',this.Notifications[notificationIndex].NotificationSerNum);
        },
        getNotificationReadStatus:function(notificationIndex){
            return this.notifications[notificationIndex].ReadStatus;
        }
    };

}]);
