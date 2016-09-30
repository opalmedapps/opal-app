angular.module('ATO_InterfaceApp.controllers.newNotificationController', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns']).


	/******************************************************************************
	* Controller for the Add Notification page
	*******************************************************************************/
	controller('newNotificationController', function($scope, $uibModal, $filter, $sce, notifAPIservice) {
					
        // Function to go to previous page
        $scope.goBack = function() {
            window.history.back();
        }

        // completed steps boolean object; used for progress bar
        var steps = {
            title: {completed: false},
            description: {completed: false},
            type: {completed: false}
        };

        // Default count of completed steps
        $scope.numOfCompletedSteps = 0;

        // Default total number of steps 
        $scope.stepTotal = 3;

        // Progress for progress bar on default steps and total
        $scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);

        // Function to calculate / return step progress
        function trackProgress(value, total) {
			return Math.round(100 * value / total);
		}
	
		// Function to return number of steps completed
		function stepsCompleted(steps) {

			var numberOfTrues = 0;
			for (var step in steps) {
				if (steps[step].completed == true) {
					numberOfTrues++;
				}
			}

			return numberOfTrues;
		}
  
        // Initialize the new notification object
        $scope.newNotification = {
            name_EN: "",
            name_FR: "",
            description_EN: "",
            description_FR: "",
            type: ""
        }
        
        
        // Call our API to get the list of notification types
        $scope.notificationTypes = [];
        notifAPIservice.getNotificationTypes().success(function(response) {
            $scope.notificationTypes = response
        });

        // Function to toggle necessary changes when updating titles
        $scope.titleUpdate = function() {

            if ($scope.newNotification.name_EN && $scope.newNotification.name_FR) {
                // Toggle step completion
                steps.title.completed = true;
                // Count the number of completed steps
	            $scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
            } else {
                // Toggle step incompletion
	            steps.title.completed = false;	
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
        }

        // Function to toggle necessary changes when updating descriptions
        $scope.descriptionUpdate = function() {

            if ($scope.newNotification.description_EN && $scope.newNotification.description_FR) {
                // Toggle step completion
                steps.description.completed = true;
                // Count the number of completed steps
	            $scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
            } else {
                // Toggle step incompletion
	            steps.description.completed = false;	
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
        }

        // Function to toggle necessary changes when updating type
        $scope.typeUpdate = function() {

            if ($scope.newNotification.type) {
                // Toggle step completion
                steps.type.completed = true;
                // Count the number of completed steps
	            $scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
            } else {
                // Toggle step incompletion
	            steps.type.completed = false;	
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
        }

        // Function to submit the new notification
        $scope.submitNotification = function() {
            if ($scope.checkForm()) {
                 // Submit
                $.ajax({
                    type: "POST",
                    url: "php/notification/insert_notification.php",
                    data: $scope.newNotification,
                    success: function() {
                        window.location.href = URLPATH+"main.php#/notification";
                    }
                });
            }
        }

        // Function to return boolean for form completion
        $scope.checkForm = function() {
            if (trackProgress($scope.numOfCompletedSteps, $scope.stepTotal) == 100)
                return true;
            else
                return false;
        }


	});
