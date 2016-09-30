angular.module('ATO_InterfaceApp.controllers.newAliasController', ['ngAnimate','ui.bootstrap', 'ui.grid']).

	/******************************************************************************
	* Add Alias Page controller 
	*******************************************************************************/
	controller('newAliasController', function($scope, $filter, $uibModal, aliasAPIservice, edumatAPIservice) {

        // Function to go to previous page
        $scope.goBack = function() {
            window.history.back();
        }

		// Default boolean variables
		var selectAll      = false // select All button checked?

		// completed steps in object notation
		var steps = {
			title: {completed: false},
			description: {completed: false},
			type: {completed: false},
			terms: {completed: false}
		};

		$scope.filter = $filter('filter');

		// Default cout of completed steps
		$scope.numOfCompletedSteps = 0;
	
		// Default total number of steps
		$scope.stepTotal = 4;

		// Progress bar based on default completed steps and total
		$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);

		// Initialize the list of alias types
		$scope.aliasTypes = [
			{name: 'Task'},
			{name: 'Appointment'},
			{name: 'Document'}
		];

		// Initialize the new alias object
		$scope.newAlias = {
			name_EN: null,
			name_FR: null,
			description_EN: null,
			description_FR: null,
			type: null,
            eduMat: null,
			terms: []
		};

		// Initilize list that will hold unassigned terms
		$scope.termList = [];
        // Initialize list that will hold educational materials
        $scope.eduMatList = [];
				
		$scope.termFilter = null;
        $scope.eduMatFilter = null;

        /* Function for the "Processing" dialog */
        var processingModal;
	    $scope.showProcessingModal = function() {

        	processingModal = $uibModal.open({
                templateUrl: 'processingModal.htm',
	            backdrop: 'static',
        	    keyboard: false,
	       	});	
        }

        // Call our API service to get the list of educational material
        edumatAPIservice.getEducationalMaterials().success(function (response) {
            $scope.eduMatList = response; // Assign value
        });

		// Function to toggle necessary changes when updating alias title
		$scope.titleUpdate = function () {

			if ($scope.newAlias.name_EN && $scope.newAlias.name_FR) { // if textboxes are not empty

				// Toggle boolean
				steps.title.completed = true;

				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);

				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
                


			}
			else { // at least one textbox is empty

				// Toggle boolean
				steps.title.completed = false;
				
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);

				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
		}

		// Function to toggle necessary changes when updating alias description
		$scope.descriptionUpdate = function () {

			if ($scope.newAlias.description_EN && $scope.newAlias.description_FR) { // if textboxes are not empty

				// Toggle boolean
				steps.description.completed = true;

				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);

				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);


			}
			else { // at least one textbox is empty

				// Toggle boolean
				steps.description.completed = false;
				
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);

				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
		}

		// Function to toggle necessary changes when updating alias type
		$scope.typeUpdate = function () {

			// Toggle boolean
			steps.type.completed = true;

            // If terms were assigned previously, we reset that step.
            if ($scope.termList) {
		        // Set false for each term in termList
			    angular.forEach($scope.termList, function (term) {
				    term.added = false;
        		});

				// Toggle boolean
				steps.terms.completed = false;
            }
	        $scope.showProcessingModal();
            
            // Call our API service to get the list of alias expressions
            aliasAPIservice.getExpressions($scope.newAlias.type).success(function (response) {
	            $scope.termList = response; // Assign value

                processingModal.close(); // hide modal
                processingModal = null; // remove reference

    		    // Set false for each term in termList
	    		angular.forEach($scope.termList, function (term) {
		    		term.added = false;
        	    });

    	        // Sort list
	        	$scope.termList.sort(function(a,b) {
		    	    var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
		            if (nameA < nameB) // sort string ascending
			            return -1;
            		if (nameA > nameB)
	        			return 1;
            		else return 0 // no sorting
			    });
    		});

			// Count the number of completed steps
			$scope.numOfCompletedSteps = stepsCompleted(steps);

			// Change progress bar
			$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
		}

		// Function to add / remove a term to alias
		$scope.toggleTermSelection = function(term){
			
			var termName = term.name; // get the name

			// If originally added, remove it
			if (term.added) { 

     				term.added = false; // added parameter

				// Check if there are still terms added, if not, flag
				if (!$scope.checkTermsAdded($scope.termList)) {

					// Toggle boolean
					steps.terms.completed = false;
	
					// Count the number of completed steps
					$scope.numOfCompletedSteps = stepsCompleted(steps);

					// Change progress bar
					$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
	
				}

			}
			else { // Orignally not added, add it

				term.added = true;

				// Boolean
				steps.terms.completed = true;

				// Count the number of steps completed
				$scope.numOfCompletedSteps = stepsCompleted(steps);

				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);

			}

   		}


     	
  		// Submit new alias
        $scope.submitAlias = function () {
    
            if ($scope.checkForm()) {
                
                // Fill it with the added terms from termList
				angular.forEach($scope.termList, function(term) {
			    	if(term.added == true) 
				    	$scope.newAlias.terms.push(term.name);
				});

    			// Submit form
	    		$.ajax({
		    		type: "POST",
			    	url: "php/alias/insert_alias.php",
				    data: $scope.newAlias,
    				success: function() {
	    				window.location.href = URLPATH+"main.php#/alias";
		    		}
			    });
            }
		}
				
		// Function to assign termFilter when textbox is changing 
		$scope.changeTermFilter = function (termFilter) {
			$scope.termFilter = termFilter;
		}

		// Function for searching through the expression list
		$scope.searchTermsFilter = function (term) {
    			var keyword = new RegExp($scope.termFilter, 'i');
    			return !$scope.termFilter || keyword.test(term.name);
		};

        // Function to assign eduMateFilter when textbox is changing 
		$scope.changeEduMatFilter = function (eduMatFilter) {
			$scope.eduMatFilter = eduMatFilter;
		}

		// Function for searching through the educational material list
		$scope.searchEduMatsFilter = function (edumat) {
    			var keyword = new RegExp($scope.eduMatFilter, 'i');
    			return !$scope.eduMatFilter || keyword.test(edumat.name_EN);
		};


		// Function for selecting all terms in the expression list
		$scope.selectAllFilteredTerms = function() {
			var filtered = $scope.filter($scope.termList, $scope.termFilter);

			if (selectAll) { // was checked
				angular.forEach(filtered, function(term) {
					term.added = false;
				});
				selectAll = false; // toggle off

				// Check if there are still terms added, if not, flag
				if (!$scope.checkTermsAdded($scope.termList)) {

					// Toggle boolean
					steps.terms.completed = false;
	
					// Count the number of completed steps
					$scope.numOfCompletedSteps = stepsCompleted(steps);

					// Change progress bar
					$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
	
				}

			}
			else { // was not checked
				angular.forEach(filtered, function(term) {
					term.added = true;
				});

				selectAll = true; // toggle on

				// Boolean
				steps.terms.completed = true;

				// Count the number of steps completed
				$scope.numOfCompletedSteps = stepsCompleted(steps);

				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);

			}
		}
	
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
	
		// Function to return boolean for # of added terms
		$scope.checkTermsAdded = function(termList) {
			
			var addedParam = false;
			angular.forEach(termList, function(term) {
				if (term.added == true)
					addedParam = true;
			});
			if (addedParam)
				return true;
			else
				return false;
		}

        // Function to return boolean for form completion
        $scope.checkForm = function() {
            
            if ($scope.newAlias.name_EN && $scope.newAlias.name_FR && $scope.newAlias.description_EN 
                    && $scope.newAlias.description_FR && $scope.newAlias.type && $scope.checkTermsAdded($scope.termList)) { 
                return true;
            }
            else
                return false;
        }

	});



