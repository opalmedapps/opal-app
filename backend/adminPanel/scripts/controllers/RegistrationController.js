
var app=angular.module('adminPanelApp');
app.controller('RegistrationController',['$scope','$http', 'URLs','api', '$timeout','$rootScope',function($scope,$http,URLs,api,$timeout,$rootScope){
  /*$scope.questions = [{id:1,Question:'What is the name of your first pet?'},{id:2,Question:'What is your favorite musical instrument?'},
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
  
  
  /**
   * 
   * 
   * 
   * START OF OLD REGISTRATION FORM
   * 
   * 
   * 
   * 
   * 
   */
  
  /**
  * @ngdoc controller
  * @name AdminPanel.controller:registerCtrl
  * @requires $http
  * @requires $scope
  * @description
  * Controller for the patient registration view.
  */
  $scope.message="";
  $scope.patientFound=false;
  $scope.$watch('SSN',function(newValue, oldValue){
      if(newValue!==oldValue)
      {
        $scope.alert={};
        $scope.patientRegistered=false;
      }

  });
  $scope.questions=[{id:1,Question:'What is the name of your first pet?'},{id:2,Question:'What is your favorite musical instrument?'},
                {id:3,Question:'What was the name of your favorite superhero as a child?'},{id:4,Question:'What is the first name of your childhood best friend?'},
                {id:5,Question:'What was the color of your first car?'},
                {id:6,Question:'What city were you born in?'},{id:7,Question:'What was the first name of your first roommate?'},
                {id:8,Question:'What is your favorite cartoon?'},{id:9,Question:'What was your favorite athlete as a child?'},
                {id:10,Question:'What is your father\'s middle name?'}];
$scope.totalItems=2;
$scope.pageOneUncompleted=true;
$scope.currentPage=1;
$scope.alert={};
/*//for testing purposes;
 $scope.completeRequest=function()
  {
    $scope.uid='asda-asdas-das';
    var EnableSMS=0;
    //var objectToSend=$scope.ariaResponse[0];
    objectToSend={};
    objectToSend.EnableSMS=1;
    objectToSend.Language='EN';
    objectToSend.PatientFirstName="David";
    objectToSend.PatientLastName="Herrera";
    objectToSend.Email="da@gmail.com";
    objectToSend.SSN='DEMZ98552411';
    objectToSend.PatientSer=123123;
    objectToSend.LoginId="asda-asdas-dasas";
    objectToSend.PatientId=123123;
    objectToSend.TelNumForSMS=5146419404;
    objectToSend.Alias="David Herrera";
    api.getFieldFromServer(URLs.getBasicURLPHP()+'MysqlRegister.php',objectToSend).then(function(response){
      console.log(response);
      $timeout(function(){
        $scope.alert.type=response.Type;
        $scope.alert.message=response.Response;
      });

    });

  }*/
  $scope.FindPatient= function (ssn) {
    /**
   * @ngdoc method
   * @name FindPatient
   * @methodOf AdminPanel.controller:registerCtrl
   * @description
   * .Looks for the patient in the ARIA database based on it's Medicare SSN number.It resets the form values to empty if patient is found and sets the $scope.patientFound to true.
   * @param {Object} ssn Patient's SSN
   * @returns {String} $scope.patientFound
   */
    $rootScope.checkSession();
    console.log($scope.SSN);
   $scope.message="";
     if ($scope.SSN.length>11){
        $scope.SSN=$scope.SSN.toUpperCase();
        var msURL=URLs.getBasicURLPHP()+"FindPatient.php";
        api.getFieldFromServer(msURL,{PatientSSN:ssn}).then(function(response)
        {
          if (typeof response == 'string')
          {
            response = response.replace(/\s/g, "");
          }
          $scope.ariaResponse=response;
          console.log(response);
          if(response.response=="PatientAlreadyRegistered")
          {
            $scope.patientFound=false;
            $scope.alert.type="warning";
            $scope.alert.message="Patient has already been registered to use Opal";
            $scope.patientRegistered=true;
          }
          else if ($scope.ariaResponse!=="PatientNotFound" ) {
            console.log('david herrera')
            $scope.message = "";
            $scope.Email="";
            $scope.EmailConfirm="";
            $scope.PasswordConfirm="";
            $scope.patientFound=true;
            var PatientSSN=$scope.SSN;
              $scope.Language="EN";
            }else if(typeof $scope.SSN =='undefined'||$scope.SSN==''){
             $scope.patientFound=false;
             $scope.message="SSN is invalid ! ";
            } else {
              $scope.message = "SSN was not found!\n please consult the reception.";
              $scope.patientFound=false;
            }
        });
      }
  };
  $scope.resetPassword=function()
  {
   var ref=new Firebase("https://brilliant-inferno-7679.firebaseio.com/");
    ref.resetPassword({
     email: $scope.ariaResponse.Email
   }, function(error) {
     if (error) {
       switch (error.code) {
       case "INVALID_USER":
       $timeout(function(){
         $scope.alert.type="danger";
         $scope.alert.message="Specified account does not exist, try again later!";
       });
         break;
       default:
       $timeout(function(){
         $scope.alert.type="danger";
         $scope.alert.message="Error resetting password, try again later!";
       });
     }
   } else {
     api.getFieldFromServer(URLs.getBasicURLPHP()+'test/test.php',{}).then(function(response){
       console.log(response);
       $timeout(function(){
         $scope.alert.type="success";
         $scope.alert.message="Password reset email sent successfully! Use the following code along with the temporary password sent to your email to reset your password.";
         $scope.resetCode=response;
       });
     });


  }
  });
  }

  $scope.RegisterFirstPage=function()
  {
    /**
   * @ngdoc method
   * @name Register
   * @methodOf AdminPanel.controller:registerCtrl
   * @description
   * .Creates and account in firebase and MySQL for the patient with the information provided in the HTML form.
   * @returns {String} $scope.message
   */
   var numRegex=new RegExp('^[0-9]{10}$');
   $scope.message = "";
   $scope.alert={};

    if ($scope.Email!==$scope.EmailConfirm) {
      $scope.alert.type='danger';
      $scope.alert.message="Emails do not match!";
      $scope.currentPage=1;

    }
    else if ($scope.Password !== $scope.PasswordConfirm ) {
      $scope.alert.type='danger';
      $scope.alert.message="Passwords do not match!";
      $scope.currentPage=1;

    }
    else if (typeof $scope.TelNumForSMS !=='undefined'&&$scope.TelNumForSMS!==''&&!numRegex.test($scope.TelNumForSMS)) {

        $scope.alert.type='danger';
        $scope.alert.message="Enter a valid phone number!";
        $scope.currentPage=1;
    }else{
      $scope.currentPage=2;
    }

  };
  $scope.RegisterSecondPage=function(){
    if(typeof $scope.selectedQuestion1=='undefined'||typeof $scope.selectedQuestion2=='undefined'||typeof $scope.selectedQuestion3=='undefined')
    {
        $scope.alert.type="danger";
        $scope.alert.message="Select three questions";


    }else if(typeof $scope.answerQuestion1=='undefined'||typeof $scope.answerQuestion2=='undefined'||typeof $scope.answerQuestion3=='undefined')
    {
      $scope.alert.type="danger";
      $scope.alert.message="Answer all questions";
    }else if($scope.selectedQuestion2.id===$scope.selectedQuestion3.id||$scope.selectedQuestion2.id===$scope.selectedQuestion1.id||$scope.selectedQuestion1.id===$scope.selectedQuestion3.id){
      $scope.alert.type="danger";
      $scope.alert.message="Select different questions!"
    }else if(!validate()){
      $scope.alert.type="danger"
      $scope.alert.message="Pick an answer with no special characters. i.e. *$@)|...";
    }
    else {
      $scope.message="";
      //Register to FireBase
      api.getFieldFromServer(URLs.getBasicURLPHP()+'aliasChecking.php',{Alias:$scope.Alias}).then(function(data){
        if(data=='false')
        {
             var FB=new Firebase("https://brilliant-inferno-7679.firebaseio.com/");
            FB.createUser({
              email : $scope.Email,
              password: $scope.Password
            },function(error,userData)
            {
              if (error)
              {
                switch(error.code){
                case "EMAIL_TAKEN":
                $timeout(function(){
                  $scope.alert.type='danger';
                  $scope.alert.message="Email is already registered !";
                });

                break;
                case "INVALID_EMAIL":
                $timeout(function(){
                  $scope.alert.type='danger';
                  $scope.alert.message="Invalid email, please enter a valid email!";
                });

                break;
                default :
                $timeout(function(){
                  $scope.alert.type='danger';
                  $scope.alert.message="Error has occurred creating user. Please check internet connection!";
                  });
                }
              } else {
                // Register to MySQL

                var EnableSMS=0;
                var objectToSend=$scope.ariaResponse[0];
                objectToSend.Picture = transformToHex(objectToSend.Picture);
                objectToSend.SSN=(objectToSend.SSN.split(' '))[0];
                console.log(objectToSend.SSN);
                if(typeof $scope.TelNumForSMS!=='undefined')
                {
                  objectToSend.TelNumForSMS=$scope.TelNumForSMS;
                  objectToSend.EnableSMS=1;
              }else{
                objectToSend.EnableSMS=0;
              }

              console.log(objectToSend);
                objectToSend.LoginId=userData.uid;
                objectToSend.Email=$scope.Email;
                objectToSend.Language=$scope.Language;
                objectToSend.Alias=$scope.Alias;
                objectToSend.Password=CryptoJS.SHA256($scope.Password).toString();
                objectToSend.Question1=$scope.selectedQuestion1.Question;
                objectToSend.Question2=$scope.selectedQuestion2.Question;
                objectToSend.Question3=$scope.selectedQuestion3.Question;
                objectToSend.Answer1=CryptoJS.SHA256($scope.answerQuestion1Server).toString();
                objectToSend.Answer2=CryptoJS.SHA256($scope.answerQuestion2Server).toString();
                objectToSend.Answer3=CryptoJS.SHA256($scope.answerQuestion3Server).toString();
                api.getFieldFromServer(URLs.getBasicURLPHP()+'MysqlRegister.php',objectToSend).then(function(response){
                  console.log(response);
                  $timeout(function(){
                    $scope.alert.type=response.Type;
                    $scope.alert.message=response.Response;
                  });

                });
              }
            });
        }else{
          $timeout(function(){
              $scope.alert.type='danger';
              $scope.alert.message="Pick a different alias!";
          });
        }
      });

        }
    }
    function validate()
    {
      $scope.answerQuestion1Server=$scope.answerQuestion1.toUpperCase();
      $scope.answerQuestion2Server=$scope.answerQuestion2.toUpperCase();
      $scope.answerQuestion3Server=$scope.answerQuestion3.toUpperCase();
      var reg=new RegExp('^[a-zA-Z0-9\s]*$');
      if(!reg.test($scope.answerQuestion1Server),!reg.test($scope.answerQuestion2Server),!reg.test($scope.answerQuestion3Server))
      {
        return false;
      }else{
        return true
      }



    }
    function transformToHex(str)
    {
       for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
          var tmp = bin.charCodeAt(i).toString(16);
           if (tmp.length === 1) tmp = "0" + tmp;
              hex[hex.length] = tmp;
          }
      return hex.join("");
    }
}]);
