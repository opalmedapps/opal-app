
//Defines the module for the app services.
var myApp=angular.module('MUHCApp');


//Factory service made to transport the firebase link as a dependency
myApp.factory("Auth", ["$firebaseAuth",
function ($firebaseAuth) {
    var ref = new Firebase("https://brilliant-inferno-7679.firebaseio.com");
    return $firebaseAuth(ref);
}]);
