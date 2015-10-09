var myApp = angular.module('MUHCApp');
myApp.controller('NotificationsController', ['RequestToServer','Notifications', 'UpdateUI', '$scope', '$timeout','$rootScope', 'UserPreferences', 'Appointments', 'Documents','Notes', function (RequestToServer, Notifications, UpdateUI, $scope,$timeout,$rootScope, UserPreferences, Appointments, Documents, Notes) {
    //Clear Number of Notifications in menu once inside the notification center.
     $rootScope.showAlert=false;
     $rootScope.Notifications='';
     $rootScope.TotalNumberOfNews='';
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
            $scope.NotificationsArray=notificationsArray;
        });
        
        
    }

    $scope.goToNotification=function(index,notification){
            console.log(notification.Type);
            if(notification.ReadStatus==='0'){
                RequestToServer.sendRequest('NotificationRead',notification.NotificationSerNum);
                Notifications.setNotificationReadStatus(index);
            }
            if(notification.Type==='Note'){
                var note=Notes.getNoteBySerNum(notification.TypeSerNum);
                myNavigator.pushPage('./templates/notes/single-note.html', {param:note},{ animation : 'slide' } );
            }else if(notification.Type==='Appointment'){

                var app=Appointments.getAppointmentBySerNum(notification.TypeSerNum);
                myNavigator.pushPage('./templates/appointments/individual-appointment.html', {param:app},{ animation : 'slide' } );
            }else if(notification.Type==='Image'){
                console.log('doing it');
                var doc=Documents.getDocumentBySerNum(notification.TypeSerNum);
                myNavigator.pushPage('./templates/documents/individual-document.html',{param:doc},{ animation : 'slide' } );
               // menu.setMainPage('views/scansNDocuments.html', {closeMenu: true});
            }
        }
}]);

myApp.controller('IndividualNotificationController',['$scope',function($scope){
 var page = myNavigator.getCurrentPage();
 var parameters=page.options.param;
 $scope.notification=parameters;
}]);
