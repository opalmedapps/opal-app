var app=angular.module('adminPanelApp');
app.controller('LoginModalController',function ($scope, $modalInstance,$rootScope,$http,User, api, Messages, $timeout, AllPatients,URLs,$q) {

    /**
  * @ngdoc controller
  * @name AdminPanel.controller:loginModalController
  * @requires $http
  * @requires $rootScope
  * @requires $modalInstance
  * @description
  * Controller for the login modal.
  */
    $rootScope.alerts={};
    $rootScope.user= {};
    checkForUserAlreadyLoggedIn();

    function checkForUserAlreadyLoggedIn()
    {
      
      var user=window.localStorage.getItem('OpalAdminPanelUser');
      if(user)
      {
        user=JSON.parse(user);
        console.log(user);
        var date=new Date(user.expires);
        var diff=(new Date()-date)/1000;

        console.log(diff);
        if(diff<$rootScope.userExpiration)
        {
          signinUser(user).then(function(){$modalInstance.close(user);});
        }else{
          window.localStorage.removeItem('OpalAdminPanelUser');

        }    
      }

    }

    $scope.onEnter=function(event)
    {
      console.log(event.keyCode);
      if(event.keyCode==13)
      {
        $scope.login($scope.user.username, $scope.user.password);
      }
    }
    function signinUser(response)
    {
      var r=$q.defer();
      if(response.AdminSerNum)
      {
        $rootScope.userType='Admin';
      }else if(response.DoctorSerNum){
        $rootScope.userType='Doctor';
        console.log($rootScope.userType);
      }else{
        $rootScope.userType='Staff';
      }
      $rootScope.currentUser=response;
      $rootScope.alerts["LoginAlert"]={};
      console.log(response);
      User.setUserFields(response,response.Username,response.Password);
      User.getNumberOfPatientsForUserFromServer().then(function(data){
        $rootScope.loggedin=true;
        $rootScope.TotalNumberOfPatients=data[0].TotalNumberOfPatients;
        if($rootScope.userType=='Doctor')
        {
          User.setNumberOfDoctorPatients(data[1].TotalNumberOfDoctorPatients);
          $rootScope.TotalNumberOfDoctorPatients=User.getNumberOfDoctorPatients();
        }

        api.getAllPatients().then(function(result){
          AllPatients.setPatients(result);
          Messages.getMessagesFromServer().then(function(messagesFromService){
          Messages.setMessages(messagesFromService);
        });
      });

      });

      if(User.getUserFields().UserRole=='Admin'){
        $rootScope.admin=true;
      }else {
        $timeout(function(){
          $rootScope.admin=false;
        })

      }
      $modalInstance.close(response);
      r.resolve(true);
      return r.promise;
    }
    $rootScope.login = function (username,password)
    {

      if (typeof username !== 'undefined' )
      {
        api.getFieldFromServer(URLs.getUserAuthenticationUrl(),{Username:username, Password:password}).then(function(response)
        {

          if ( response.AdminSerNum ||response.DoctorSerNum||response.StaffSerNum)
          {
            console.log(response);
            response.Username=username;
            response.expires=new Date();
            window.localStorage.setItem('OpalAdminPanelUser',JSON.stringify(response));
            signinUser(response);
          }else if(response=="")
          {
            $rootScope.alerts["LoginAlert"]={};
            $rootScope.alerts["LoginAlert"].type="danger";
            $rootScope.alerts["LoginAlert"].message="Enter Password!";
          }
          else if (response =="Invalid Password")
          {
            console.log('asdas2');
            $rootScope.alerts["LoginAlert"]={};
            $rootScope.alerts["LoginAlert"].type="danger";
            $rootScope.alerts["LoginAlert"].message="Incorrect password!";
          }
          else if ( response == "User not found")
          {
            console.log('asdas3');
            $rootScope.alerts["LoginAlert"]={};
            $rootScope.alerts["LoginAlert"].type="danger";
            $rootScope.alerts["LoginAlert"].message="Username not found!";
          }
        });
      }
      else
      {
        $rootScope.alerts["LoginAlert"]={};
        $rootScope.alerts["LoginAlert"].type="danger";
        $rootScope.alerts["LoginAlert"].message="Credentials are not valid!";
      }
    };

    $rootScope.cancel = function ()
    {
      /**
     * @ngdoc method
     * @name cancel
     * @methodOf AdminPanel.controller:loginModalController
     * @description
     * Cancels login and closes the modal.
     */
      $modalInstance.dismiss('cancel');
    };
});
