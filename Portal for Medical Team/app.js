// app.js
var app = angular.module('myApp', ['ui.router','ui.bootstrap']);


//  CONTROLLERS
app.controller('welcomeController',function($scope,$rootScope){
  $scope.test= "testing";
  $rootScope.patients={};
});
app.controller('outboxController',function($scope){
  $scope.lol="lol";
});
app.controller('loginModalCtrl', function ($rootScope,$modalInstance) {
    console.log("controller of Login modal just instantiated!");
    $rootScope.user= {};
    $rootScope.user.users = {
      doctor1 :"password1",
      doctor2 : "password2",
      doctor3 : "password3"
    };

    $rootScope.login = function (username,password) {
      if (typeof username !== 'undefined' && $rootScope.user.users[username]===password){
      $modalInstance.close(username);
    }else {
      $rootScope.message="Credentials are not valid!";
    }
    };

    $rootScope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
});



app.controller('inboxController', function($rootScope,$scope,$location,$anchorScroll) {
      $scope.Requests={
      req1:{patientName:"Clarc rookie", reqType:"Question",reqContent:"What is the answer to this awful condition?",dateSubmitted:"20141404"},
      req2:{patientName:"Marc Antony", reqType:"Question",reqContent:"What is the answer to this real condition?",dateSubmitted:"20141404"},
      req3:{patientName:"John Bloomington", reqType:"Question",reqContent:"What is the answer to this good condition?",dateSubmitted:"20151404"},
      req4:{patientName:"Fred Flinstone", reqType:"Question",reqContent:"What is the answer to this bad condition?",dateSubmitted:"20141204"},
      req5:{patientName:"Rodrigo Mendez", reqType:"ChangeAppointment",reqContent:"Can I change my appointment please please please please please PLEASE PLEASE PLEASEEEEEEEEEEE?",dateSubmitted:"20141404"},
      req6:{patientName:"Albus Dumbledore", reqType:"Question",reqContent:"What is the answer to this good condition?",dateSubmitted:"20141004"},
      req7:{patientName:"Ian Summerhandler", reqType:"Question",reqContent:"What is the answer to this bad condition?",dateSubmitted:"20141204"},
      req8:{patientName:"Fred Flinstone", reqType:"Question",reqContent:"What is the answer to this bad condition?",dateSubmitted:"20141204"},
      req9:{patientName:"Rodrigo Mendez", reqType:"ChangeAppointment",reqContent:"Can I change my appointment please please please please please PLEASE PLEASE PLEASEEEEEEEEEEE?",dateSubmitted:"20141404"},
      req10:{patientName:"Albus Dumbledore", reqType:"Question",reqContent:"What is the answer to this good condition?",dateSubmitted:"20141004"},
      req11:{patientName:"Ian Summerhandler", reqType:"Question",reqContent:"What is the answer to this bad condition?",dateSubmitted:"20141204"},
      req12:{patientName:"Jian Ghomayshi", reqType:"ChangeAppointment",reqContent:"Can I change the appointment?",dateSubmitted:"20151404"}
      };
    console.log($scope.Requests);
    $scope.setCurrentReq = function (x) {
      $scope.key=x;
    };
    $scope.gotoTop = function() {
      if ($location.hash() !== "listTop" ){
        $location.hash("listTop");
      } else {
        $anchorScroll();
      }
    };
});

// CONFIG
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
    .state('inbox', {
      url: '/inbox',
      templateUrl:"views/MedicalPortal.html",
      controller:'inboxController',
      data: {
        requireLogin: true // this property will apply to all children of 'app'
      }
    })
    .state('outbox', {
      url: '/outbox',
      templateUrl:"views/outbox.html",
      controller:"outboxController",
      data: {
        requireLogin: true // this property will apply to all children of 'app'
      }
    })

}]);

// SERVICES

app.service('loginModal', function ($rootScope,$modal) { // inject $modal
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
app.run(function ($rootScope, $state,loginModal) { // inject loginModal
  $state.go('welcome');
  console.log("just changed to /welcome");
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    var requireLogin = toState.data.requireLogin;

    if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
      event.preventDefault();
      console.log("preventedDefault");
      loginModal()
      .then(function () {
        return $state.go(toState.name, toParams);
      })
      .catch(function () {
        return $state.go('welcome');
      });

    }
  });

});
