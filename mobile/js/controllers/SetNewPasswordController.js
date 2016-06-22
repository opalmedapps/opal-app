var myApp=angular.module('MUHCApp');
myApp.controller('SetNewPasswordController',['$scope','$timeout','ResetPassword','RequestToServer','EncryptionService','FirebaseService',function($scope,$timeout,ResetPassword,RequestToServer,EncryptionService,FirebaseService){
  //Enter code here!!
  $scope.alert={};
  console.log('Inside set new password');
  $scope.$watch('ssn',function()
  {
      if($scope.alert.hasOwnProperty('type'))
      {
        delete $scope.alert.type;
        delete $scope.alert.content;
      }
  });
  var ref=new Firebase(FirebaseService.getFirebaseUrl());
  $scope.submitSSN=function(ssn){
    if(ssn==''||typeof ssn=='undefined')
    {
      $scope.alert.type='danger';
      $scope.alert.content="ERRORENTERSSNNUMBER";
    }else if(ssn.length!==12){
      $scope.alert.type='danger';
      $scope.alert.content="ERRORENTERVALIDSSN";
    }else{
      var objectToSend={};
      ResetPassword.sendRequest('VerifySSN',ssn);
      $scope.loading=true;
      var path='Users/'+ResetPassword.getUsername()+'/'+RequestToServer.getIdentifier()+'/Field/ResetPassword';
      console.log(path);
      ref.child(path).on('value',function(snapshot)
      {
        console.log(snapshot.val());
        var response=snapshot.val();

        console.log(response);
        if(response&&typeof response.type!=='undefined')
        {
          response=EncryptionService.decryptWithKey(response,ssn);
          if(response.type=='error')
          {
            $timeout(function(){
              $scope.alert.type="danger";
              $scope.alert.content="ERRORINCORRECTSSN";
              $scope.loading=false;
            });
            ref.child(path).set({});
            ref.child(path).off();
          }else{
            console.log(ssn);

            console.log(response);
            ResetPassword.setSSN(ssn);
            initNavigator.pushPage('./views/login/security-question.html',{param:{Question:response.Question}},{ animation : 'slide' } );
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
  myApp.controller('SecurityQuestionController',['$scope','$timeout','ResetPassword','RequestToServer','FirebaseService','EncryptionService',function($scope,$timeout,ResetPassword,RequestToServer,FirebaseService,EncryptionService){
    var page=initNavigator.getCurrentPage();
    var params=page.options.param;
    console.log(params);
    $scope.Question=params.Question;
    $scope.tryReset=0;
    $scope.$watch('answer',function()
  {
      if($scope.alert.hasOwnProperty('type'))
      {
        delete $scope.alert.type;
        delete $scope.alert.content;
      }
  });
    var ref=new Firebase(FirebaseService.getFirebaseUrl());
    $scope.submitAnswer=function(answer)
    {
      if(!answer||answer==''||typeof answer=='undefined')
      {
        $scope.alert.type='danger';
        $scope.alert.content='ENTERANANSWER';
      }else{
        var objectToSend={};
        answer=answer.toUpperCase();
        var hash=CryptoJS.SHA256(answer).toString();
        ResetPassword.sendRequest('VerifyAnswer',{Question:$scope.Question, Answer:hash});
        $scope.loading=true;
        var path='Users/'+ResetPassword.getUsername()+'/'+RequestToServer.getIdentifier()+'/Field/VerifySecurityAnswer';
        console.log(path);
        ref.child(path).on('value',function(snapshot)
        {
          console.log(snapshot.val());
          var response=snapshot.val();
          console.log(response);
          if(response&&typeof response.type!=='undefined')
          {
            response=EncryptionService.decryptWithKey(response,ResetPassword.getSSN());
            if(response.type=='error')
            {
              $timeout(function(){
                $scope.alert.type='danger';
                $scope.alert.content="ERRORANSWERNOTMATCH";
                $scope.tryReset++;
                if($scope.tryReset>3)
                {
                  $scope.alert.type='danger';
                  $scope.alert.content="CONTACTHOSPITAL";
                  $scope.threeTries=true;
                }
              });
              ref.child(path).set({});
              ref.child(path).off();
            }else if(response.type=='Success'){
              $timeout(function(){
                $scope.loading=false;
              });
              var hash=CryptoJS.SHA256(answer).toString();
              ResetPassword.setAnswer(hash);
              ref.child(path).set({});
              ref.child(path).off();
              initNavigator.pushPage('./views/login/new-password.html',{ animation : 'slide' } );

            }
          }
        });
      }
    }
    }]);
    myApp.controller('NewPasswordController',['$scope','$timeout','Patient','ResetPassword','FirebaseService',function($scope,$timeout,Patient,ResetPassword,FirebaseService){
      $scope.reloadPage=function()
      {
        console.log('boom');
        location.reload();
      };
      $scope.alert={};
      $scope.$watch('newValue',function()
      {
          if($scope.alert.hasOwnProperty('type'))
          {
            delete $scope.alert.type;
            delete $scope.alert.content;
          }
      });
      var ref=new Firebase(FirebaseService.getFirebaseUrl());
      $scope.submitNewPassword=function(newValue)
      {
        if(newValue==''||typeof newValue=='undefined')
        {
          $scope.alert.type='danger';
          $scope.alert.content = "ENTERVALIDPASSWORD";
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
                  $scope.alert.content="SERVERPROBLEM";
                });
            } else {
              ResetPassword.sendRequest('SetNewPassword', newValue);
              $timeout(function(){
                $scope.alert.type='success';
                $scope.alert.content="PASSWORDSUCCESSRESET";
              });
              $timeout(function(){
                location.reload();
              },2000)


            }
          });
        }
      }


      }]);
