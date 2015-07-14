//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//


//Routes for angular views
var myApp = angular.module('app', [
    'ui.router', 'onsen', 'firebase','highcharts-ng','ui.bootstrap','app.filters','ngCordova'])
    .config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('logIn', {
        url: '/',
        templateUrl: 'templates/logIn.html',
        controller: 'loginController',
        resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$waitForAuth();
      }]
    }

    }).state('forgotPassword', {
        url: '/ForgotPassword',
        templateUrl: 'views/logIn.forgot.html',
        controller: 'forgotPasswordController',
        resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$waitForAuth();
      }]
    }
    })
    .state('loading', {
        url: '/loading',
        templateUrl: 'templates/loading.html',
        controller: 'loadingController',
        resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$requireAuth();
      }]
    }
    })
        .state('Home', {
        url: '/Home',
        templateUrl: 'templates/menu.html',
        controller: 'homeController',
           resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$requireAuth();
      }]
    }
       
    }).state('logOut', {
        url: '/LogOut',
        templateUrl: 'templates/logOut.html',
        controller: 'logOutController',
           resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$requireAuth();
      }]
    }
    });


}]);

