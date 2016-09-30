angular.module('ATO_InterfaceApp.controllers.newPostController', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.grid', 'textAngular']).


    // Function to accept/trust html (styles, classes, etc.)
    filter('deliberatelyTrustAsHtml', function($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }).
	/******************************************************************************
	* Add Post Page controller 
	*******************************************************************************/
	controller('newPostController', function($scope, $filter, $sce, $uibModal, aliasAPIservice, filterAPIservice) {

        // Function to go to previous page
        $scope.goBack = function() {
            window.history.back();
        }

        // completed steps boolean object; used for progress bar
        var steps = {
            title: {completed: false},
            body: {completed: false},
            type: {completed: false},
            publish_date: {completed: false}
        };

        // Responsible for "searching" in search bars
        $scope.filter = $filter('filter');

        // Initialize search field variables
        $scope.termSearchField = null;
        $scope.dxSearchField = null;
        $scope.doctorSearchField = null;
        $scope.resourceSearchField = null;
    
        // Default count of completed steps
        $scope.numOfCompletedSteps = 0;

        // Default total number of steps 
        $scope.stepTotal = 4;

        // Progress for progress bar on default steps and total
        $scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);

        // Initialize the list of post types
        $scope.postTypes = [
            {name: 'Announcement'},
            {name: 'Treatment Team Message'}
        ];

        // Initialize the new post object
        $scope.newPost = {
            name_EN: null,
            name_FR: null,
            type: null,
            body_EN: null,
            body_FR: null,
            publish_date: null,
            publish_time: null,
            filters: []
        }

        // Initialize lists to hold filters
        $scope.termList = [];
        $scope.dxFilterList = [];
        $scope.doctorFilterList = [];
        $scope.resourceFilterList = [];

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

        // Function to toggle necessary changes when updating post name
        $scope.titleUpdate = function() {

            if ($scope.newPost.name_EN && $scope.newPost.name_FR) {
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

        // Function to toggle necessary changes when updating the post body
        $scope.bodyUpdate = function() {
            if ($scope.newPost.body_EN && $scope.newPost.body_FR) {
	            // Toggle boolean
				steps.body.completed = true;
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			} else {
				// Toggle boolean
				steps.body.completed = false;
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
		}

        // Funtion to toggle necessary changes when updating the post type
        $scope.typeUpdate = function() {
            // Toggle boolean
            steps.type.completed = true;

            // Remove any entry in publish date
            $scope.newPost.publish_date = null;
            $scope.newPost.publish_time = null;
            // toggle publish date logic
            if ($scope.newPost.type == 'Announcement') {
                steps.publish_date.completed = false;
            }
            else {
                steps.publish_date.completed = true;
            }

            // Count the number of completed steps
			$scope.numOfCompletedSteps = stepsCompleted(steps);
			// Change progress bar
			$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
		}

        // Function to toggle necessary changes when updating the publish date
        $scope.publishDateUpdate = function() {
            if ($scope.newPost.publish_date && $scope.newPost.publish_time) {
                // Toggle boolean
                steps.publish_date.completed = true;
		        // Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			} else {
				// Toggle boolean
				steps.publish_date.completed = false;
				// Count the number of completed steps
				$scope.numOfCompletedSteps = stepsCompleted(steps);
				// Change progress bar
				$scope.stepProgress = trackProgress($scope.numOfCompletedSteps, $scope.stepTotal);
			}
		}

        // Function to submit the new post
        $scope.submitPost = function() {
            if ($scope.checkForm()) {
                // Add filters to new post object
                addFilters($scope.termList);
                addFilters($scope.dxFilterList);
                addFilters($scope.doctorFilterList);
                addFilters($scope.resourceFilterList);
                if ($scope.newPost.publish_date && $scope.newPost.publish_time) {
                   // Concat date and time
                    $scope.newPost.publish_date = String(moment($scope.newPost.publish_date).format("YYYY-MM-DD")) + " " +
                        String(moment($scope.newPost.publish_time).format("HH:mm"));
                }
                // Submit 
                $.ajax({
                    type: "POST",
                    url: "php/post/insert_post.php",
                    data: $scope.newPost,
                    success: function() {
                        window.location.href = URLPATH+"main.php#/post";
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

        // Function to return filters that have been checked
        function addFilters(filterList) {
            angular.forEach(filterList, function(Filter) {
                if(Filter.added)
                    $scope.newPost.filters.push({id:Filter.id, type:Filter.type})
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

        
        $scope.showWeeks = true; // show weeks sidebar 
  		$scope.toggleWeeks = function () {
    			$scope.showWeeks = ! $scope.showWeeks;
  		};
		
		// set minimum date (today's date)
  		$scope.toggleMin = function() {
    			$scope.minDate = ( $scope.minDate ) ? null : new Date();
  		};
  		$scope.toggleMin();

        $scope.popup = {
            opened: false
        };

		// Open popup calendar
  		$scope.open = function() {
    			$scope.popup.opened = true;
  		};

  		$scope.dateOptions = {
    			'year-format': "'yy'",
    			'starting-day': 1
  		};

		// Date format
  		$scope.format = 'yyyy-MM-dd';

		// object for cron repeat units
		$scope.repeatUnits = [
			'Minutes',
			'Hours'
		];

    });

