var myApp = angular.module('MUHCApp');

myApp.controller('InitScreenController',function($scope, $timeout, NavigatorParameters,$translatePartialLoader, UserPreferences, $filter,FirebaseService, UserAuthorizationInfo,$state,LocalStorage)
{ 
    //Firebase reference to check authentication
    var myDataRef = new Firebase(FirebaseService.getFirebaseUrl());

 
  //Add the login translation
    $translatePartialLoader.addPart('login');
    //Check if device or browser
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
   
   //Do not show the list breaking, equivalent of ng-cloak for angularjs, LOOK IT UP!!! https://docs.angularjs.org/api/ng/directive/ngCloak
    setTimeout(function(){
       $("#listInitApp").css({display:'block'});
    },10);

    //Initialize language if not initialized
    UserPreferences.initializeLanguage().then(function(lan)
    {
      console.log(lan);
    }).catch(function(error)
    {
       
    });
    console.log('Initializing language');

    //Go to parking function
    $scope.goToParking = function()
    {
        NavigatorParameters.setParameters('initNavigator');
        initNavigator.pushPage('./views/general/parking/parking.html',{animation:'lift'});
    };
    //Go to general settings
    $scope.goToGeneralSettings = function()
    {
      NavigatorParameters.setParameters({'Navigator':'initNavigator'});
      initNavigator.pushPage('./views/init/init-settings.html',{animation:'lift'});
    };
    //Go to patient charter
    $scope.goToPatientCharter = function()
    {
        console.log('heading to charter');
        NavigatorParameters.setParameters('initNavigator');
        initNavigator.pushPage('./views/general/charter/charter.html',{animation:'lift'});
    };

    //Report issues function
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
    };

    $scope.goToUserView = function()
    {
      if($scope.authenticated)
      {
        NavigatorParameters.setParameters('Resume');
        $state.go('loading');
      }else{
        initNavigator.pushPage('./views/login/login.html',{animation:'lift'});
      } 
    };

   
    //Check authentication state
    //var boolAuth = authenticate();
    // checkNewVersions(boolAuth);
    // //Check new version of the app and if authenticated log user out to start fresh version
    // function checkNewVersions(authBool)
    // {
    //   var version = window.localStorage.getItem('AppVersion');
    //   console.log(authBool);
    //   console.log('line 71', version, typeof version);
    //   if(authBool&&!version&&version!== '1')
    //   {
    //     window.localStorage.setItem('AppVersion','1');
    //     $state.go('logOut');
    //   }
    // }
    
    function authenticate(authData)
    {
      //Get Firebase authentication state
      
      $scope.authenticated = !!authData;
      console.log($scope.authenticated );
      //If authenticated update the user authentication state
      if( $scope.authenticated)
      {
        var  authInfoLocalStorage=window.localStorage.getItem('UserAuthorizationInfo');
        if(authInfoLocalStorage){
            var authInfoObject=JSON.parse(authInfoLocalStorage);
            UserAuthorizationInfo.setUserAuthData(authData.auth.uid,authInfoObject.Password , authData.expires,authData.token);
            var authenticationToLocalStorage={
                    UserName:authData.uid,
                    Password: authInfoObject.Password ,
                    Expires:authData.expires,
                    Email:authData.password.email,
                    Token:authData.token
            };
            window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
        }      
      }
      return $scope.authenticated;
    }
       //Listen to authentication state, if user get's unauthenticated log user out.
    myDataRef.onAuth(function(authData){

    console.log('dasdasdas',authData);
    var  authInfoLocalStorage=window.localStorage.getItem('UserAuthorizationInfo');
      if(authData)
      {
        authenticate(authData);
      }else{
        if($state.current.name=='Home')
        {
          console.log('here state');
          $state.go('logOut');
        }else if(authInfoLocalStorage)
        {
          LocalStorage.resetUserLocalStorage();
        }
      }
  });
   

});