var exports=module.exports={};
var Q=require('q');
var api=require('./api.js');
var validate=require('./validate.js');
exports.update=function(requestObject)
{
  var r=Q.defer();
  var type=requestObject.Request;
  var UserID=requestObject.UserID;
  var parameters=requestObject.Parameters;
  var objectToFirebase={};
  //Types account change, Notification read, messages read, checkin,
  //Message
  if(!validate('DefinedObjectRequest',requestObject))
  {
    r.reject('Invalid');
  }
  if(type=='MessageRead')
  {
    api.readMessage(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='NotificationRead')
  {
    api.readNotification(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Checkin')
  {
    api.checkIn(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Logout')
  {
    api.logActivity(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Message')
  {
    api.sendMessage(requestObject).then(function(response){

        r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else  if(type=='AccountChange')
  {
    api.accountChange(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Feedback')
  {
    api.inputFeedback(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }
  return r.promise;
};
