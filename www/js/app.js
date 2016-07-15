//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
/**
 * @author MUHC Hospital, David Herrera, John Kildea
 * @copyright 2015 MUHC Hospital
 *
 */
/**
 * @ngdoc overview
 * @name MUHCPatientApp
 * @description
 * A multiplatform application built using {@link https://cordova.apache.org Apache Cordova}. The project was  written using {@link https://angularjs.org/ AngularJS} framework , and {@link https://onsen.io/ OnsenUI} Framework. This project aims to aid patients in radiation oncology
 * at the Glen Hospital in Montreal, Quebec. The app features: Ability for patients to obtain their documents, such as their images, and test results. Look up of their Appointment calendar and details with a checkin for appointment capability, patient message system with their doctors, a treatment plan overview and progress,
    educational material about the hospital and specific to their illness, maps of the hospitals.
   Additionally the patient can make changes to their personal account, and request changes to appointments.
   They will also be able to add their upcoming appointments to their native device calendar.
   The main module for the project: {@link MUHCApp}.
   The external dependecies for the project: {@link ProjectDependencies}.
 *
 *
 *
 **/
/**
*@ngdoc object
*@name MUHCApp
*@description
*      Main module for the app, all the external angular dependencies of the application are loaded here.
*      The routes for the first initial login, loading, forgot password, and home templates are also defined here.
*@requires ProjectDependencies.lueggdirectives
*@requires ProjectDependencies.ngSanitize
*@requires ProjectDependencies.uiselect
*@requires ProjectDependencies.uirouter
*@requires ProjectDependencies.onsen
*@requires ProjectDependencies.firebase
*@requires ProjectDependencies.uibootstrap
*@requires ProjectDependencies.app.filters
*@requires ProjectDependencies.ngCordova
**/

/**
*@ngdoc object
*@name ProjectDependencies
*@description All the AngularJS external dependencies for the application:{@link ProjectDependencies.#ngAnimate}
*/

/**
*@ngdoc object
*@name ProjectDependencies.ngAnimate
*@description Depencency used to create jQuery like animations, but within the Angular framework in the project.
*Link to external reference {@link https://github.com/angular/bower-angular-animate}.
*/

/**
*@ngdoc object
*@name ProjectDependencies.lueggdirectives
*@description Dependency used in the messages page to scroll automatically as messages are added to
*conversations. Link to external reference {@link https://github.com/Luegg/angularjs-scroll-glue}.
*/

/**
*@ngdoc object
*@name ProjectDependencies.ngSanitize
*@description Dependency used to clean up and indent the html code.
 Link to external reference {@link https://github.com/angular/bower-angular-sanitize}.
*/

/**
*@ngdoc object
*@name ProjectDependencies.uiselect
*@description Dependency used in the messages view. Provides the search bar for the mailbox. Link to external reference {@link https://github.com/angular-ui/ui-select}.
*/

/**
*@ngdoc object
*@name ProjectDependencies.uirouter
*@description Dependency used in the project to provide a routing service to change views,
NOTE: Once in the Home page, the routing is dealt by onsen functions. Link to external reference {@link https://github.com/angular-ui/ui-router}.
*/

/**
*@ngdoc object
*@name ProjectDependencies.onsen
*@description Dependency used to create html/AngularJS elements that provide a native like feeling to the app. User accross all the views.
* Link to external reference {@link https://github.com/OnsenUI/OnsenUI}.
*/

/**
*@ngdoc object
*@name ProjectDependencies.firebase
*@description dependency used to create the user authorization service, if user not authorized, i.e. token expired the user will be redirected to the login screen. Used also by the {@link MUHCApp.logOutController logOutController} to unauthorized users at logout. Link to external reference {@link https://github.com/firebase/angularfire}.
*/

/**
*@ngdoc object
*@name ProjectDependencies.uibootstrap
*@description Dependency used accross all views. Provides a way to interact with bootstrap elements using the Angular Framework.
*Link to external reference {@link https://github.com/angular-ui/bootstrap}.
*/

/**
*@ngdoc object
*@name ProjectDependencies.ngCordova
*@description Dependency provides native device plugins from Cordova as modules that can be used within the Angular framework. Link to external reference {@link https://github.com/driftyco/ng-cordova}.
*/

//Routes for angular views
var myApp = angular.module('MUHCApp', ['tmh.dynamicLocale','pascalprecht.translate','ngAnimate','luegg.directives','ngSanitize','ui.router', 'onsen', 'ngTouch','firebase','ui.bootstrap','MUHCApp.filters','ngCordova','monospaced.elastic','Tek.progressBar'])
    .config(['$urlRouterProvider', 'tmhDynamicLocaleProvider','$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', function ($urlRouterProvider, tmhDynamicLocaleProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider) {

    $urlRouterProvider.otherwise('/');
    $stateProvider.state('logIn', {
        url: '/login',
        templateUrl: 'views/login/login.html',
        controller: 'LoginController',
        resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["FirebaseService", function(FirebaseService) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return FirebaseService.getAuthentication().$waitForAuth();
      }]
    }

    })
    $stateProvider.state('init', {
        url: '/',
        templateUrl: 'views/init/init-screen.html',
        controller: 'InitScreenController',
        resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["FirebaseService", function(FirebaseService) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return FirebaseService.getAuthentication().$waitForAuth();
      }]
    }

    })
    .state('loading', {
        url: '/loading',
        templateUrl: 'views/login/loading.html',
        controller: 'LoadingController',
        resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["FirebaseService", function(FirebaseService) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return FirebaseService.getAuthentication().$requireAuth();
      }]
    }
    })
        .state('Home', {
        url: '/Home',
        templateUrl: 'views/tabs/tabs.html',
        controller: 'TabsController',
           resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["FirebaseService", function(FirebaseService) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return FirebaseService.getAuthentication().$requireAuth();
      }]
    }

    })
    .state('logOut', {
        url: '/Logout',
        templateUrl: 'views/logOut.html',
        controller: 'logOutController'
  });
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: './Languages/appTranslationTablesViews/{part}/{lang}.json'
    });
    $translateProvider.preferredLanguage('en');

    tmhDynamicLocaleProvider.localeLocationPattern('./Languages/angular-locales/angular-locale_{{locale}}.js');

}]);

myApp.config( [
'$compileProvider',
function($compileProvider)
  {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile):|data:image\//);
  }
]);

myApp.config(function ($translateProvider) {
    $translateProvider.useMissingTranslationHandlerLog();
})
/**
*@ngdoc service
*@name MUHCApp.run
*@description Service is in charge of checking that the user is authorized at every state change by checking the parameters stored
in the Firebase localstorage,  Check run service on angular {{link}}
**/
myApp.run(function ($state, $stateParams,$q, $rootScope,$translate, Patient,$location) {


  $rootScope.$on('$stateChangeStart',function(event,toState,toParams)
  {
    var firstName = Patient.getFirstName();
     if((typeof firstName =='undefined'|| firstName == '')&&toState.name == 'Home')
     {
       $location.path('/init');
     }
  });
    $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
      $translate.refresh();
     });
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
      console.log(error);
  // We can catch the error thrown when the $requireAuth promise is rejected
  // and redirect the user back to the home page
  $state.go('logIn');
  //console.log('listening');
  if (error === "AUTH_REQUIRED") {
    /**
    *@ngdoc method
    *@name redirectPage
    *@methodOf MUHCApp.run
    *@returns {void} Returns a promise to perform an synch refresh page right after redirecting to the login state.
    *@description Using the angularfire, $firebaseAuth, service, it checks whether is authorized, if its not
    *it redirects the user to the logIn page, by using the login state and reloads the page.
    */
    function redirectPage(){
            var r=$q.defer();
            $state.go('logIn');
            r.resolve;
            return r.promise;
        }

        var redirect=redirectPage();
        redirect.then(setTimeout(function(){location.reload()},100));

}
});
});

var param={};
