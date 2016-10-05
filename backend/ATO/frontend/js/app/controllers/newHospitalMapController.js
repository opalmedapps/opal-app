angular.module('ATO_InterfaceApp.controllers.newHospitalMapController', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns']).


	/******************************************************************************
	* New Hospital Map Page controller 
	*******************************************************************************/
	controller('newHospitalMapController', function($scope, $filter, $sce, $uibModal, hosmapAPIservice) {

        // Function to go to previous page
        $scope.goBack = function() {
            window.history.back();
        }

        // completed steps boolean object; used for progress bar
        var steps = {
            title: {completed: false},
            description: {completed: false},
            qrid: {completed: false}
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

        // Initialize the new hospital map object
        $scope.newHosMap = {
            name_EN: "",
            name_FR: "",
            description_EN: "",
            description_FR: "",
            qrid: "",
            qrcode: "",
            qrpath: "",
            url: ""
        }

        $scope.oldqrid = "";

        // Function to toggle necessary changes when updating titles
        $scope.titleUpdate = function() {

            if ($scope.newHosMap.name_EN && $scope.newHosMap.name_FR) {
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

            if ($scope.newHosMap.description_EN && $scope.newHosMap.description_FR) {
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

        // Function to toggle necessary changes when updating qrid and URL
        $scope.qridUpdate = function() {

            if ($scope.newHosMap.qrid && $scope.newHosMap.qrcode && $scope.newHosMap.url) {
                // Toggle step completion
                steps.qrid.completed = true;
                // Count the number of completed steps
	            $scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
            } else {
                // Toggle step incompletion
	            steps.qrid.completed = false;	
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
        }

        // Function to call api to generate qr code
        $scope.generateQRCode = function(qrid) {

            if (qrid) {
                hosmapAPIservice.generateQRCode(qrid, $scope.oldqrid).success(function (response) {
                    $scope.newHosMap.qrcode = response.qrcode;
                    $scope.newHosMap.qrpath = response.qrpath;

                    $scope.oldqrid = qrid;
                    $scope.qridUpdate();
                });
            }
            else {
                $scope.hosMap.qrcode = "";
                $scope.hosMap.qrpath = "";
            }

        }

        // Function to show map
        $scope.showMapDisplay = false;
        $scope.mapURL = "";
        $scope.showMap = function (url) {
            $scope.showMapDisplay = true;
            $scope.mapURL = url;
        };

        // Function to submit the new hospital map
        $scope.submitHosMap = function() {
            if ($scope.checkForm()) {
                 // Submit
                $.ajax({
                    type: "POST",
                    url: "php/hospital-map/insert_hospitalMap.php",
                    data: $scope.newHosMap,
                    success: function() {
                        window.location.href = URLPATH+"main.php#/hospital-map";
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
