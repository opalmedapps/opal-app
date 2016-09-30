angular.module('ATO_InterfaceApp.controllers.newTestResultController', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns']).

	/******************************************************************************
	* Add Test Result Page controller 
	*******************************************************************************/
	controller('newTestResultController', function($scope, $filter, $sce, $uibModal, testresAPIservice, filterAPIservice) {

        // Function to go to previous page
        $scope.goBack = function() {
            window.history.back();
        }

        // completed steps boolean object; used for progress bar
        var steps = {
            tests: {completed: false},
            title: {completed: false},
            description: {completed: false},
            group: {completed: false}
        };

        // Default count of completed steps
        $scope.numOfCompletedSteps = 0;

        // Default total number of steps 
        $scope.stepTotal = 4;

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

        // Responsible for "searching" in search bars
        $scope.filter = $filter('filter'); 

        // Initialize search field variable
        $scope.testFilter = "";

        // Initialize a list for tests
        $scope.testList = [];

        // Initialize the new test result object
        $scope.newTestResult = {
            name_EN: null,
            name_FR: null,
            description_EN: null,
            description_FR: null,
            group_EN: "",
            group_FR: "",
            tests: []
        }

        // Initialize lists to hold distinct test groups 
        $scope.TestResultGroups_EN = [];
        $scope.TestResultGroups_FR = [];

        /* Function for the "Processing..." dialog */
        var processingModal;
	    $scope.showProcessingModal = function() {

        	processingModal = $uibModal.open({
                templateUrl: 'processingModal.htm',
	            backdrop: 'static',
        	    keyboard: false,
	       	});	
        }
        $scope.showProcessingModal(); // Calling function
  
        $scope.formLoaded = false;
        // Function to load form as animations
        $scope.loadForm = function() {
            $('.form-box-left').addClass('fadeInDown');
            $('.form-box-right').addClass('fadeInRight');
        }

        // Call our API to get the list of test groups
        testresAPIservice.getTestResultGroups().success(function(response) {

            $scope.TestResultGroups_EN = response.EN;
            $scope.TestResultGroups_FR = response.FR;

        });

        // Call our API to get the list of tests
        testresAPIservice.getTestNames().success(function(response) {

            $scope.testList = response;
 
            processingModal.close(); // hide modal
            processingModal = null; // remove reference
   
            $scope.formLoaded = true;
            $scope.loadForm();
        });

        // Function to toggle necessary changes when updating titles
        $scope.titleUpdate = function() {

            if ($scope.newTestResult.name_EN && $scope.newTestResult.name_FR) {

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

            if ($scope.newTestResult.description_EN && $scope.newTestResult.description_FR) {

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

        // Function to toggle necessary changes when updating groups
        $scope.groupUpdate = function() {

            if ($scope.newTestResult.group_EN && $scope.newTestResult.group_FR) {

                // Toggle step completion
                steps.group.completed = true;
                 // Count the number of completed steps
	            $scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
            } else {
                // Toggle step incompletion
	            steps.group.completed = false;	
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
        }

		// Function to return boolean for # of added tests
		$scope.checkTestsAdded = function(testList) {
			
			var addedParam = false;
			angular.forEach(testList, function(test) {
				if (test.added)
					addedParam = true;
			});
			if (addedParam)
				return true;
			else
				return false;
		}

	    // Function to add / remove a test
		$scope.toggleTestSelection = function(test){
			
			var testName = test.name; // get the name

			// If originally added, remove it
			if (test.added) { 

     				test.added = 0; // added parameter

				// Check if there are still tests added, if not, flag
				if (!$scope.checkTestsAdded($scope.testList)) {

					// Toggle boolean
					steps.tests.completed = false;
	
					// Count the number of completed steps
					$scope.numOfCompletedSteps = stepsCompleted(steps);

					// Change progress bar
					$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
	
				}

			}
			else { // Orignally not added, add it

				test.added = 1;

				// Boolean
				steps.tests.completed = true;

				// Count the number of steps completed
				$scope.numOfCompletedSteps = stepsCompleted(steps);

				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);

			}

   		}

        // Function to submit the new test result
        $scope.submitTestResult = function() {
            if ($scope.checkForm()) {

                // Fill in the tests from testList
                angular.forEach($scope.testList, function(test) {
                    if(test.added)
                        $scope.newTestResult.tests.push(test);
                });

                // Submit form
                $.ajax({
                    type: 'POST',
                    url: 'php/test-result/insert_testResult.php',
                    data: $scope.newTestResult,
                    success: function() {
                        window.location.href = URLPATH+"main.php#/test-result";
                    }
                });
            }
        }

        // Function to toggle Item in a list on/off
        $scope.selectItem = function(item) {
            if(item.added)
                item.added = 0;
            else
                item.added = 1;
        };
 
        // Function to assign search field when textbox changes
        $scope.changeTestFilter = function (field) {
            $scope.testFilter = field;
        }

        // Function for search through the test names
        $scope.searchTestsFilter = function (Filter) {
            var keyword = new RegExp($scope.testFilter, 'i');
            return !$scope.testFilter || keyword.test(Filter.name);
        }


        // Function to return boolean for form completion
        $scope.checkForm = function() {
            if (trackProgress($scope.numOfCompletedSteps, $scope.stepTotal) == 100)
                return true;
            else
                return false;
        }

    });
