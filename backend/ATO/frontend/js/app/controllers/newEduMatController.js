angular.module('ATO_InterfaceApp.controllers.newEduMatController', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns']).


	/******************************************************************************
	* New Educational Material Page controller 
	*******************************************************************************/
	controller('newEduMatController', function($scope, $filter, $sce, $uibModal, edumatAPIservice, filterAPIservice) {

        // Function to go to previous page
        $scope.goBack = function() {
            window.history.back();
        }

        // completed steps boolean object; used for progress bar
        var steps = {
            title: {completed: false},
            url: {completed: false},
            type: {completed: false},
            phase: {completed: false},
            tocs: {completed: false}
        };

        // Responsible for "searching" in search bars
        $scope.filter = $filter('filter'); 

        // Initilize search field variables
        $scope.termSearchField = "";
        $scope.dxSearchField = "";
        $scope.doctorSearchField = "";
        $scope.resourceSearchField = "";
    
        // Default count of completed steps
        $scope.numOfCompletedSteps = 0;

        // Default total number of steps 
        $scope.stepTotal = 5;

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

        // Initialze a list of "phase in treatment" types
        $scope.phaseInTxs = [];

        // Initialize the new edu material object
        $scope.newEduMat = {
            name_EN: null,
            name_FR: null,
            url_EN: null,
            url_FR: null,
            type_EN: "",
            type_FR: "",
            phase_in_tx: null,
            tocs: [],
            filters: []
        }

        // Initialize lists to hold filters
        $scope.termList = [];
        $scope.dxFilterList = [];
        $scope.doctorFilterList = [];
        $scope.resourceFilterList = [];

        // Initialize lists to hold the distinct edu material types
        $scope.EduMatTypes_EN = [];
        $scope.EduMatTypes_FR = [];


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

        // Call our API service to get each filter
        filterAPIservice.getFilters().success(function (response) {

	        $scope.termList = response.expressions; // Assign value
            $scope.dxFilterList = response.dx; 
            $scope.doctorFilterList = response.doctors;
            $scope.resourceFilterList = response.resources;

            processingModal.close(); // hide modal
            processingModal = null; // remove reference
  
            $scope.formLoaded = true;
            $scope.loadForm();

		});

        // Call our API to get the list of edu material types
        edumatAPIservice.getEducationalMaterialTypes().success(function (response) {

            $scope.EduMatTypes_EN = response.EN;
            $scope.EduMatTypes_FR = response.FR;
        });

        // Call our API to get the list of phase-in-treatments
        edumatAPIservice.getPhaseInTreatments().success(function(response) {
            $scope.phaseInTxs = response;
        });

        // Function to toggle necessary changes when updating titles
        $scope.titleUpdate = function() {

            if ($scope.newEduMat.name_EN && $scope.newEduMat.name_FR) {
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

        // Function to toggle necessary changes when updating the urls  
        $scope.urlUpdate = function () {

            if ($scope.newEduMat.url_EN || $scope.newEduMat.url_FR) {
                steps.tocs.completed = true; // Since it will be hidden
            } 

            if ($scope.newEduMat.url_EN && $scope.newEduMat.url_FR) {
                // Toggle step completion
                steps.url.completed = true;
                // Count the number of completed steps
	            $scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
            } 
            else {
                steps.tocs.completed = false; // No longer hidden
                // Toggle step incompletion
	            steps.url.completed = false;	
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
        }

        // Function to toggle necessary changes when updating the types
        $scope.typeUpdate = function() {
            if ($scope.newEduMat.type_EN && $scope.newEduMat.type_FR) {
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

        // Function to toggle necessary changes when updating the phase in treatment
        $scope.phaseUpdate = function() {
            // Toggle boolean 
            steps.phase.completed = true;
            // Count the number of completed steps
			$scope.numOfCompletedSteps = stepsCompleted(steps);
			// Change progress bar
			$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
		}

        $scope.tocsComplete = false;
        // Function to toggle necessary changes when updating the table of contents
        $scope.tocUpdate = function() {

            steps.tocs.completed = true;
            $scope.tocsComplete = true;

            // Toggle boolean
            if ($scope.newEduMat.tocs.length) {
                steps.url.completed = true; // Since it will be hidden
            }
            if (!$scope.newEduMat.tocs.length) {
                steps.url.completed = false; // Since it will be hidden
                $scope.tocsComplete = false;
                steps.tocs.completed = false;
            }

            angular.forEach($scope.newEduMat.tocs, function(toc) {
                if(!toc.name_EN || !toc.name_FR || !toc.url_EN 
                    || !toc.url_FR || !toc.type_EN || !toc.type_FR) {
                    $scope.tocsComplete = false;
                    steps.tocs.completed = false;
                    steps.url.completed = false;
                }
            });

            // Count the number of completed steps
			$scope.numOfCompletedSteps = stepsCompleted(steps);
			// Change progress bar
			$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
		}

        // Function to add table of contents to newEduMat object
        $scope.addTOC = function() {
            var newOrder = $scope.newEduMat.tocs.length+1;
            $scope.newEduMat.tocs.push({
                name_EN: "",
                name_FR: "",
                url_EN: "",
                url_FR: "",
                type_EN: "",
                type_FR: "",
                order:newOrder
            });
            $scope.tocUpdate();
        }

        // Function to remove table of contents from newEduMat object
        $scope.removeTOC = function(order) {
            $scope.newEduMat.tocs.splice(order-1,1);
            // Decrement orders for content after the one just removed
            for(var index = order-1; index < $scope.newEduMat.tocs.length; index++) {
                $scope.newEduMat.tocs[index].order -= 1;
            }
            $scope.tocUpdate();
        }
        
        // Function to submit the new edu material
        $scope.submitEduMat = function() {
            if ($scope.checkForm()) {
                // Add filters to new post object
                addFilters($scope.termList);
                addFilters($scope.dxFilterList);
                addFilters($scope.doctorFilterList);
                addFilters($scope.resourceFilterList);
                // Submit
                $.ajax({
                    type: "POST",
                    url: "php/educational-material/insert_educational-material.php",
                    data: $scope.newEduMat,
                    success: function() {
                        window.location.href = URLPATH+"main.php#/educational-material";
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

        // Function for selecting all terms in the expression list
        var selectAllTerms = false;
        $scope.selectAllTerms = function() {
            var filtered = $scope.filter($scope.termList, $scope.termSearchField);

            if (selectAllTerms) {
                angular.forEach(filtered, function(term) {
                    term.added = 0;
                });
                selectAllTerms = !selectAllTerms;
            } else {
                angular.forEach(filtered, function(term) {
                    term.added = 1;
                });
                selectAllTerms = !selectAllTerms;
            }
        }

        // Function to assign search fields when textbox changes
        $scope.searchTerm = function(field) {
            $scope.termSearchField = field;
        }
        $scope.searchDiagnosis = function(field) {
            $scope.dxSearchField = field;
        }
        $scope.searchDoctor = function(field) {
            $scope.doctorSearchField = field;
        }
        $scope.searchResource = function(field) {
            $scope.resourceSearchField = field;
        }

        // Function for search through the filters
        $scope.searchTermsFilter = function (Filter) {
            var keyword = new RegExp($scope.termSearchField, 'i');
            return !$scope.termSearchField || keyword.test(Filter.name);
        }
        $scope.searchDxFilter = function (Filter) {
            var keyword = new RegExp($scope.dxSearchField, 'i');
            return !$scope.dxSearchField || keyword.test(Filter.name);
        }
        $scope.searchDoctorFilter = function (Filter) {
            var keyword = new RegExp($scope.doctorSearchField, 'i');
            return !$scope.doctorSearchField || keyword.test(Filter.name);
        }
        $scope.searchResourceFilter = function (Filter) {
            var keyword = new RegExp($scope.resourceSearchField, 'i');
            return !$scope.resourceSearchField || keyword.test(Filter.name);
        }

        // Function to return filters that have been checked
        function addFilters(filterList) {
            angular.forEach(filterList, function(Filter) {
                if(Filter.added)
                    $scope.newEduMat.filters.push({id:Filter.id, type:Filter.type})
            });
        }

        // Function to check if all filters are added
        $scope.allFilters = function(filterList) {
            var allFiltersAdded = true;
            angular.forEach(filterList, function(Filter) {
                if(Filter.added)
                    allFiltersAdded = false;
            });
            return allFiltersAdded;
        }

        // Function to return boolean for form completion
        $scope.checkForm = function() {
            if (trackProgress($scope.numOfCompletedSteps, $scope.stepTotal) == 100)
                return true;
            else
                return false;
        }


    });
