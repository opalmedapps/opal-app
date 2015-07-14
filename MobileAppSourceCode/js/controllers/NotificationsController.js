var myApp = angular.module('app');
myApp.controller('NotificationsController', ['UserNotifications','UserDataMutable', 'UpdateUI', '$scope', '$timeout','$rootScope','$filter', function (UserNotifications, UserDataMutable, UpdateUI, $scope,$timeout,$rootScope,$filter) {
    //Clear Number of Notifications in menu once inside the notification center.
     $rootScope.showAlert=false;
     $rootScope.Notifications='';
     notificationCenter();
    /*
    *   Refreshing pull down hook functionality for the notification center
    */


       function loadInfo(){
                var UserData=UpdateUI.UpdateUserFields();
                UserData.then(function(dataValues){
                    console.log(dataValues);
                    setTimeout(function(){
                        $scope.$apply(function(){
                            notificationCenter();
                            $scope.FirstName = UserDataMutable.getFirstName();
                            $scope.LastName = UserDataMutable.getLastName();
                            $scope.Email = UserDataMutable.getEmail();
                            $scope.TelNum = UserDataMutable.getTelNum();
                            console.log($scope);
                        });
                    },50);
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
    *   Notification Center Controller. 
    */
    $scope.goToNotification=function(key){
            console.log(key);
            UserNotifications.setNotificationReadStatus(key,false);
            myNavigator.pushPage('page1.html', {param:key},{ animation : 'slide' } );
        }

    function notificationCenter(){
        var arr=UserNotifications.getUserNotifications();
        $scope.arr=arr;
        $rootScope.Notifications='';
          $scope.$watch('arr',function(){
            console.log($scope.arr);
          })
      
        $scope.noNotifications=false;
        
        var page = myNavigator.getCurrentPage();
        console.log(page.options.param);
   
   }
        function formatTime(str) {
            if(typeof str==='string'){
            var res = str.split("  ");
            var res2 = (res[0]).split("-");
            //console.log(res2);
            var res3 = (res[1]).split(":");
            var res4 = (res3[2]).split("0");
            //console.log(res4);
            var year1 = res2[0];
            var month1 = res2[1];
            var day1 = res2[2];

            var hours1 = res3[0];
            var minutes1 = res3[1];
            if (res[2] === 'PM') {

                hours1 = parseInt(hours1) + 12;
                if (hours1 === 24) {
                    hours1 -= 12;
                }
                console.log(hours1);
            }
            var d = new Date(parseInt(year1), parseInt(month1) - 1, parseInt(day1), parseInt(hours1), parseInt(minutes1));
            return d;
        }else{ return new Date();}
    }
}]);

//var myApp=angular.module('app');
myApp.controller('IndividualNotificationController',['$scope','UserNotifications',function($scope,UserNotifications){
 console.log($scope.valueData);
 var current=UserNotifications.getUserNotifications();
 var page = myNavigator.getCurrentPage();
 var parameters=page.options.param;
 $scope.header=parameters;
 $scope.$watch('header',function(){
    $scope.valueData=page.options.param;
    $scope.notification=current[parameters];
     console.log(page);

 });
 var page = myNavigator.getCurrentPage();
    console.log(page.options.param);
    console.log("adas");



}]);
