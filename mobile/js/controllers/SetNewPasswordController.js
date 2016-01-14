var myApp=angular.module('MUHCApp');
myApp.controller('SetNewPasswordController',['$scope','$timeout','ResetPassword','RequestToServer','EncryptionService',function($scope,$timeout,ResetPassword,RequestToServer,EncryptionService){
  //Enter code here!!
  $scope.alert={};
  console.log('Inside set new password');
  var ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/');
  $scope.submitSSN=function(ssn){
    if(ssn==''||typeof ssn=='undefined')
    {
      $scope.alert.type='danger';
      $scope.alert.content='Enter an SSN number';
    }else if(ssn.length!==12){
      $scope.alert.type='danger';
      $scope.alert.content='Enter a valid SSN number';
    }else{
      var objectToSend={};
      ResetPassword.sendRequestReset(ssn);
      $scope.loading=true;
      var path='Users/'+ResetPassword.getUsername()+'/'+RequestToServer.getIdentifier()+'/ResetPassword';
      console.log(path);
      ref.child(path).on('value',function(snapshot)
      {
        console.log(snapshot.val());
        var response=snapshot.val();
        console.log(response);
        if(response&&typeof response.type!=='undefined')
        {
          if(response.type=='error')
          {
            $timeout(function(){
              $scope.alert.type="danger";
              $scope.alert.content="The SSN enter does not much our records, try again";
              $scope.loading=false;
            });
            ref.child(path).set({});
            ref.child(path).off();
          }else{
            console.log(ssn);
            var decryptObject=EncryptionService.decryptWithKey(response,ssn);
            console.log(decryptObject);
            navigatorForms.pushPage('./templates/forms/security-question.html',{param:{Question:decryptObject.Question,Answer:decryptObject.Answer}},{ animation : 'slide' } );
            $timeout(function(){
              $scope.loading=false;
            });
            ref.child(path).set({});
            ref.child(path).off();
          }
        }



      });
    }



  };

  }]);
  myApp.controller('SecurityQuestionController',['$scope','$timeout','ResetPassword',function($scope,$timeout,ResetPassword){
    var page=navigatorForms.getCurrentPage();
    var params=page.options.param;
    console.log(params);
    $scope.Question=params.Question;
    $scope.tryReset=0;
    $scope.submitAnswer=function(answer)
    {
      if(answer==''||typeof answer=='undefined')
      {
        $scope.alert.type='danger';
        $scope.alert.content='Enter an answer';
      }else{
        answer=answer.toUpperCase();
        var hash=CryptoJS.SHA256(answer).toString();
        ResetPassword.setAnswer(params.Answer);
        if(hash==params.Answer)
        {
          navigatorForms.pushPage('./templates/forms/new-password.html',{ animation : 'slide' } );
        }else{
          $scope.alert.type='danger';
          $scope.alert.content='Answer does not match our records';
          $scope.tryReset++;
          if($scope.tryReset>3)
          {
            $scope.alert.type='danger';
            $scope.alert.content='Contact the hospital for assitance';
            $scope.threeTries=true;
          }
        }

      }
    }
    }]);
    myApp.controller('NewPasswordController',['$scope','$timeout','Patient','ResetPassword',function($scope,$timeout,Patient,ResetPassword){
      $scope.reloadPage=function()
      {
        console.log('boom');
        location.reload();
      }
      $scope.alert={};
      var ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/');
      $scope.submitNewPassword=function(newValue)
      {
        if(newValue==''||typeof newValue=='undefined')
        {
          $scope.alert.type='danger';
          $scope.alert.content='Enter a valid password';
        }else{
          ref.changePassword({
            email: ResetPassword.getEmail(),
            oldPassword: ResetPassword.getTemporaryPassword(),
            newPassword: newValue
          }, function(error) {
            if (error) {
              console.log(error);
                $timeout(function(){
                  $scope.alert.type='danger';
                  $scope.alert.content='Server Problem, contact hospital';
                });
            } else {
              ResetPassword.sendNewPasswordToServer(newValue);
              $timeout(function(){
                $scope.alert.type='success';
                $scope.alert.content='Password has been successfully changed, redirecting to login';
              });
              $timeout(function(){
                location.reload();
              },2000)


            }
          });
        }
      }


      }]);
