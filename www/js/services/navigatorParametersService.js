var myApp=angular.module('MUHCApp');
myApp.service('NavigatorParameters',function(){
  //Enter code here!!
  var parameters={};  
  return{
    setParameters:function(param)
    {
      parameters=param;
    },
    getParameters:function()
    {
      var object=angular.copy(parameters);
      parameters={};
      return object;
    },
    getNavigator:function(navigatorName)
    {
      return listNavigators[navigatorName];
    }
  }


  });
