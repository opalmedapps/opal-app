'use strict';

/**
 * @ngdoc overview
 * @name adminPanelApp
 * @description
 * # adminPanelApp
 *
 * Main module of the application.
 */
var app=angular
  .module('adminPanelApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'luegg.directives',
    'CredentialsAdminPanel',
    'ngMaterial'
  ]);

app.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
      $urlRouterProvider.otherwise("/");
  $stateProvider
    .state('home',{
      url:'/',
      templateUrl: 'views/main.html',
      controller: 'MainController',
      data:
      {
        requireLogin:true,
        label:'Home'
      }
    })
    .state('registration',{
      url:'/registration',
      templateUrl:'views/registration.html',
      controller:'RegistrationController',
      data:{
        requireLogin:true,
        label:'Register Patient'
      }
    })
    .state('patients',{
      url:'/patients',
      templateUrl:'views/patients.html',
      controller:'PatientsController',
      abstract:true,
      data:{
        requireLogin:true,
        label:'Patient'
      }
    })
    .state('messages',{
      url:'/messages',
      templateUrl:'views/messages.html',
      controller:'MessagesController',
      data:{
        requireLogin:true,
        label:'Messages'
      }
    })
    .state('feedback',{
      url:'/feedback',
      templateUrl:'views/feedback.html',
      controller:'FeedbackController',
      data:{
        requireLogin:true,
        label:'Feedback'
      }
    })
    .state('requests',{
      url:'/requests',
      templateUrl:'views/requests.html',
      controller:'RequestsController',
      data:{
        requireLogin:true,
        label:'Account Settings'
      }
    })
    .state('patients.activity',{
      url:'/patient-activity',
      templateUrl:'templates/patients/patient-activity.html',
      controller:'ActivityController',
      data:{
        requireLogin:true,
        label:'Patient Activity'
      }
    })

    .state('patients.search-patients',{
      url:'/search-patients',
      templateUrl:'templates/patients/search-patients.html',
      controller:'SearchPatientsController',
      data:{
        requireLogin:true,
        label:'Search Patients'
      }
    })
    .state('patients.patient',{
      url:'/patient',
      templateUrl:'templates/patients/individual-patient.html',
      controller:'IndividualPatientController',
      //abstract:true,
      data:{
        requireLogin:true,
        label:'Account Settings'
      }
    })
    .state('hospital-maps',{
        url:'/hospital-maps',
        templateUrl:'views/maps.html',
        controller:'MapsController',
        data:{
          requireLogin:true,
          label:'Hospital Maps'
        }

    })
    /*.state('patients.patient.general',{
      url:'/general',
      templateUrl:'templates/individual-patient/patient-general.html',
      controller:'GeneralPatientController',
      data:{
        requireLogin:true
      }
    })
    .state('patients.patient.doctors',{
      url:'/doctors',
      templateUrl:'templates/individual-patient/patient-doctors.html',
      controller:'DoctorsPatientController',
      data:{
        requireLogin:true
      }
    })
    .state('patients.patient.appointments',{
      url:'/appointments',
      templateUrl:'templates/individual-patient/patient-appointments.html',
      controller:'AppointmentsPatientController',
      data:{
        requireLogin:true
      }
    })
    .state('patients.patient.treatmentplan',{
      url:'/treatmentplan',
      templateUrl:'templates/individual-patient/patient-treatmentplan.html',
      controller:'TreatmentPlanPatientController',
      data:{
        requireLogin:true
      }
    })

    .state('patients.patient.documents',{
      url:'/documents',
      templateUrl:'templates/individual-patient/patient-documents.html',
      controller:'DocumentsPatientController',
      data:{
        requireLogin:true
      }
    })
     .state('patients.patient.messages',{
      url:'/messages',
      templateUrl:'templates/individual-patient/patient-messages.html',
      controller:'MessagesPatientController',
      data:{
        requireLogin:true
      }
    })
     .state('patients.patient.requests',{
      url:'/requests',
      templateUrl:'templates/individual-patient/patient-requests.html',
      controller:'RequestsPatientController',
      data:{
        requireLogin:true
      }
    })*/
    .state('account',{
      url:'/account',
      templateUrl: 'views/account.html',
      controller: 'AccountController',
      data:
      {
        requireLogin:true,
        label:'Account Settings'
      }
    })
  }]);
app.service('LoginModal', function ($rootScope,$uibModal)
{
  /**
  * @ngdoc service
  * @name AdminPanel.service:loginModal
  * @requires $rootScope
  * @requires $uibModal
  * @description
  * A service that opens a new login modal (also creates a promise) and sets the $rootScope.user variable when its closed(resolved). It will allow the user to use other panels besides the home view.
  */
  return function () {

        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: './views/login-modal.html',
          controller: 'LoginModalController',
          size: 'md'
        });
        return modalInstance.result.then(function (user){
          console.log(user);
        });
      };
  });

// RUN
app.run(function ($rootScope, $state,LoginModal,$timeout,URLs,api,User)
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
  $('#stateName').css('display','block');
  $state.go('home');
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams)
  {
    $rootScope.checkSession();
    var requireLogin = toState.data.requireLogin;
    if($rootScope.isUserCheckedIn())
    {
      var user=window.localStorage.getItem('OpalAdminPanelUser');
      user=JSON.parse(user);
      api.getFieldFromServer(URLs.getUserUrl(),{Username:user.Username}).then(function(responseUser){
        console.log(responseUser);
        api.getFieldFromServer(URLs.getUserInformation(),{UserType:responseUser.UserType,UserTypeSerNum:responseUser.UserTypeSerNum})
        .then(function(response){
          User.setUserFields(response,responseUser.Username,responseUser.UserSerNum);
          console.log(response);
        });
      });
    }

    $rootScope.stateName=toState.data.label;

    if (requireLogin && typeof $rootScope.currentUser === 'undefined')
    {
      console.log($rootScope.currentUser);
      event.preventDefault();
      LoginModal()
      .then(function () {
        return $state.go(toState.name, toParams);
      })
      .catch(function ()
      {
        return $state.go('home');
      });

    }
});
  });
