var myApp=angular.module('MUHCApp');

    myApp.config(['$urlRouterProvider', 'tmhDynamicLocaleProvider','$stateProvider', '$translateProvider', '$translatePartialLoaderProvider',  function ($urlRouterProvider, tmhDynamicLocaleProvider, $stateProvider, $translateProvider, $translatePartialLoaderProvider) {
    $urlRouterProvider.otherwise('/forms/login');
    $stateProvider.state('app.Home', {
        url: '/home',
        templateUrl: './views/home/home.html',
        controller: 'HomeController'
    })
    .state('forms',{
      url:'/forms',
      templateUrl:'./views/forms.html',
      abstract:true
    })
    .state('forms.login',{
      url:'/login',
      templateUrl:'./views/forms/login.html',
      controller:'LoginController'
    })
    .state('app',{
      url:'/app',
      templateUrl:'./views/app.html',
      abstract:true
    })
    .state('app.Contacts',{
        url:'/Contacts',
        templateUrl:'./views/contacts/contacts.html',
        controller:'ContactsController'
    })
    .state('app.Projects',{
        url:'/Projects',
        templateUrl:'./views/projects/projects.html',
        controller:'ProjectsController'
    })

    .state('app.Appointments',{
        url:'/Appointments',
        templateUrl:'./views/appointments/appointments.html',
        controller:'AppointmentsController'
    })
    .state('app.Documents',{
        url:'/Documents',
        templateUrl:'./views/documents/documents.html',
        controller:'DocumentsController'
    })
    .state('app.Checkin',{
        url:'/Checkin',
        templateUrl:'./views/check-in/check-in.html',
        controller:'CheckinController'
    })
    .state('app.TreatmentPlan',{
        url:'/TreatmentPlan',
        templateUrl:'./views/treatment-plan/treatment-plan.html',
        controller:'TreatmentPlanController'
    })
    .state('app.Messages',{
        url:'/Messages',
        templateUrl:'./views/messages/messages.html',
        controller:'MessagesController'
    })
    .state('app.Maps',{
        url:'/Maps',
        templateUrl:'./views/maps/maps.html',
        controller:'MapsController'
    })
    .state('app.Notifications',{
        url:'/Notifications',
        templateUrl:'./views/notifications/notifications.html',
        controller:'NotificationsController'
    })
    .state('app.Account',{
        url:'/Account',
        templateUrl:'./views/account/account.html',
        controller:'AccountController'
    })
    .state('app.Educational',{
        url:'/Educational',
        templateUrl:'./views/educational/educational.html',
        controller:'EducationalController'
    })


$translatePartialLoaderProvider.addPart('home');
$translateProvider.useLoader('$translatePartialLoader', {
  urlTemplate: './Languages/appTranslationTablesViews/{part}/{lang}.json'
});
$translateProvider.preferredLanguage('en');

tmhDynamicLocaleProvider.localeLocationPattern('./Languages/angular-locales/angular-locale_{{locale}}.js');

}]);

myApp.run(function ($rootScope, $state, $stateParams,$q, $rootScope,$location,$translate) {

  $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
  $translate.refresh();
 });
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams)
    {
      if(!$rootScope.refresh)
      {
        console.log(toState.name);
        $rootScope.refresh=true;
        function goLogin(){
          var r=$q.defer();
            r.resolve($location.path('/login'));
          return r.promise;
        }
        goLogin().then(function(){
          location.reload();
        });



      }else{
        if(toState.name!=='forms.login')var location=window.localStorage.setItem('locationMUHCApp', toState.name);

      }
    });
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
  // We can catch the error thrown when the $requireAuth promise is rejected
  // and redirect the user back to the home page
  $state.go('forms.login');
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
        redirect.then(setTimeout(function(){location.reload() },100));

}
});
});
