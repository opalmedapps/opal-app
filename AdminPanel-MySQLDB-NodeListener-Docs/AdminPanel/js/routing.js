var myApp = angular.module('MUHCApp', ['tmh.dynamicLocale','pascalprecht.translate','ngAnimate','luegg.directives','ngSanitize','ui.select','ui.router', 'onsen', 'firebase','ui.bootstrap','MUHCApp.filters','ngCordova','monospaced.elastic'])
    .config(['$urlRouterProvider', 'tmhDynamicLocaleProvider','$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', function ($urlRouterProvider, tmhDynamicLocaleProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider) {
    
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('Home', {
        url: '/',
        templateUrl: 'templates/logIn.html',
        controller: 'LoginController'
    })
    .state('Patients',{
    	url: '/Patients',
        templateUrl: 'templates/logIn.html',
        controller: 'LoginController',
        abstract:true
    })
       .state('Requests',{
    	url: '/Requests',
        templateUrl: 'templates/logIn.html',
        controller: 'LoginController'
    })
    .state('Messages',{
    	url: '/Messages',
        templateUrl: 'templates/logIn.html',
        controller: 'LoginController'
    })
    .state('Patients.Patient',{
    	url: '/Patient',
    	abstract:true,
        templateUrl:'',
    	views:{
    		templateUrl: 'templates/logIn.html',
        	controller: 'LoginController'
    	}
        
    })
}]);
/*    .state('Patient',{
    	url: '/',
        templateUrl: 'templates/logIn.html',
        controller: 'LoginController'
    })
    .state('Patient',{
    	url: '/',
        templateUrl: 'templates/logIn.html',
        controller: 'LoginController'
    })
    .state('Patient',{
    	url: '/',
        templateUrl: 'templates/logIn.html',
        controller: 'LoginController'
    })
    .state('Patient',{
    	url: '/',
        templateUrl: 'templates/logIn.html',
        controller: 'LoginController'
    })
var myApp = angular.module('MUHCApp', ['tmh.dynamicLocale','pascalprecht.translate','ngAnimate','luegg.directives','ngSanitize','ui.select','ui.router', 'onsen', 'firebase','ui.bootstrap','MUHCApp.filters','ngCordova','monospaced.elastic'])
    .config(['$urlRouterProvider', 'tmhDynamicLocaleProvider','$stateProvider', '$translateProvider', '$translatePartialLoaderProvider', function ($urlRouterProvider, tmhDynamicLocaleProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider) {
    
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('logIn', {
        url: '/',
        templateUrl: 'templates/logIn.html',
        controller: 'LoginController'

    }).state('forgotPassword', {
        url: '/ForgotPassword',
        templateUrl: 'views/logIn.forgot.html',
        controller: 'forgotPasswordController'
    
    })
    .state('loading', {
        url: '/loading',
        templateUrl: 'templates/loading.html',
        controller: 'LoadingController'
    })
        .state('Home', {
        url: '/Home',
        templateUrl: 'templates/menu.html',
        controller: 'HomeController'
       
    }).state('logOut', {
        url: '/LogOut',
        templateUrl: 'templates/logOut.html',
        controller: 'logOutController'

    }).state('Portal', {
        url: '/Portal',
        templateUrl: 'templates/patientPortal.html',
        controller: 'PatientPortalController'
    });
    $translatePartialLoaderProvider.addPart('home');
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: './Languages/appTranslationTablesViews/{part}/{lang}.json'
    });
    $translateProvider.preferredLanguage('en');

    tmhDynamicLocaleProvider.localeLocationPattern('./Languages/angular-locales/angular-locale_{{locale}}.js');

}]);
*/
myApp.run(function ($rootScope, $state, $stateParams,$q, $rootScope,$translate) {

    $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
      $translate.refresh();
     });
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
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

