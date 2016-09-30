angular.module('ATO_InterfaceApp.controllers.postController', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns', 'textAngular']).


    // Function to accept/trust html (styles, classes, etc.)
    filter('deliberatelyTrustAsHtml', function($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }).
	/******************************************************************************
	* Post Page controller 
	*******************************************************************************/
	controller('postController', function($scope, $filter, $sce, $uibModal, postAPIservice, filterAPIservice) {

        // Function to go to add post page
        $scope.goToAddPost = function () {
            window.location.href = URLPATH+"main.php#/post/add";
        }
 
        $scope.bannerMessage = "";
        // Function to show page banner 
        $scope.showBanner = function() {
            $(".bannerMessage").slideDown(function()  {
                setTimeout(function() {             
                    $(".bannerMessage").slideUp(); 
                }, 5000); 
            });
        }

        // Function to set banner class
        $scope.setBannerClass = function(classname) {
            // Remove any classes starting with "alert-" 
            $(".bannerMessage").removeClass (function (index, css) {
                return (css.match (/(^|\s)alert-\S+/g) || []).join(' ');
            });
            // Add class
            $(".bannerMessage").addClass('alert-'+classname);
        };

        $scope.changesMade = false;

    	// Templates for post table
		var cellTemplateName = '<div style="cursor:pointer; padding-top: 5px;" ' + 
            'ng-click="grid.appScope.editPost(row.entity)">' + 
            '<a href="">{{row.entity.name_EN}} / {{row.entity.name_FR}}</a></div>';
      	var checkboxCellTemplate = '<div style="text-align: center; cursor: pointer;" ' +
            'ng-click="grid.appScope.checkPublishFlag(row.entity)" ' +
            'class="ui-grid-cell-contents"><input style="margin: 4px;" type="checkbox" ' +
            'ng-checked="grid.appScope.updatePublishFlag(row.entity.publish)" ng-model="row.entity.publish"></div>';  
		var cellTemplateOperations = '<div style="text-align:center; padding-top: 5px;">' +
            '<strong><a href="" ng-click="grid.appScope.editPost(row.entity)">Edit</a></strong> ' + 
            '- <strong><a href="" ng-click="grid.appScope.deletePost(row.entity)">Delete</a></strong></div>';
      

     	// post table search textbox param
		$scope.filterOptions = function(renderableRows) {
            var matcher = new RegExp($scope.filterValue, 'i');
            renderableRows.forEach( function( row ) {
                var match = false;
                [ 'name_EN', 'type' ].forEach(function( field ){
                    if( row.entity[field].match(matcher) ){
                        match = true;
                    }
                });
                if( !match ){
                    row.visible = false;
                }
            });

            return renderableRows;
        };
   

        $scope.filterPost = function(filterValue) {
            $scope.filterValue = filterValue
            $scope.gridApi.grid.refresh();
            
        };

        // Table options for post
    	$scope.gridOptions = { 
			data: 'postList',
			columnDefs: [
				{field:'name_EN', displayName:'Name (EN / FR)', cellTemplate:cellTemplateName, width:'355'},
				{field:'type', displayName:'Type', width:'145'},
                {field:'publish', displayName:'Publish Flag', width:'150', cellTemplate:checkboxCellTemplate},
				{field:'publish_date', displayName:'Publish Date', width:'130'},
				{name:'Operations', cellTemplate:cellTemplateOperations, sortable:false}
			],
            useExternalFiltering: true,
			enableColumnResizing: true,	
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor($scope.filterOptions, 300);
            },
	
		};	

		// Initialize list of existing post
		$scope.postList = [];
        $scope.postPublishes = {
            publishList: []
        };

		// Initialize an object for deleting post
		$scope.postToDelete = {};

        // Call our API to get the list of existing posts
		postAPIservice.getPosts().success(function (response) {
			// Assign value
			$scope.postList = response;
		});

        // When this function is called, we set the "trasnfer" field to checked 
		// or unchecked based on value in the argument
		$scope.updatePublishFlag = function (value) {
            value = parseInt(value);
			if (value == 1) {
				return 1;
			} else {
				return 0;
			}
		}


        // Function for when the post checkbox has been modified
		$scope.checkPublishFlag = function (post) {

            $scope.changesMade = true;
            post.publish = parseInt(post.publish);
			// If the "publish" column has been checked
			if (post.publish) {
				post.publish = 0; // set publish to "false"
			}

			// Else the "Publish" column was unchecked
			else {
				post.publish = 1; // set publish to "true"
			}
		};

        // Function to submit changes when publish flags have been modified
        $scope.submitPublishFlags = function() {
            if($scope.changesMade) {
                angular.forEach($scope.postList, function(post) {
                    $scope.postPublishes.publishList.push({
                        serial:post.serial,
                        publish:post.publish
                    });
                });
	            // Submit form
		    	$.ajax({
			    	type: "POST",
				    url: "php/post/update_publishFlag.php",
    				data: $scope.postPublishes,
	    			success: function(response) {
                        // Call our API to get the list of existing posts
                		postAPIservice.getPosts().success(function (response) {
			                // Assign value
            		    	$scope.postList = response;
                		});
                        response = JSON.parse(response);
                        // Show success or failure depending on response
                        if (response.value) {
                            $scope.setBannerClass('success');
                            $scope.bannerMessage = "Publish Flags Saved!";
                        }
                        else {
                            $scope.setBannerClass('danger');
                            $scope.bannerMessage = response.message;
                        }
                        $scope.showBanner();
                        $scope.changesMade = false;
                    }
    			}); 
	    	}
        }

		// Initialize a scope variable for a selected post
		$scope.currentPost = {};

		// Function for when the post has been clicked for editing
		// We open a modal
		$scope.editPost = function (post) {

			$scope.currentPost = post;
			var modalInstance = $uibModal.open({
				templateUrl: 'editPostModalContent.htm',
				controller: EditPostModalInstanceCtrl,
				scope: $scope,
				windowClass: 'customModal',
			});
	
			// After update, refresh the post list
			modalInstance.result.then(function () {
				// Call our API to get the list of existing posts
				postAPIservice.getPosts().success(function (response) {
			
					// Assign the retrieved response
        			$scope.postList = response;
    			});
			});

		};

		// Controller for the edit post modal
		var EditPostModalInstanceCtrl = function ($scope, $uibModalInstance, $filter) {

			// Default Booleans
			$scope.changesMade = false; // changes have been made? 
 
            // Responsible for "searching" in search bars
            $scope.filter = $filter('filter');

			$scope.post = {}; // initialize post object
			$scope.postModal = {}; // for deep copy

            // Initialize lists to hold filters
            $scope.termList = [];
            $scope.dxFilterList = [];
            $scope.doctorFilterList = [];
            $scope.resourceFilterList = [];

            // Initialize search field variables
            $scope.termSearchField = "";
            $scope.dxSearchField = "";
            $scope.doctorSearchField = "";
            $scope.resourceSearchField = "";

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

            /* Function for the "Processing" dialog */
            var processingModal;
	        $scope.showProcessingModal = function() {

            	processingModal = $uibModal.open({
                    templateUrl: 'processingModal.htm',
	                backdrop: 'static',
        	        keyboard: false,
    	       	});	
            }
            // Show processing dialog
            $scope.showProcessingModal(); 

			// Call our API service to get the current post details
			postAPIservice.getPostDetails($scope.currentPost.serial).success(function (response) {
			
				// Assign value
				$scope.post = response;
				$scope.postModal = jQuery.extend(true, {}, $scope.post); // deep copy

                if ($scope.post.publish_date) {
                    var publishDateTime = $scope.post.publish_date.split(" ");
                    $scope.post.publish_date = publishDateTime[0];
                    $scope.post.publish_time = publishDateTime[1];

                    // Split the hours and minutes to display them in their respective text boxes
    			    var hours = $scope.post.publish_time.split(":")[0];
    	    		var minutes = $scope.post.publish_time.split(":")[1];
	    	    	var d = new Date();
		    	    d.setHours(hours);
    		    	d.setMinutes(minutes);
	    		    $scope.post.publish_time = d;

                    var year = $scope.post.publish_date.split("-")[0];
                    var month = parseInt($scope.post.publish_date.split("-")[1]) - 1;
                    var day = parseInt($scope.post.publish_date.split("-")[2]);
                    $scope.post.publish_date = new Date(year,month,day);
                }

				// Call our API service to get each filter
				filterAPIservice.getFilters().success(function (response) {

					$scope.termList = checkAdded(response.expressions); // Assign value
                    $scope.dxFilterList = checkAdded(response.dx);
                    $scope.doctorFilterList = checkAdded(response.doctors);
                    $scope.resourceFilterList = checkAdded(response.resources);

                    processingModal.close(); // hide modal
                    processingModal = null; // remove reference

				});
			});

			// Function to toggle Item in a list on/off
			$scope.selectItem = function(item){
                $scope.changesMade = true;
                if(item.added)
                    item.added = 0;
                else
                    item.added = 1;
            };
		
            // Function for selecting all terms in the expression list
            var selectAllTerms = false;
            $scope.selectAllTerms = function() {
                var filtered = $scope.filter($scope.termList, $scope.termSearchField);

                $scope.changesMade = true;
    
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

            // Function to assign 1 to existing filters
            function checkAdded(filterList) {
                angular.forEach($scope.post.filters, function(selectedFilter) {
                    var selectedFilterId = selectedFilter.id;
                    var selectedFilterType = selectedFilter.type;
                    angular.forEach(filterList, function (filter) {
                        var filterId = filter.id;
                        var filterType = filter.type;
                        if (filterId == selectedFilterId && filterType == selectedFilterType) {
                            filter.added = 1;
                        }
                    });
                });

                return filterList;
            }

            // Function to check necessary form fields are complete
            $scope.checkForm = function() {
                if ($scope.post.name_EN && $scope.post.name_FR && $scope.post.body_EN && $scope.post.body_FR 
                        && ($scope.post.type != 'Announcement' || ($scope.post.publish_date && $scope.post.publish_time)) 
                        && $scope.changesMade) {
                    return true;
                }
                else
                    return false;
            }

            $scope.setChangesMade = function() {
                $scope.changesMade = true;
            }

			// Submit changes
			$scope.updatePost = function () {

                if($scope.checkForm()) {
                    $scope.post.filters = []; // Empty filters
		            // Add filters to post
                    addFilters($scope.termList);
                    addFilters($scope.dxFilterList);
                    addFilters($scope.doctorFilterList);
                    addFilters($scope.resourceFilterList);
                    if ($scope.post.publish_date) {
	                    // Concat date and time
                        $scope.post.publish_date = String(moment($scope.post.publish_date).format("YYYY-MM-DD")) + " " +
                            String(moment($scope.post.publish_time).format("HH:mm"));
                    }
    				// Submit form
	    			$.ajax({
		    			type: "POST",
			    		url: "php/post/update_post.php",
				    	data: $scope.post,
					    success: function(response) {
                            response = JSON.parse(response);
                               // Show success or failure depending on response
                            if (response.value) {
                                $scope.setBannerClass('success');
                                $scope.$parent.bannerMessage = "Successfully updated \"" + $scope.post.name_EN + "/ " + $scope.post.name_FR + "\"!" ;
                            }
                            else {
                                $scope.setBannerClass('danger');
                                $scope.$parent.bannerMessage = response.message;
                            }

                            $scope.showBanner();
						    $uibModalInstance.close();
    					}
	    			});
		    	}
            }

            // Function to return filters that have been checked
            function addFilters(filterList) {
                angular.forEach(filterList, function(Filter) {
                    if(Filter.added)
                        $scope.post.filters.push({id:Filter.id, type:Filter.type})
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

			// Function to properly render the modal 
			// plus enable resizable functions
			setTimeout(function () {
                var resizeOpts = {
                    handles: "all", autoHide: true
                };

                $(".customModal .modal-content").resizable(resizeOpts);
            }, 0);

		};


		// Function for when the post has been clicked for deletion
		// Open a modal
		$scope.deletePost = function(currentPost) {

			// Assign selected post as the post to delete
			$scope.postToDelete = currentPost;
			var modalInstance = $uibModal.open({
				templateUrl: 'deletePostModalContent.htm',
				controller: DeletePostModalInstanceCtrl,
				windowClass: 'deleteModal',
				scope: $scope,
			});

			// After delete, refresh the post list
			modalInstance.result.then(function () {
				// Call our API to get the list of existing posts
				postAPIservice.getPosts().success(function (response) {
					// Assign the retrieved response
        				$scope.postList = response;
    				});
			});

		}

		// Controller for the delete post modal
		var DeletePostModalInstanceCtrl = function ($scope, $uibModalInstance) {
	
			// Submit delete
			$scope.deletePost = function () {
				$.ajax({
					type: "POST",
					url: "php/post/delete_post.php",
					data: $scope.postToDelete,
					success: function(response) {
                        response = JSON.parse(response);
                        // Show success or failure depending on response
                        if (response.value) {
                            $scope.setBannerClass('success');
                            $scope.$parent.bannerMessage = "Successfully deleted \"" + $scope.postToDelete.name_EN + "/ " + $scope.postToDelete.name_FR + "\"!";
                        }
                        else {
                            $scope.setBannerClass('danger');
                            $scope.$parent.bannerMessage = response.message;
                        }
                        $scope.showBanner();
						$uibModalInstance.close();
					}
				});
			}
	
			// Function to close modal dialog
  			$scope.cancel = function () {
    				$uibModalInstance.dismiss('cancel');
  			};

			// Function to properly render the modal 
			// plus enable draggable and resizable functions
			setTimeout(function () {
                $(".deleteModal .modal-dialog").draggable();

                var resizeOpts = {
                    handles: "all", autoHide: true
                };

                $(".deleteModal .modal-content").resizable(resizeOpts);
            }, 0);

		};
    });

        
