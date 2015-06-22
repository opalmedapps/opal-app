angular.module('app').controller('MainController', ["$state", function ($state) {
    $state.transitionTo('logIn');
    //Firebase.getDefaultConfig().setPersistenceEnabled(true);
}]);