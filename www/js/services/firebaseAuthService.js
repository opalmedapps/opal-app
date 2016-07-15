
//Defines the module for the app services.
var myApp=angular.module('MUHCApp');
//Factory service made to transport the firebase link as a dependency
myApp.factory("FirebaseService", ['$firebaseAuth','UserAuthorizationInfo','$q',
  function ($firebaseAuth,UserAuthorizationInfo) {
    var firebaseUrl="https://brilliant-inferno-7679.firebaseio.com/dev/";
    var ref = new Firebase(firebaseUrl);
    return {
      getAuthentication:function()
      {
        return $firebaseAuth(ref);
      },
      getFirebaseUrl:function()
      {
        return firebaseUrl;
      },
      getFirebaseUserFieldsUrl:function()
      {
        var username=UserAuthorizationInfo.UserName;
        var deviceId=UserAuthorizationInfo.getDeviceIdentifier();
        return firebaseUrl+'Users/'+username+'/'+deviceId;
      }
    };
}]);
