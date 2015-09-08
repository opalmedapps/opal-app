app.controller('feedbackController',function($scope,$http)
{
  /**
  * @ngdoc controller
  * @name AdminPanel.controller:feedbackController
  * @requires $scope
  * @requires $http
  * @description
  * Controller for the feedback view.
  */
  $scope.GetFeedback = function ()
  {
  /**
 * @ngdoc method
 * @name GetFeedback
 * @methodOf AdminPanel.controller:feedbackController
 * @description
 * @requires $http
 * saves feedbacks from mysql table to the $scope.
 * @returns {Object}  $scope.Feedback
 */
    $http.get("http://localhost/devDocuments/mehryar/qplus/php/GetFeedback.php").success( function (response)
    {
      $scope.Feedbacks=response;
    });
  };
  $scope.GetFeedback();
});
