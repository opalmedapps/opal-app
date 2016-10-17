'use strict';

/**
 * @ngdoc function
 * @name bannersProjectApp.controller:RegistrationCtrl
 * @description
 * # RegistrationCtrl
 * Controller of the bannersProjectApp
 */
angular.module('adminPanelApp')
  .controller('RegistrationCtrl', function ($scope) {
    $scope.questions = [{id:1,Question:'What is the name of your first pet?'},{id:2,Question:'What is your favorite musical instrument?'},
                {id:3,Question:'What was the name of your favorite superhero as a child?'},{id:4,Question:'What is the first name of your childhood best friend?'},
                {id:5,Question:'What was the color of your first car?'},
                {id:6,Question:'What city were you born in?'},{id:7,Question:'What was the first name of your first roommate?'},
                {id:8,Question:'What is your favorite cartoon?'},{id:9,Question:'What was your favorite athlete as a child?'},
                {id:10,Question:'What is your father\'s middle name?'}];
    $scope.user = {
      email:"",
      reemail:"",
      password:"",
      telnum:"",
      language:"",
      alias:"",
      question1:"",
      answer1:"",
      question2:"",
      answer2:"",
      question3:"",
      answer3:"",
    };
    
    $scope.dynamic = 25;
    $scope.tabs = [{
       title:'1. E-mail'
    },{
      title:'2. Credentials',
      disabled:true
    },{
      title:'3. User Preferences',
      disabled:true
    },{
      title:'4. Security Questions',
      disabled:true
    }];
    $scope.$watch('selectedIndex',function(newValue, oldValue){
      console.log($scope.selectedIndex);
      if(typeof oldValue !== 'undefined')
      {
          $scope.dynamic +=25*(newValue-oldValue);
        
      }
    });
    $scope.registerPatient = function(user)
    {
      console.log(user);
      if(user.question1 === user.question2 || user.question1 === user.question3 || user.question3 === user.question2) $scope.incorrectQuestions = true;
      
    };
    $scope.checkPassword = function()
    {
       $scope.selectedIndex++; 
       $scope.tabs[2].disabled = false;
    };
    $scope.checkUserPreferences = function()
    {
       $scope.selectedIndex++;
       $scope.tabs[3].disabled = false;
       console.log($scope.user);
    };
    
    /*
    * Verifying e-mail address
    */
   $scope.$watchGroup(['user.email','user.reemail'],function()
   {
     $scope.errorMessageEmail = '';
   });
    //var ref = new Firebase('brilliant-inferno-7679.firebaseio.com');
    $scope.checkEmail = function(email,reemail)
    {
      if(email!==reemail)
      {
        $scope.errorMessageEmail = "**The e-mails do not match!";
      }else{
        try{
            firebase.auth().signInWithEmailAndPassword(email, 'password').catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              if (errorCode === 'auth/wrong-password')
              {
                 $scope.errorMessageEmail = "**E-mail address has already been registered!";
              }else{
                $scope.tabs[1].disabled = false;
                $scope.selectedIndex = 1;
              
              }
            });
        }catch(error){
          console.log(error);
        }
      
      }
       
    };
  });
