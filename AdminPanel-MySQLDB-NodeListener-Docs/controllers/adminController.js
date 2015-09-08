app.controller('adminController',function($scope,$http)
{
  /**
  * @ngdoc controller
  * @name AdminPanel.controller:adminController
  @requires $http
  @requires $scope
  * @description
  * Controller for the admin management view.
  */
  $scope.alerts={};
  $scope.CreateAdmin= function (FirstName,LastName,Username,Password,PasswordConfirm)
  {
    /**
   * @ngdoc method
   * @name CreateAdmin
   * @methodOf AdminPanel.controller:adminController
   * @description
   * Creates a new administrator account that will have access to the different states of this application.
   * @param {String} FirstName First name specified by the user.
   * @param {String} LastName Last name specified by the user.
   * @param {String} Username Username specified by the user.
   * @param {String} Password Password specified by the user.
   * @param {String} PasswordConfirm Password re-entered by the user.
   * @returns {String} $scope.alerts["Alert"]
   */
    console.log("Registering with ",FirstName,LastName,Username,Password,PasswordConfirm);
    if (!FirstName)
    {
      $scope.alerts["BadFieldAlert"]={};
      $scope.alerts["BadFieldAlert"].type="danger";
      $scope.alerts["BadFieldAlert"].message="Please provide a first name!";
    }
    else if (!LastName)
    {
      $scope.alerts["BadFieldAlert"]={};
      $scope.alerts["BadFieldAlert"].type="danger";
      $scope.alerts["BadFieldAlert"].message="Please provide a last name!";
    }
    else if (!Username)
    {
      $scope.alerts["BadFieldAlert"]={};
      $scope.alerts["BadFieldAlert"].type="danger";
      $scope.alerts["BadFieldAlert"].message="Please provide a username!";
    }
    else if (!Password || Password !== PasswordConfirm )
    {
      $scope.alerts["BadFieldAlert"]={};
      $scope.alerts["BadFieldAlert"].type="danger";
      $scope.alerts["BadFieldAlert"].message="Make sure the passwords match!";
    }
    else
    {
      $http.get("http://localhost/devDocuments/mehryar/qplus/php/CreateAdmin.php?FirstName='"+FirstName+"'&LastName='"+LastName+"'&Username='"+Username+"'&Password='"+Password+"'").success(function (response)
      {
        if (response=="AdminCreated")
        {
            $scope.alerts["Alert"]={};
            $scope.alerts["Alert"].type="success";
            $scope.alerts["Alert"].message="New admin successfully created!";
            $scope.GetAdmins(); // To refresh the admins list
        } else
        {
          $scope.alerts["Alert"]={};
          $scope.alerts["Alert"].type="danger";
          $scope.alerts["Alert"].message="Something went wrong. Please try again!";
        }
      });
    }
  };
  $scope.RemoveAdmin= function(adminsernum)
  {
    /**
   * @ngdoc method
   * @name RemoveAdmin
   * @methodOf AdminPanel.controller:adminController
   * @description
   * Removes an administrator account from MySQL admin table..
   * @param {String} adminsernum AdminSerNum of the admin to be removed.
   * @returns {String} $scope.message
   */
    if (confirm("You are removing an administrator account for Qplus App. Do you wish to proceed?"))
    {
      $http.get("http://localhost/devDocuments/mehryar/qplus/php/RemoveAdmin.php?AdminSerNum="+adminsernum).success(function (response)
      {
        $scope.message=response;
      });
    }
  };
  $scope.GetAdmins=function ()
  {
    /**
   * @ngdoc method
   * @name GetAdmins
   * @methodOf AdminPanel.controller:adminController
   * @description
   * Saves a list of all of the admins currently present in MySQL admin table to the $scope.
   * @returns {String} $scope.Admins
   */
    $http.get("http://localhost/devDocuments/mehryar/qplus/php/GetAdmins.php").success(function (response)
    {
      $scope.Admins=response;
    });
  };
  $scope.GetAdmins();
});
