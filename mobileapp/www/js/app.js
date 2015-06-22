//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//


//Routes for angular views
var myApp = angular.module('app', [
    'ui.router', 'onsen', 'firebase'])
    .config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/Login');
    $stateProvider.state('logIn', {
        url: '/',
        templateUrl: 'templates/logIn.html',
        controller: 'loginController'
    }).state('loading', {
        url: '/loading',
        templateUrl: 'templates/loading.html',
        controller: 'loadingController'
    })
        .state('Home', {
        url: '/Home',
        templateUrl: 'templates/menu.html',
        controller: 'homeController'
    })
        .state('logOut', {
        url: '/LogOut',
        templateUrl: 'templates/logOut.html',
        controller: 'logOutController'
    }).state('logIn.enter', {
        url: '/Login',
        templateUrl: 'views/logIn.enter.html',
        controller: 'loginEnterController'
    }).state('logIn.forgot', {
        url: '/ForgotPassword',
        templateUrl: 'views/logIn.forgot.html',
        controller: 'forgotPasswordController'
    });


}]);

