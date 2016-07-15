var myApp = angular.module('MUHCApp');

myApp.controller('InitSettingsController',function($scope, $timeout, NavigatorParameters, UserPreferences)
{
   var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

   var params = NavigatorParameters.getParameters();
   $scope.navigatorName = params.Navigator;
   console.log(params);
   $scope.navigator = window[$scope.navigatorName];
   initSettings();
 
    function initSettings()
    {
       $scope.languageSwitch  = (UserPreferences.initializeLanguage()=='EN')?false:true;
       if(app){
        cordova.getAppVersion.getVersionNumber(function (version) {
            $timeout(function()
            {
              $scope.version = version;  
            }); 
        });
        }else{
            $scope.version = '0.0.1';  
        }  
    }
   $scope.changeLanguage = function(value)
  {
      console.log(value);
    if(value)
    {
      UserPreferences.setLanguage('FR');
    }else{
      UserPreferences.setLanguage('EN');
    }
  };
    
    $scope.goToRateThisApp = function()
    {
        
    };
    function settingsSuccess() {
    console.log('settings opened');
}

function settingsFail() {
    console.log('open settings failed');
}

function openSettingsNow() {
    cordova.plugins.settings.openSetting("application",settingsSuccess,settingsFail);
}
    $scope.openDeviceSettings = function()
    {
        if(app && typeof cordova.plugins.settings.openSetting !== undefined){
            if(ons.platform.isAndroid())
            {
                console.log('android');
                openSettingsNow();
            }else{
                openSettingsNow();
            }
        }
    };
    
    
    $scope.openPageLegal = function(type)
    {
        if(type == 0)
        {
             NavigatorParameters.setParameters({type:type, title:'Terms of Use',Navigator:$scope.navigatorName}); 
             $scope.navigator.pushPage('./views/init/init-legal.html');
        }else{
             NavigatorParameters.setParameters({type:type, title:'Privacy Policy',Navigator:$scope.navigatorName});
             $scope.navigator.pushPage('./views/init/init-legal.html');
   
        }
    
    };
    
    
    
    
});

myApp.controller('LegalController',function(){
    
})