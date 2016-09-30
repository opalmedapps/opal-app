angular.module('ATO_InterfaceApp.controllers.aliasController', ['ngAnimate', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns']).


	/******************************************************************************
	* Alias Page controller 
	*******************************************************************************/
	controller('aliasController', function($scope, $uibModal, aliasAPIservice, edumatAPIservice) {


        // Function to go to add alias page
        $scope.goToAddAlias = function () {
            window.location.href = URLPATH+"main.php#/alias/add";
        }
 
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

		// Initialize a scope variable for a selected alias
		$scope.currentAlias = {};
        
        $scope.changesMade = false;

		// Templates for alias table
		var cellTemplateName = '<div style="cursor:pointer; padding-top: 5px;" ' + 
            'ng-click="grid.appScope.editAlias(row.entity)">' + 
            '<a href="">{{row.entity.name_EN}} / {{row.entity.name_FR}}</a></div>';
      	var checkboxCellTemplate = '<div style="text-align: center; cursor: pointer;" ' +
            'ng-click="grid.appScope.checkAliasUpdate(row.entity)" ' +
            'class="ui-grid-cell-contents"><input style="margin: 4px;" type="checkbox" ' +
            'ng-checked="grid.appScope.updateVal(row.entity.update)" ng-model="row.entity.update"></div>';  
		var cellTemplateOperations = '<div style="text-align:center; padding-top: 5px;">' +
            '<strong><a href="" ng-click="grid.appScope.editAlias(row.entity)">Edit</a></strong> ' + 
            '- <strong><a href="" ng-click="grid.appScope.deleteAlias(row.entity)">Delete</a></strong></div>';

		// Alias table search textbox param
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
    
        $scope.filterAlias = function(filterValue) {
            $scope.filterValue = filterValue
            $scope.gridApi.grid.refresh();
            
        };

        // Table options for aliases
    	$scope.gridOptions = { 
			data: 'aliasList',
			columnDefs: [
				{field:'name_EN', displayName:'Alias (EN / FR)', cellTemplate:cellTemplateName, width:'405'},
				{field:'type', displayName:'Type', width:'175'},
                {field:'update', displayName:'Update', width:'80', cellTemplate:checkboxCellTemplate},
				{field:'count', displayName:'# of terms', width:'90'},
				{name:'Operations', cellTemplate:cellTemplateOperations, sortable:false}
			],
            useExternalFiltering: true,
			enableColumnResizing: true,	
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor($scope.filterOptions, 300);
            },
	
		};

		// Initialize list of existing aliases
		$scope.aliasList = [];
        $scope.aliasUpdates = {
            updateList: []
        };

		// Initialize an object for deleting alias
		$scope.aliasToDelete = {};

        // Call our API to get the list of existing aliases
		aliasAPIservice.getAliases().success(function (response) {
			// Assign value
			$scope.aliasList = response;

		});

        // When this function is called, we set the "update" field to checked 
		// or unchecked based on value in the argument
		$scope.updateVal = function (value) {
            value = parseInt(value);
			if (value == 1) {
				return 1;
			} else {
				return 0;
			}
		}
        // Function for when the alias "Update" checkbox has been modified
		// for the selected alias in the table row
		$scope.checkAliasUpdate = function (alias) {

            $scope.changesMade = true;
            alias.update = parseInt(alias.update);
			// If the "Update" column has been checked
			if (alias.update) {
				alias.update = 0; // set update to "true"
			}

			// Else the "Update" column was unchecked
			else {
				alias.update = 1; // set update to "false"
			}
		};

        // Function to submit changes when update checkboxes have been modified
        $scope.submitUpdate = function() {

            if($scope.changesMade) {
    			angular.forEach($scope.aliasList, function(alias) {
	    			$scope.aliasUpdates.updateList.push({
                        serial:alias.serial,
                        update:alias.update
                    });
    			});
	    		// Submit form
		    	$.ajax({
			    	type: "POST",
				    url: "php/alias/update_control.php",
    				data: $scope.aliasUpdates,
	    			success: function(response) {
                        // Call our API to get the list of existing aliases
                		aliasAPIservice.getAliases().success(function (response) {
			                // Assign value
            		    	$scope.aliasList = response;
                		});
                        response = JSON.parse(response);
                        // Show success or failure depending on response
                        if (response.value) {
                            $scope.setBannerClass('success');
                            $scope.bannerMessage = "Updates Saved!";
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

		// Function for when the alias has been clicked for editing
		// We open a modal
		$scope.editAlias = function (alias) {

			$scope.currentAlias = alias;
			var modalInstance = $uibModal.open({
				templateUrl: 'editAliasModalContent.htm',
				controller: EditAliasModalInstanceCtrl,
				scope: $scope,
				windowClass: 'customModal',
			});
	
			// After update, refresh the alias list
			modalInstance.result.then(function () {
				// Call our API to get the list of existing aliases
				aliasAPIservice.getAliases().success(function (response) {
			
					// Assign the retrieved response
        				$scope.aliasList = response;
    				});
			});

		};

		// Controller for the edit alias modal
		var EditAliasModalInstanceCtrl = function ($scope, $uibModalInstance) {

			// Default Booleans
			$scope.changesMade = false; // changes have been made? 
			$scope.emptyTitle = false; // alias title field empty? 
			$scope.emptyDescription = false; // alias description field empty? 
			$scope.emptyTerms = false; // alias terms field empty? 
			$scope.nameMod = false; // name modified?
			$scope.termsMod = false; // terms modified? 

			$scope.alias = {}; // initialize alias object
			$scope.aliasModal = {}; // for deep copy
			$scope.termList = []; // initialize list for unassigned expressions in our DB
            $scope.eduMatList = [];

			$scope.termFilter;
            $scope.eduMatFilter;

            // Call our API service to get the list of educational material
            edumatAPIservice.getEducationalMaterials().success(function (response) {
                $scope.eduMatList = response; // Assign value
            });

			// Function to assign termFilter when textbox is changing 
			$scope.changeTermFilter = function (termFilter) {
				$scope.termFilter = termFilter;
			}

			// Function for searching through expression names
			$scope.searchTermsFilter = function (term) {
    				var keyword = new RegExp($scope.termFilter, 'i');
    				return !$scope.termFilter || keyword.test(term.name);
			};

            // Function to assign eduMatFilter when textbox is changing 
			$scope.changeEduMatFilter = function (eduMatFilter) {
				$scope.eduMatFilter = eduMatFilter;
			}

			// Function for searching through expression names
			$scope.searchEduMatsFilter = function (edumat) {
    				var keyword = new RegExp($scope.eduMatFilter, 'i');
    				return !$scope.eduMatFilter || keyword.test(edumat.name_EN);
			};

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

			// Call our API service to get the current alias details
			aliasAPIservice.getAliasDetails($scope.currentAlias.serial).success(function (response) {
			
				// Assign value
				$scope.alias = response;
				$scope.aliasModal = jQuery.extend(true, {}, $scope.alias); // deep copy


				// Call our API service to get the list of alias expressions
				aliasAPIservice.getExpressions($scope.alias.type).success(function (response) {
					$scope.termList = response; // Assign value

                    processingModal.close(); // hide modal
                    processingModal = null; // remove reference
				
                    
					// Set false for each term in termList
					angular.forEach($scope.termList, function (term) {
						term.added = false;
					});

                	// Loop within current alias' expressions (terms) 
				    angular.forEach($scope.alias.terms, function(selectedTerm) {

    					// Loop within each of the existing terms
	    				angular.forEach($scope.termList, function(term) {
		    				var termName = term.name; // get the name
                            var selectedTermName = selectedTerm.name;
                            
			    			if (selectedTermName == termName) { // If term is selected (from current alias)
				    			term.added = true; // term added?
					    	}
    					}); 
	    					
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
			});

			// Function to add / remove a term to alias
			$scope.toggleTermSelection = function(term){
				var termName = term.name; // get the name

				// Toggle booleans
				$scope.changesMade = true; 
				$scope.termsMod = true;
				
				// Toggle boolean 
				$scope.emptyTerms = false;

				// If originally added, remove it
				if (term.added) {

					term.added = false;
				
					// Check if there are still terms added, if not, flag
					if (!$scope.checkTermsAdded($scope.termList)) {
						$scope.emptyTerms = true;
					}

				} else { // Originally not added, add it

     					term.added = true; // added parameter
	
					// Just in case it was originally true
					// For sure we have a term
					$scope.emptyTerms = false;

				}
			
	   		}

			// Function that triggers when the title is updated
			$scope.titleUpdate = function () {

				// Toogle booleans
				$scope.changesMade = true;

				if ($scope.alias.name_EN && $scope.alias.name_FR) { // if textbox field is not empty

					// Toggle boolean
					$scope.emptyTitle = false;
				}
				else { // textbox is empty

					// Toggle boolean
					$scope.emptyTitle = true;
				}

			};
			// Function that triggers when the description is updated
			$scope.descriptionUpdate = function () {

				// Toogle booleans
				$scope.changesMade = true;

				if ($scope.alias.description_EN && $scope.alias.description_FR) { // if textbox field is not empty

					// Toggle boolean
					$scope.emptyDescription = false;
				}
				else { // textbox is empty

					// Toggle boolean
					$scope.emptyDescription = true;
				}

			};

            $scope.eduMatUpdate = function() {

                // Toggle boolean
                $scope.changesMade = true;
            }

			$scope.toggleAlertText = function() {
				if ($scope.emptyTitle || $scope.emptyDescription || $scope.emptyTerms) {
					return true; // boolean
				}
				else {
					return false;	
				}
			}

			// Submit changes
			$scope.updateAlias = function () {

                if ($scope.checkForm()) {
    				// Empty alias terms list
	    			$scope.alias.terms = [];
		
		    		// Fill it with the added terms from termList
			    	angular.forEach($scope.termList, function(term) {
				    	if(term.added == true) 
					    	$scope.alias.terms.push(term.name);
    				});
	
	    			// Submit form
		    		$.ajax({
			    		type: "POST",
				    	url: "php/alias/update_alias.php",
					    data: $scope.alias,
    					success: function(response) {
                            response = JSON.parse(response);
                            // Show success or failure depending on response
                            if (response.value) {
                                $scope.setBannerClass('success');
                                $scope.$parent.bannerMessage = "Successfully updated \"" + $scope.alias.name_EN + "/ " + $scope.alias.name_FR + "\"!";
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

			// Function to close modal dialog
  			$scope.cancel = function () {
    				$uibModalInstance.dismiss('cancel');
  			};

            // Function to return boolean for form completion
            $scope.checkForm = function() {
            
                if ($scope.alias.name_EN && $scope.alias.name_FR && $scope.alias.description_EN 
                        && $scope.alias.description_FR && $scope.alias.type && $scope.checkTermsAdded($scope.termList)
                        && $scope.changesMade) { 
                    return true;
                }
                else
                    return false;
            }


			// Function to properly render the modal 
			// plus enable resizable functions
			setTimeout(function () {
                            var resizeOpts = {
                                handles: "all", autoHide: true
                            };

                            $(".aliasModal .modal-content").resizable(resizeOpts);
                        }, 0);

		};

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

		// Function for when the alias has been clicked for deletion
		// Open a modal
		$scope.deleteAlias = function(currentAlias) {

			// Assign selected alias as the alias to delete
			$scope.aliasToDelete = currentAlias;
			var modalInstance = $uibModal.open({
				templateUrl: 'deleteAliasModalContent.htm',
				controller: DeleteAliasModalInstanceCtrl,
				windowClass: 'deleteModal',
				scope: $scope,
			});

			// After delete, refresh the alias list
			modalInstance.result.then(function () {
				// Call our API to get the list of existing aliases
				aliasAPIservice.getAliases().success(function (response) {
			
					// Assign the retrieved response
        				$scope.aliasList = response;
    				});
			});

		}

		// Controller for the delete alias modal
		var DeleteAliasModalInstanceCtrl = function ($scope, $uibModalInstance) {
	
			// Submit delete
			$scope.deleteAlias = function () {
				$.ajax({
					type: "POST",
					url: "php/alias/delete_alias.php",
					data: $scope.aliasToDelete,
					success: function(response) {
                        response = JSON.parse(response);
                        // Show success or failure depending on response
                        if (response.value) {
                            $scope.setBannerClass('success');
                            $scope.$parent.bannerMessage = "Successfully deleted \"" + $scope.aliasToDelete.name_EN + "/ " + $scope.aliasToDelete.name_FR + "\"!";
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

