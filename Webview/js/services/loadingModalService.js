var app=angular.module('MUHCApp');
app.service('Modal', ['$rootScope','$timeout',function($rootScope,$timeout){
  return{
    open:function(){
      console.log('opening Modal');
      $timeout(function(){
        $rootScope.loadingModal=true;
      });

    },
    close:function()
    {
      console.log('closing Modal');
      $timeout(function(){
        $rootScope.loadingModal=false;
      });

    }
  }

}])
