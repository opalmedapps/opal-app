var myApp=angular.module('adminPanelApp');
myApp.controller('ToastController',function($mdToast,$scope){
  $scope.closeToast=function()
  {
    $mdToast.hide();
  }
});
myApp.controller('AccountController',function ($rootScope, URLs,$scope,User, $timeout, fieldsValidate,$mdToast,$document) {
  $scope.showCustomToast = function() {
    $mdToast.show({
      controller:'ToastController',
      templateUrl: 'toast-template.html',
      parent : $document[0].querySelector('#showToast'),
      hideDelay: 3000,
      position: 'top right'
    });
  };
  setUpAccountSettings();
  $scope.update=function(key, value)
  {
    $rootScope.checkSession()
    console.log(value);
    var result=fieldsValidate.validateString(key,value);
    /*$timeout(function(){
      $scope.alertField={};
      $scope.alertField[key]=result;
      $scope.alertField[key].show=true;
    });*/
    if(result.type=='success')
    {
      User.updateFieldInServer(key, value).then(function(data)
      {
        $timeout(function(){
          if(data=='Update Complete')
          {
            $scope.alertField={};
            $scope.alertField[key]=result;
            $scope.alertField[key].show=true;
            User.updateUserField(key,value);
            $scope.accountFields[key].Value=value;
            $scope.accountFields[key].newValue=value;
            $scope.showCustomToast();
          }
        });
      },function(error){
        $timeout(function(){
              $scope.alertField={};
              $scope.alertField[key].alertType='danger';
              $scope.alertField[key].reason='Server error';
              $scope.alertField[key].show=true;
        })
      });
      //User.updateUserField(key,value);
      //$scope.accountFields[key].Value=value;
      //$scope.accountFields[key].newValue=value;
      //$scope.closeAllOtherFields();
    }else{
      $timeout(function(){
        $scope.alertField={};
        $scope.alertField[key]=result;
        $scope.alertField[key].show=true;
      });
    }
  };
  $scope.updatePassword=function(){
    $rootScope.checkSession();
    fieldsValidate.validatePassword($scope.accountFields['Password'].Value,$scope.accountFields['Password'].newValue).then(function(result){
      if(result.type=='success')
      {
        User.updateFieldInServer('Password', $scope.accountFields['Password'].newValue).then(
          function(data){
            if(data=='Update Complete')
            {
              $timeout(function(){
                $scope.alertField={};
                $scope.alertField['Password']=result;
                $scope.alertField['Password'].show=true;
                //User.updateUserField('Password',$scope.password.newValue);
                $scope.accountFields['Password'].Value='';
                $scope.accountFields['Password'].newValue='';
                $scope.showCustomToast();
              })
            }
            
          },
          function(error){
            $timeout(function(){
              $scope.alertField={};
              $scope.alertField[key].alertType='danger';
              $scope.alertField[key].reason='Server error';
              $scope.alertField[key].show=true;
            });
            
          })

      }else{
        $timeout(function(){
          $scope.alertField={};
          $scope.alertField['Password']=result;
          $scope.alertField['Password'].show=true;
        });
      }
      console.log(result);
    });


  };
  $scope.$watch('uploadProfilePic',function(){
    console.log($scope.uploadProfilePic);
  });

  $scope.updateUsername=function(){
      var result=fieldsValidate.validateString('Username',  $scope.accountFields['Username'].newValue);
      if(result.type=='success')
      {
        User.updateFieldInServer('Username', $scope.accountFields['Username'].newValue).then(
          function(data){
            $timeout(function(){
              User.updateUserField('Username',$scope.accountFields['Username'].newValue);
              $scope.accountFields['Username'].Value=$scope.accountFields['Username'].newValue;
              $scope.accountFields['Username'].newValue=$scope.accountFields['Username'].newValue;
              $scope.alertField={};
              $scope.alertField['Username']=result;
              $scope.alertField['Username'].show=true;
              $scope.showCustomToast();
            });
          },function(error){
              $timeout(function(){
                $scope.alertField={};
                $scope.alertField[key].alertType='danger';
                $scope.alertField[key].reason='Server error';
                $scope.alertField[key].show=true;
              });
          });
        
        //$scope.closeAllOtherFields();
      }else{
        $timeout(function(){
          $scope.alertField={};
          $scope.alertField['Username']=result;
          $scope.alertField['Username'].show=true;
        });
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
  function setUpAccountSettings()
  {

    var userFields=User.getUserFields();
    $scope.userFields=userFields;
    console.log(userFields);
    var accountObject={};
    $scope.alertField={};
    for (var key in userFields) { 
      $scope.alertField[key]={};
      $scope.alertField[key].alertType='';
      $scope.alertField[key].reason='';
      $scope.alertField[key].show=false;
      if(key!=='Image'&&key!=='UserTypeSerNum'&&key!=='DoctorAriaSer'&&key!=='Role'&&key!=='StaffID')
      {
        accountObject[key]=
        {
          'Value':userFields[key],
          'Edit':false,
          'newValue':userFields[key]
        }
      }else if(key=='Image')
      {
        accountObject[key]=
        {
          'Value':URLs.getDoctorImageUrl()+userFields[key],
          'Edit':false,
          'newValue':URLs.getDoctorImageUrl()+userFields[key]
        }
      }else if(key=='Password')
      {
        accountObject[key]=
        {
          'Value':'',
          'Edit':false,
          'newValue':''
        }
      }
    };
    $scope.accountFields=accountObject;
  }
})

