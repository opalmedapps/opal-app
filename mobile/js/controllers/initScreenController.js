var app = angular.module('MUHCApp');

app.controller('InitScreenController',function($scope, $timeout, NavigatorParameters,$translatePartialLoader, UserPreferences, $filter)
{
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
   
    setTimeout(function(){
       $("#listInitApp").css({display:'block'});
    },10);
    $translatePartialLoader.addPart('login');
    UserPreferences.initializeLanguage();
    $scope.goToParking = function()
    {
        console.log('heading there')
        NavigatorParameters.setParameters('initNavigator');
        initNavigator.pushPage('./views/general/parking/parking.html',{animation:'lift'})
    }
    $scope.goToGeneralSettings = function()
    {
      NavigatorParameters.setParameters({'Navigator':'initNavigator'});
      initNavigator.pushPage('./views/init/init-settings.html',{animation:'lift'})
    }
    $scope.goToPatientCharter = function()
    {
        console.log('heading to charter');
        NavigatorParameters.setParameters('initNavigator');
        initNavigator.pushPage('./views/general/charter/charter.html',{animation:'lift'})
    };
    $scope.reportIssuesMail = function()
    {
       if(app){
           var email = {
            to: 'muhc.app.mobile@gmail.com',
            cc: '',
            bcc: [],
            subject: $filter("translate")("OPALPROBLEMSUBJECT"),
            body: '',
            isHtml: true
          };
          cordova.plugins.email.isAvailable(function(isAvailable){
              if(isAvailable)
              {
                cordova.plugins.email.open(email,function(sent){
                  console.log('email ' + (sent ? 'sent' : 'cancelled'));
                },this);
              }else{
                console.log('is not available');
              }
          });
       } 
    }
});