angular.module('app').controller('MainController', ['UserDataMutable',"$state",'$rootScope', function (UserDataMutable,$state,$rootScope) {
    $state.transitionTo('logIn');
    //Firebase.getDefaultConfig().setPersistenceEnabled(true);
    $rootScope.showAlert=true;
    $rootScope.alerts=[];
    $rootScope.Notifications=' ';
    $rootScope.closeAlert = function () {
   
        $rootScope.showAlert=false;
    };
  /*  document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady(){
    document.addEventListener("backbutton", function(e){
       if(){
           e.preventDefault();
           navigator.app.exitApp();
       }
       else {
           navigator.app.backHistory()
       }
    }, false);
}*/


    
     
}]);