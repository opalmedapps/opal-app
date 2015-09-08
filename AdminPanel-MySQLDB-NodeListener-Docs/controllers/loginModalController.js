app.controller('loginModalCtrl', function ($rootScope,$modalInstance,$http)
{
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
    // This object containts superuser credentials
    $rootScope.user.users =
    {
      root :"service"
    };

    $rootScope.login = function (username,password)
    {
      /**
     * @ngdoc method
     * @name login
     * @methodOf AdminPanel.controller:loginModalController
     * @description
     * Logs the user in instantly if the super user credentials are used. For other users it will authenticate them using the admin table in MySQL and saves admin's information to $rootScope.
     * @param {String} username username specified by the user.
     * @param {String} password password specified by the user.
     * @returns {Object} $rootScope.Admin
     */
      // Authentication for superuser
      if (username==="root" && $rootScope.user.users[username]===password)
        {
          $rootScope.alerts["LoginAlert"]={};
          $modalInstance.close(username);
        }
      // Authentication for normal users
      else if (typeof username !== 'undefined' )
      {
        $http.get("http://localhost/devDocuments/mehryar/qplus/php/Authenticate.php?Username='"+username+"'&Password="+password).success( function (response)
        {

          if ( response.AdminSerNum )
          {
            $rootScope.alerts["LoginAlert"]={};
            $modalInstance.close(username);
            $rootScope.Admin=response;
          }
          else if (response == "InvalidCredentials")
          {
            $rootScope.alerts["LoginAlert"]={};
            $rootScope.alerts["LoginAlert"].type="danger";
            $rootScope.alerts["LoginAlert"].message="Credentials are not valid!";
          }
          else if ( response == "UserNotFound")
          {
            $rootScope.alerts["LoginAlert"]={};
            $rootScope.alerts["LoginAlert"].type="danger";
            $rootScope.alerts["LoginAlert"].message="Username does not exist!";
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
