var app=angular.module('adminPanelApp');
app.service('fieldsValidate',function ($rootScope, $http,$q,api,URLs,User) {
  return{
    validateString:function(field, value, revalue)
    {
      objectResponse={};
      if(field=='FirstName'||field=='LastName')
      {
          var cap=new RegExp('^[A-z]+$');
          if(cap.test(value))
          {
            objectResponse.type='success';
            objectResponse.alertType='success';
          }else{
            objectResponse.type='error';
            objectResponse.alertType='danger';
            objectResponse.reason='The new value cannot have non-alphabetic characters';
          }
      }else if(field=='Phone')
      {
          var cap=new RegExp("^[0-9]{1,10}$");
          if(cap.test(value))
          {
            objectResponse.type='success';
            objectResponse.alertType='success';
          }else{
            objectResponse.type='error';
            objectResponse.alertType='danger';
            objectResponse.reason='Only enter the ten digits of your phone number';
          }
      }else if(field=='Username')
      {
        if(value.length>3){
          objectResponse.type='success';
          objectResponse.alertType='success';
        }else{
          objectResponse.type='error';
          objectResponse.alertType='danger';
          objectResponse.reason='Pick a username longer than 3 characters';
        }
      }
      else if(field=='Email')
      {
        var re=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        if(re.test(value))
        {
          objectResponse.type='success';
          objectResponse.alertType='success';

        }else{
          objectResponse.type='error';
          objectResponse.alertType='danger';
          objectResponse.reason='Enter an email with a valid format';
        }
      }else if(field=='Photo')
      {
        objectResponse.type='success';
        objectResponse.alertType='success';
      }
      if(objectResponse.type=='success'){
        objectResponse.reason="Field has been updated!"
      }
      return objectResponse;
    },
    validatePassword:function(oldValue,value)
    {
      var r=$q.defer();
      var objectResponse={};
      if(value.length>=4)
      {
        objectResponse.type='success';
        objectResponse.alertType='success';
        var object={};
        object.Password=oldValue;
        object.Username=User.getUsername();
        api.getFieldFromServer(URLs.getValidatePasswordUrl(),object).then(function(response){
        console.log(response);
        if(response=='Valid Password')
        {
            objectResponse.reason="Field has been updated!";
            r.resolve(objectResponse);  
        }else{
          objectResponse.type='error';
          objectResponse.alertType='danger';
          objectResponse.reason="Passwords don\'t match";
          r.resolve(objectResponse);
        }
        });
      }else{
        objectResponse.type='error';
        objectResponse.alertType='danger';
        objectResponse.reason='Password must be longer than 3 characters';
        r.resolve(objectResponse);
      }
      return r.promise;
     
    }


  };
});
