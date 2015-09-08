app.controller('appointmentController',function($rootScope,$scope,$location,$anchorScroll,$http)
{
  /**
  * @ngdoc controller
  * @name AdminPanel.controller:appointmentController
  * @requires $rootScope
  * @requires $scope
  * @requires $location
  * @requires $anchorScroll
  * @requires $http
  * @description
  * Controller for the requests view.
  */
      // Change of appointment functionality is obsolete here. Remove later.
      $scope.SyncEndDate= function ()
      {
        /**
       * @ngdoc method
       * @name SyncEndDate
       * @methodOf AdminPanel.controller:appointmentController
       * @description
       * Sets the start and end date equal for an appointment ( They start and end on the same day) - not used
       */
        $scope.newEndTime=$scope.newStartTime;
        console.log($scope.newEndTime);
      };
      $scope.RemoveAppointmentRequest= function (key)
      {
        /**
       * @ngdoc method
       * @name RemoveAppointmentRequest
       * @methodOf AdminPanel.controller:appointmentController
       * @description
       * Sets the IsProcessed value to 1 in MySQL. Uses GetRequests() method to refresh the list.
       * @param {Integer} key the selected appoinment's key.
       * @requires $http
       */
        if (confirm("You are removing a patient's change of appointment request. Are you sure?"))
        {
          $http.get("http://localhost/devDocuments/mehryar/qplus/php/RemoveAppointmentRequest.php?RequestSerNum="+$scope.Requests[key].RequestSerNum).success(function (response)
          {
            $scope.GetRequests();
          });
        }
      };
      $scope.ChangeAppointment = function () // Remove Later
      {
        /**
       * @ngdoc method
       * @name ChangeAppointment
       * @methodOf AdminPanel.controller:appointmentController
       * @description
       * Changes the time of a previously scheduled appointment in MySQL. Uses RemoveAppointmentRequest to remove it from the list.
       * @requires $http
       */
        var changeAppURL="http://localhost/devDocuments/mehryar/qplus/php/ChangeAppointment.php?AppointmentSerNum='"+$scope.Requests[$scope.key].AppointmentSerNum+"'&newStartTime='"+$scope.newStartTime.toISOString()+"'&newEndTime='"+$scope.newEndTime.toISOString()+"'";
        // Change it in ARIA Database First ! WHEN testing in INTERNAL Network
        $http.get(changeAppURL).success(function (response)
        {
          $scope.RemoveAppointmentRequest();
        });
      };

      $scope.GetRequests= function ()
      {
        /**
       * @ngdoc method
       * @name GetRequests
       * @methodOf AdminPanel.controller:appointmentController
       * @description
       * Saves change of appointment requests from the mysql table to the $scope.
       * @requires $http
       * @returns {Object}  $scope.Requests
       */
          $http.get("http://localhost/devDocuments/mehryar/qplus/php/GetAppointmentChanges.php").success(function (response)
          {
            $scope.Requests=response;
            $scope.key=0;
            console.log($scope.Requests);
          });
      };
      $scope.GetRequests();
      window.setInterval($scope.GetRequests, 20000);
      $scope.setCurrentReq = function (x)
      {
        /**
       * @ngdoc method
       * @name setCurrentReq
       * @methodOf AdminPanel.controller:appointmentController
       * @description
       * Changes the currently selected key. ( not used )
       * @returns {Integer}  $scope.key
       */
       $scope.key=x;
      };
      $scope.gotoTop = function()
      {
        /**
       * @ngdoc method
       * @name gotoTop
       * @methodOf AdminPanel.controller:appointmentController
       * @description
       * Scrolls to the top of the page.
       * @requires $location
       * @requires $anchorScroll
       */
      if ($location.hash() !== "listTop" ){
        $location.hash("listTop");
      } else
      {
        $anchorScroll();
      }
      };
});
