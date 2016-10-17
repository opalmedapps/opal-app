angular.module('ATO_InterfaceApp.controllers.eduMatController', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.grid', 'ui.grid.expandable', 'ui.grid.resizeColumns']).


	/******************************************************************************
	* Educational Material Page controller 
	*******************************************************************************/
	controller('eduMatController', function($scope, $filter, $sce, $uibModal, edumatAPIservice, filterAPIservice) {

    
        // Function to go to add educational material page
        $scope.goToAddEducationalMaterial = function () {
            window.location.href = URLPATH+"main.php#/educational-material/add";
        }

        // Function to control search engine model
        $scope.filterEduMat = function(filterValue) {
            $scope.filterValue = filterValue
            $scope.gridApi.grid.refresh();
            
        };
   	
        // Templates for the table
		var cellTemplateName = '<div style="cursor:pointer; padding-top: 5px;" ' + 
            'ng-click="grid.appScope.editEduMat(row.entity)"> ' +
            '<a href="">{{row.entity.name_EN}} / {{row.entity.name_FR}}</a></div>';
      	var checkboxCellTemplate = '<div style="text-align: center; cursor: pointer;" ' +
            'ng-click="grid.appScope.checkPublishFlag(row.entity)" ' +
            'class="ui-grid-cell-contents"><input style="margin: 4px;" type="checkbox" ' +
            'ng-checked="grid.appScope.updatePublishFlag(row.entity.publish)" ng-model="row.entity.publish"></div>';  
		var cellTemplateOperations = '<div style="text-align:center; padding-top: 5px;">' +
            '<strong><a href="" ng-click="grid.appScope.editEduMat(row.entity)">Edit</a></strong> ' + 
            '- <strong><a href="" ng-click="grid.appScope.deleteEduMat(row.entity)">Delete</a></strong></div>';
        var expandableRowTemplate = '<div ui-grid="row.entity.subGridOptions"></div>';
      
    	// Search engine for table
		$scope.filterOptions = function(renderableRows) {
            var matcher = new RegExp($scope.filterValue, 'i');
            renderableRows.forEach( function( row ) {
                var match = false;
                [ 'name_EN', 'type_EN' ].forEach(function( field ){
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

        // Table options for education material
    	$scope.gridOptions = { 
			data: 'eduMatList',
			columnDefs: [
				{field:'name_EN', displayName:'Name (EN / FR)', cellTemplate:cellTemplateName, width:'355'},
				{field:'type_EN', displayName:'Type (EN)', width:'145'},
                {field:'publish', displayName:'Publish Flag', width:'130', cellTemplate:checkboxCellTemplate},
				{field:'phase_EN', displayName:'Phase In Tx (EN)', width:'150'},
				{name:'Operations', cellTemplate:cellTemplateOperations, sortable:false}
			],
            useExternalFiltering: true,
			enableColumnResizing: true,	
            expandableRowTemplate: expandableRowTemplate,
            //expandableRowHeight: 200,
            expandableRowScope: {
                subGridVariable: 'subGridScopeVariable'
            },
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor($scope.filterOptions, 300);
            },
        };
	
    	// Initialize list of existing material
		$scope.eduMatList = [];
        $scope.eduMatPublishes = {
            publishList: []
        };

		// Initialize an object for deleting material
		$scope.eduMatToDelete = {};

        // Call our API to get the list of existing material
		edumatAPIservice.getEducationalMaterials().success(function (response) {
			// Assign value
            for( i = 0; i < response.length; i++ ){
                if (response[i].parentFlag == 1) {
                    response[i].subGridOptions = {
                       columnDefs: [
                            {field:'name_EN', displayName:'Name (EN)', width:'355'},
                            {field:'type_EN', displayName:'Type (EN)', width:'145'}
                        ],
                        data: response[i].tocs
                    };
                    $scope.eduMatList.push(response[i]);
                }
            }

        });


        $scope.bannerMessage = "";
        // Function to show page banner 
        $scope.showBanner = function() {
            $(".bannerMessage").slideDown(function()  {
                setTimeout(function() {             
                    $(".bannerMessage").slideUp(); 
                }, 3000); 
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


        // When this function is called, we set the "publish" field to checked 
		// or unchecked based on value in the argument
		$scope.updatePublishFlag = function (value) {
            value = parseInt(value);
			if (value == 1) {
				return 1;
			} else {
				return 0;
			}
		}

        // Function for when the publish flag checkbox has been modified
		$scope.checkPublishFlag = function (edumat) {

            $scope.changesMade = true;
            edumat.publish = parseInt(edumat.publish);
			// If the "publish" column has been checked
			if (edumat.publish) {
				edumat.publish = 0; // set publish to "false"
			}

			// Else the "publish" column was unchecked
			else {
				edumat.publish = 1; // set publish to "true"
			}
		};
 
        // Function to submit changes when publish flags have been modified
        $scope.submitPublishFlags = function() {
            if($scope.changesMade) {
                angular.forEach($scope.eduMatList, function(edumat) {
                    $scope.eduMatPublishes.publishList.push({
                        serial:edumat.serial,
                        publish:edumat.publish
                    });
                });
	            // Submit form
		    	$.ajax({
			    	type: "POST",
				    url: "php/educational-material/update_publishFlag.php",
    				data: $scope.eduMatPublishes,
	    			success: function(response) {
                        // Call our API to get the list of existing educational materials
                		edumatAPIservice.getEducationalMaterials().success(function (response) {
			                // Assign value
            		    	$scope.edumatList = response;
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

		// Initialize a scope variable for a selected educational material
		$scope.currentEduMat = {};

		// Function for when the edu material has been clicked for editing
		// We open a modal
		$scope.editEduMat = function (edumat) {

			$scope.currentEduMat = edumat;
			var modalInstance = $uibModal.open({
				templateUrl: 'editEduMatModalContent.htm',
				controller: EditEduMatModalInstanceCtrl,
				scope: $scope,
				windowClass: 'customModal',
			});
	
			// After update, refresh the edu mat list
			modalInstance.result.then(function () {
			    $scope.eduMatList = [];
				// Call our API to get the list of existing educational material
				edumatAPIservice.getEducationalMaterials().success(function (response) {
                    for( i = 0; i < response.length; i++ ){
                        if (response[i].parentFlag == 1) {
                            response[i].subGridOptions = {
                               columnDefs: [
                                    {field:'name_EN', displayName:'Name (EN / FR)', width:'355'},
                                   {field:'type_EN', displayName:'Type (EN)', width:'145'}
                                ],
                                data: response[i].tocs,
                            };
                            $scope.eduMatList.push(response[i]);
                        }
                    }

    			});

			});

		};

    	// Controller for the edit edu mat modal
		var EditEduMatModalInstanceCtrl = function ($scope, $uibModalInstance, $filter) {

			// Default Booleans
			$scope.changesMade = false; // changes have been made? 
 
            // Responsible for "searching" in search bars
            $scope.filter = $filter('filter');

			$scope.eduMat = {}; // initialize edumat object

            // Initialize lists to hold filters
            $scope.termList = [];
            $scope.dxFilterList = [];
            $scope.doctorFilterList = [];
            $scope.resourceFilterList = [];
                   
            // Initialize lists to hold the distinct edu material types
            $scope.EduMatTypes_EN = [];
            $scope.EduMatTypes_FR = [];
            // Call our API to get the list of edu material types
            edumatAPIservice.getEducationalMaterialTypes().success(function (response) {

                $scope.EduMatTypes_EN = response.EN;
                $scope.EduMatTypes_FR = response.FR;
            });


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

			// Call our API service to get the current educational material details
			edumatAPIservice.getEducationalMaterialDetails($scope.currentEduMat.serial).success(function (response) {
			
				// Assign value
				$scope.eduMat = response;

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

            // Function to assign '1' to existing filters
            function checkAdded(filterList) {
                angular.forEach($scope.eduMat.filters, function(selectedFilter) {
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
                if ($scope.eduMat.name_EN && $scope.eduMat.name_FR && ( ($scope.eduMat.url_EN && $scope.eduMat.url_FR) 
                        || $scope.tocsComplete ) && $scope.changesMade) {
                    return true;
                }
                else
                    return false;
            }

            $scope.setChangesMade = function() {
                $scope.changesMade = true;
                $scope.tocsComplete = true;
                if(!$scope.eduMat.tocs.length) {
                    $scope.tocsComplete = false;
                }
                else {
                    angular.forEach($scope.eduMat.tocs, function(toc) {
                        if(!toc.name_EN || !toc.name_FR || !toc.url_EN 
                            || !toc.url_FR || !toc.type_EN || !toc.type_FR) {
                            $scope.tocsComplete = false;
                        }
                    });
                }

            }

			// Submit changes
			$scope.updateEduMat = function () {

                if($scope.checkForm()) {

                    // Intialize filter
                    $scope.eduMat.filters = [];
		            // Add filters to edu material
                    addFilters($scope.termList);
                    addFilters($scope.dxFilterList);
                    addFilters($scope.doctorFilterList);
                    addFilters($scope.resourceFilterList);
                 
                    // Submit form
	    			$.ajax({
		    			type: "POST",
			    		url: "php/educational-material/update_educationalMaterial.php",
				    	data: $scope.eduMat,
					    success: function(response) {
                            response = JSON.parse(response);
                            // Show success or failure depending on response
                            if (response.value) {
                                $scope.setBannerClass('success');
                                $scope.$parent.bannerMessage = "Successfully updated \"" + $scope.eduMat.name_EN + "/ " + $scope.eduMat.name_FR + "\"!" ;
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

            // Function to add table of contents to eduMat object
            $scope.addTOC = function() {
                var newOrder = $scope.eduMat.tocs.length+1;
                $scope.eduMat.tocs.push({
                    name_EN:"",
                    name_FR:"",
                    url_EN:"",
                    url_FR:"",
                    order:newOrder,
                    serial: null
                });
                $scope.setChangesMade();
            }

            // Function to remove table of contents from eduMat object
            $scope.removeTOC = function(order) {
                $scope.eduMat.tocs.splice(order-1,1);
                // Decrement orders for content after the one just removed
                for(var index = order-1; index < $scope.eduMat.tocs.length; index++) {
                    $scope.eduMat.tocs[index].order -= 1;
                }
                $scope.setChangesMade();
            }

            // Function to return filters that have been checked
            function addFilters(filterList) {
                angular.forEach(filterList, function(Filter) {
                    if(Filter.added)
                        $scope.eduMat.filters.push({id:Filter.id, type:Filter.type})
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

            // Function to accept/trust html (styles, classes, etc.)
            $scope.deliberatelyTrustAsHtml = function(htmlSnippet) {
                   return $sce.trustAsHtml(htmlSnippet);
            };

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

		// Function for when the edu material has been clicked for deletion
		// Open a modal
		$scope.deleteEduMat = function(currentEduMat) {

			// Assign selected educational material as the item to delete
			$scope.eduMatToDelete = currentEduMat;
			var modalInstance = $uibModal.open({
				templateUrl: 'deleteEduMatModalContent.htm',
				controller: DeleteEduMatModalInstanceCtrl,
				windowClass: 'deleteModal',
				scope: $scope,
			});

			// After delete, refresh the eduMat list
			modalInstance.result.then(function () {
                $scope.eduMatList = [];
				// Call our API to get the list of existing educational material
				edumatAPIservice.getEducationalMaterials().success(function (response) {
                    for( i = 0; i < response.length; i++ ){
                        if (response[i].parentFlag == 1) {
                            response[i].subGridOptions = {
                               columnDefs: [
                                    {field:'name_EN', displayName:'Name (EN / FR)', width:'355'},
                                   {field:'type_EN', displayName:'Type (EN)', width:'145'}
                                ],
                                data: response[i].tocs
                            };
                            $scope.eduMatList.push(response[i]);
                        }
                    }

    			});
			});
		}

		// Controller for the delete educational material modal
		var DeleteEduMatModalInstanceCtrl = function ($scope, $uibModalInstance) {
	
			// Submit delete
			$scope.deleteEducationalMaterial = function () {
				$.ajax({
					type: "POST",
					url: "php/educational-material/delete_educationalMaterial.php",
					data: $scope.eduMatToDelete,
					success: function(response) {
                        response = JSON.parse(response);
                        // Show success or failure depending on response
                        if (response.value) {
                            $scope.setBannerClass('success');
                            $scope.$parent.bannerMessage = "Successfully deleted \"" + $scope.eduMatToDelete.name_EN + "/ " + $scope.eduMatToDelete.name_FR + "\"!";
                        }
                        else {
                            $scope.setBannerClass('danger');
                            $scope.bannerMessage = response.message;
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
