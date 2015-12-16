var tableFields=[  'Messages','Patient','Doctors','Diagnoses','Appointments','Notifications',
  'Tasks','Documents']
var exports=module.exports=function(type, parameters)
{
  if(type=='Login')
  {
    if(typeof parameters!='undefined'&& !parameters)
    {
      return true;
    }else{
      return false;
    }
  }else if(type=="Defined")
  {
    if(typeof parameters!=='undefined'&&!parameters)
    {
      return false;
    }else{
      return true;
    }
  }else if(type=="DefinedObjectRequest")
  {
    for(var key in parameters)
    {
      if(key!=='Parameters')
      {
        if(typeof parameters[key]=='undefined'||!parameters[key])
        {
          return false;
        }else{
          return true;
        }
      }
    }
  }
  else if(type=='RefreshArray')
  {
    for (var i = 0; i < parameters.length; i++) {
      if(tableFields.indexOf(parameters[i])==-1)
      {
        return false;
      }
    }
    return true;
  }else if(type=='RefreshField')
  {
    if(tableFields.indexOf(parameters)==-1)
    {
      return false;
    }else{
      return true;
    }
  }else if(type=='Digit')
  {

    var param=parameters.Parameters;
    console.log(param);
    var Reg=new RegExp('^[0-9]+$');
    var testValue='0';
    if(param.MessageSerNum)
    {
      testValue=param.MessageSerNum;
    }else if(param.NotificationSerNum)
    {
      testValue=param.NotificationSerNum;
    }

    if(Reg.test(testValue))
    {
      return true;
    }else{
      return false;
    }

  }
  return true;
}
