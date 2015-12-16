app.controller('AccountController',function ($rootScope, $scope,User, $timeout, fieldsValidate) {

  User.getUserFromServer().then(function(response)
  {
    console.log(response);
    User.setUserSerNum(response.UserSerNum);
  });

  $scope.accountFields=User.getAccountFields();
  $scope.password=User.getUserPassword();
  $scope.username=User.AccountObject['Username'];
  var fields=User.getUserFields();
  if(fields.DoctorAriaSer){
    $scope.doctorAriaSer=fields.DoctorAriaSer;
  }

  $scope.update=function(key, value)
  {
    console.log(value);
    var result=fieldsValidate.validateString(key,value);
    $timeout(function(){
      $scope.alert={};
      $scope.alert[key]=result;
      $scope.alert[key].show=true;
    });
    if(result.type=='success')
    {
      User.updateFieldInServer(key, value);
      User.updateUserField(key,value);
      $scope.closeAllOtherFields();
    }
  };
  $scope.updatePassword=function(){
    var result=fieldsValidate.validatePassword($scope.password.oldValue,  $scope.password.newValue,$scope.password);
    $timeout(function(){
      $scope.alert={};
      $scope.alert['Password']=result;
      $scope.alert['Password'].show=true;
    });
    if(result.type=='success')
    {
      User.updateFieldInServer('Password', $scope.password.newValue);
      User.updateUserField('Password',$scope.password.newValue);
      $scope.closeAllOtherFields()
    }

    console.log(result);
  };
  $scope.$watch('uploadProfilePic',function(){
    console.log($scope.uploadProfilePic);
  });
  $scope.updateUsername=function(){
      var result=fieldsValidate.validateString('Username',  $scope.username.newValue);
      $timeout(function(){
        $scope.alert={};
        $scope.alert['Username']=result;
        $scope.alert['Username'].show=true;
      });
      if(result.type=='success')
      {
        User.updateFieldInServer('Username', $scope.username.newValue);
        User.updateUserField('Username',$scope.username.newValue);
        $scope.closeAllOtherFields();
      }
  }
  $scope.closeAllOtherFields=function(fieldName)
  {
    for (field in $scope.accountFields) {
      if(field!==fieldName){
        $scope.accountFields[field].Edit=false;
      }
    }
  }

});
