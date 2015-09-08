var app = angular.module('myApp', ['ui.router','ui.bootstrap','ngFileUpload','ngAnimate']);
// CONFIG
/**
* @ngdoc overview
* @name AdminPanel
* @requires ui.router
* @requires ui.bootstrap
* @requires ngFileUpload
* @requires ngAnimate
* @description
* This is a single-page application for the administrators of the patient's app. It uses AngularJS modules and some JQuery for the frontend and PHP for the backend.
* Everything except the controllers are written in the app.js file.
*/
  app.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
      $urlRouterProvider.otherwise("views/welcome.html");
  $stateProvider
    .state('welcome', {
      templateUrl: "views/welcome.html",
      url:'/welcome',
      controller: 'welcomeController',
      data: {
        requireLogin: false
      }
    })
    .state('registration', {
      url: '/registration',
      templateUrl:"views/register.html",
      controller:'registerCtrl',
      data: {
        requireLogin: true
      }
    })
    .state('appointments', {
      url: '/appointments',
      templateUrl:"views/requests.html",
      controller:'appointmentController',
      data: {
        requireLogin: true
      }
    })
    .state('usermanagement', {
      url: '/usermanagement',
      templateUrl:"views/usermanagement.html",
      controller:'managementCtrl',
      data: {
        requireLogin: true
      }
    })
    .state('messaging', {
      url: '/messaging',
      templateUrl:"views/message.html",
      controller:"messagesController",
      data: {
        requireLogin: true
      }
    })
    .state('admins', {
      url: '/admin',
      templateUrl:"views/admin.html",
      controller:"adminController",
      data: {
        requireLogin: true,
        requireSuperUser: true
      }
    })
    .state('feedback', {
      url: '/feedback',
      templateUrl:"views/feedback.html",
      controller:"feedbackController",
      data: {
        requireLogin: true
      }
    })

}]);

// SERVICES
app.service('loginModal', function ($rootScope,$modal)
{
  /**
  * @ngdoc service
  * @name AdminPanel.service:loginModal
  * @requires $rootScope
  * @requires $modal
  * @description
  * A service that opens a new login modal (also creates a promise) and sets the $rootScope.user variable when its closed(resolved). It will allow the user to use other panels besides the home view.
  */
  return function () {
        var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'views/login.html',
          controller: 'loginModalCtrl',
          controllerAs: 'LoginModalCtrl',
          size: 'sm',
          //scope: $rootScope
        });
        return modalInstance.result.then(function (user){
          $rootScope.currentUser=user ;

        });
      };
  });

// RUN
app.run(function ($rootScope, $state,loginModal)
{
  /**
  * @ngdoc service
  * @name AdminPanel.service:run
  * @requires $rootScope
  * @requires $loginModal
  * @requires $state
  * @description
  * Sets an interceptor for the app. Whenever a state change happens if data.requireLogin is set to true for that state it will prevent the user from switching to that view and prompt them to log in. If authenticated, it will go the chosen state, goes to home view otherwise.
  */
  $state.go('welcome');
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams)
  {
    var requireLogin = toState.data.requireLogin;

    if (requireLogin && typeof $rootScope.currentUser === 'undefined')
    {
      event.preventDefault();
      loginModal()
      .then(function () {
        return $state.go(toState.name, toParams);
      })
      .catch(function ()
      {
        return $state.go('welcome');
      });

    }
  });

});
