var app=angular.module('MUHCPushNotifications',['ngMaterial']);
app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('teal')
  .accentPalette('orange').dark();
});
app.controller('MainController',['$scope','$timeout','$mdSidenav','$log','$rootScope',function($scope,$timeout, $mdSidenav, $log,$rootScope){
  $scope.url = "http://localhost:8888/muhc/copyServer/qplus/pushNotifications/post-push-api.php";
  $rootScope.pushNotificationApi = function(type)
  {
    $scope.params = {};
    $scope.params.NotificationType = type;
    $scope.type = type;
    switch(type){
      case 'SendNotification':
        $scope.params.DeviceType = '0';
        $scope.params.RegistrationId = '065d6f42deca7a36ee57c14384b031972622b3213819116b65dd69de09390542';
        $scope.params.NotificationTitle = "Hello";
        $scope.params.NotificationDescription = "Opal Single Device";
      break;
      case 'RoomAssignedNotification':
        $scope.params.RoomLocation = "DC 2544";
        $scope.params.PatientId = "9999996";
        $scope.params.AppointmentAriaSer = "1373467";
      break;
      case 'SendNotificationMultipleDevices':

        $scope.params.NotificationTitle = "Hello";
        $scope.params.NotificationDescription = "Opal Multiple Device";
        $scope.params.Devices = [
          {DeviceType:'0', 
          RegistrationId:'065d6f42deca7a36ee57c14384b031972622b3213819116b65dd69de09390542'},
          {DeviceType:'1', 
          RegistrationId:'cuKpVMY6z4E:APA91bHN_6hcpXxjnTpTPDAcsfjcq6OpljGdd_XMR0_snJPSwUdUme099pY5uxSuzIsdxpvWqaDipxcNIbrAOwWPvKTFgsYdjlVNqeXiETozgyvGJulKIGAWPKwjrtag8Rbl7yox_EPV'}];
      break;
      case 'SendNotificationUsingPatientId':
        $scope.params.PatientId = '9999996';
        $scope.params.NotificationTitle = "Hello";
        $scope.params.NotificationDescription = "Opal Using Patient Id";
        break;
      
    }
    $.post($scope.url,$scope.params, function(data){
      console.log(JSON.parse(data));
      $timeout(function()
      {
        $scope.response = JSON.parse(data);
      });
    });
  };

   }]);
  