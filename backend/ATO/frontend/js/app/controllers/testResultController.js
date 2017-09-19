angular.module('ATO_InterfaceApp.controllers.testResultController', ['ngAnimate', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns']).

	/******************************************************************************
	* Test Result Page controller 
	*******************************************************************************/
	controller('testResultController', function($scope, $filter, $sce, $uibModal, testresAPIservice, filterAPIservice) {

        // Function to go to add test result page
        $scope.goToAddTestResult = function () {
            window.location.href = URLPATH+"main.php#/test-result/add";
        }

        // Function to control search engine model
        $scope.filterTestResult = function (filter) {
            $scope.filterValue = filter;
            $scope.gridApi.grid.refresh();
        }

        // Templates for the table
        var cellTemplateName = '<div style="cursor:pointer;" class="ui-grid-cell-contents" ' + 
            'ng-click="grid.appScope.editTestResult(row.entity)"> ' +
            '<a href="">{{row.entity.name_EN}} / {{row.entity.name_FR}}</a></div>';
        var cellTemplateGroupName = '<div style="cursor:pointer;" class="ui-grid-cell-contents" ' + 
            'ng-click="grid.appScope.editTestResult(row.entity)"> ' +
            '<a href="">{{row.entity.group_EN}} / {{row.entity.group_FR}}</a></div>';
	    var checkboxCellTemplate = '<div style="text-align: center; cursor: pointer;" ' +
            'ng-click="grid.appScope.checkPublishFlag(row.entity)" ' +
            'class="ui-grid-cell-contents"><input style="margin: 4px;" type="checkbox" ' +
            'ng-checked="grid.appScope.updatePublishFlag(row.entity.publish)" ng-model="row.entity.publish"></div>';  
		var cellTemplateOperations = '<div style="text-align:center; padding-top: 5px;">' +
            '<strong><a href="" ng-click="grid.appScope.editTestResult(row.entity)">Edit</a></strong> ' + 
            '- <strong><a href="" ng-click="grid.appScope.deleteTestResult(row.entity)">Delete</a></strong></div>';

    	// Search engine for table
		$scope.filterOptions = function(renderableRows) {
            var matcher = new RegExp($scope.filterValue, 'i');
            renderableRows.forEach( function( row ) {
                var match = false;
                [ 'name_EN', 'group_EN' ].forEach(function( field ){
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


        // Table options for test results
        $scope.gridOptions = {
            data: 'testList', 
            columnDefs: [
                {field: 'name_EN', displayName: 'Name (EN/FR)', cellTemplate:cellTemplateName, width:'355'},
                {field: 'group_EN', displayName: 'Test Group (EN/FR)', cellTemplate:cellTemplateGroupName, width:'155'},
                {field: 'publish', displayName:'Publish Flag', width: '130', cellTemplate:checkboxCellTemplate},
                {name:'Operations', cellTemplate:cellTemplateOperations, sortable: false}
            ],
            useExternalFiltering: true,
			enableColumnResizing: true,	
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor($scope.filterOptions, 300);
            },
        };

        // Initialize list of existing test results
        $scope.testList = [];
        $scope.testResultPublishes = {
            publishList: []
        };

        // Initialize an object for deleting a test result
        $scope.testResultToDelete = {};

        // Call our API to get the list of existing test results
        testresAPIservice.getExistingTestResults().success(function(response) {

            $scope.testList = response;
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
		$scope.checkPublishFlag = function (testResult) {

            $scope.changesMade = true;
            testResult.publish = parseInt(testResult.publish);
			// If the "publish" column has been checked
			if (testResult.publish) {
				testResult.publish = 0; // set publish to "false"
			}

			// Else the "publish" column was unchecked
			else {
				testResult.publish = 1; // set publish to "true"
			}
		};
 
       // Function to submit changes when publish flags have been modified
        $scope.submitPublishFlags = function() {
            if($scope.changesMade) {
                angular.forEach($scope.testList, function(testResult) {
                    $scope.testResultPublishes.publishList.push({
                        serial:testResult.serial,
                        publish:testResult.publish
                    });
                });
                // Submit form
		    	$.ajax({
			    	type: "POST",
				    url: "php/test-result/update_publishFlag.php",
    				data: $scope.testResultPublishes,
	    			success: function(response) {
                        // Call our API to get the list of existing test results
                		testresAPIservice.getExistingTestResults().success(function (response) {
			                // Assign value
            		    	$scope.testList = response;
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

	    // Initialize a scope variable for a selected test result
		$scope.currentTestResult = {};

       	// Function for when the test result has been clicked for editing
		// We open a modal
		$scope.editTestResult = function (testResult) {

			$scope.currentTestResult = testResult;
			var modalInstance = $uibModal.open({
				templateUrl: 'editTestResultModalContent.htm',
				controller: EditTestResultModalInstanceCtrl,
				scope: $scope,
				windowClass: 'customModal',
			});
		    // After update, refresh the test result list
			modalInstance.result.then(function () {
			    $scope.testList = [];
				// Call our API to get the list of existing test results
				testresAPIservice.getExistingTestResults().success(function (response) {
                    $scope.testList = response;
    			});

			});

		};

        // Controller for the edit test result modal
        var EditTestResultModalInstanceCtrl = function ($scope, $uibModalInstance, $filter) {

            // Default Boolean
            $scope.changesMade = false; // changes been made?

            // Responsible for "searching" in search bars
            $scope.filter = $filter('filter');

            $scope.testResult = {}; // Initialize test result object

            // Initialize list to hold test names
            $scope.testList = [];

            // Initialize lists to hold distinct test groups
            $scope.TestResultGroups_EN = []; 
            $scope.TestResultGroups_FR = []; 

            // Call our API to get the list of test result groups
            testresAPIservice.getTestResultGroups().success(function (response) {
                $scope.TestResultGroups_EN = response.EN; 
                $scope.TestResultGroups_FR = response.FR; 
            });

            // Initialize search field 
            $scope.testFilter = "";

            // Function to assign search field when textbox changes
            $scope.changeTestFilter = function (field) {
                $scope.testFilter = field;
            }


            // Function for search through the test names
            $scope.searchTestsFilter = function (Filter) {
                var keyword = new RegExp($scope.testFilter, 'i');
                return !$scope.testFilter || keyword.test(Filter.name);
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

            // Call our API service to get the current test resulte details
            testresAPIservice.getTestResultDetails($scope.currentTestResult.serial).success(function (response) {

                $scope.testResult = response;

                // Call our API service to get the list of test names
                testresAPIservice.getTestNames().success(function (response) {

                    $scope.testList = checkAdded(response); 


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

            // Function to assign '1' to existing test names
            function checkAdded(testList) {
                angular.forEach($scope.testResult.tests, function(selectedTest) {
                    var selectedName = selectedTest.name;
                    angular.forEach(testList, function (test) {
                        var name = test.name;
                        if (name == selectedName) {
                            test.added = 1;
                        }
                    });
                });

                return testList;
            }

            // Function to check necessary form fields are complete
            $scope.checkForm = function() {
                if ( $scope.testResult.name_EN && $scope.testResult.name_FR && $scope.testResult.description_EN
                        && $scope.testResult.description_FR && $scope.testResult.group_EN && $scope.testResult.group_FR
                        && $scope.checkTestsAdded($scope.testList) && $scope.changesMade ) {
                    return true;
                }
                else return false;
            }

            // Function to add / remove a test
    		$scope.toggleTestSelection = function(test){
			
    			var testName = test.name; // get the name
    
                $scope.changesMade = true;

	    		// If originally added, remove it
		    	if (test.added) { 

     				test.added = 0; // added parameter

    			}
	    		else { // Orignally not added, add it
    
	    			test.added = 1;


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

            $scope.setChangesMade = function() {
                $scope.changesMade = true;
            }


            // Submit changes
            $scope.updateTestResult = function() {

                if ($scope.checkForm()) {

                    $scope.testResult.tests = [];  
                    // Fill in the tests from testList
                    angular.forEach($scope.testList, function(test) {
                        if(test.added)
                            $scope.testResult.tests.push(test.name);
                    });

                    // Submit form
                    $.ajax({
                        type: "POST",
                        url: "php/test-result/update_testResult.php",
                        data: $scope.testResult,
                        success: function(response) {
                            response = JSON.parse(response); 
                            // Show success or failure depending on response
                            if (response.value) {
                                $scope.setBannerClass('success');
                                $scope.$parent.bannerMessage = "Successfully updated \"" + $scope.testResult.name_EN + "/ " + $scope.testResult.name_FR + "\"!" ;
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

	        // Function to properly render the modal 
			// plus enable resizable functions
			setTimeout(function () {
                var resizeOpts = {
                    handles: "all", autoHide: true
                };

                $(".customModal .modal-content").resizable(resizeOpts);
            }, 0);

		};

		// Function for when the test result has been clicked for deletion
		// Open a modal
		$scope.deleteTestResult = function(currentTestResult) {

            // Assign selected test result as the item to delete 
            $scope.testResultToDelete = currentTestResult;
     		var modalInstance = $uibModal.open({
				templateUrl: 'deleteTestResultModalContent.htm',
				controller: DeleteTestResultModalInstanceCtrl,
				windowClass: 'deleteModal',
				scope: $scope,
			});
  			// After delete, refresh the test result list
			modalInstance.result.then(function () {
                $scope.testList = [];
                // Call our API to get the list of existing test result
                testresAPIservice.getExistingTestResults().success(function (response) {
                    $scope.testList = response;
                });

            });
        }

		// Controller for the delete test result modal
		var DeleteTestResultModalInstanceCtrl = function ($scope, $uibModalInstance) {

            // Submit delete
            $scope.deleteTestResult = function () {
                $.ajax({
                    type : "POST",
                    url: "php/test-result/delete_testResult.php",
                    data: $scope.testResultToDelete,
                    success: function(response) {
                        response = JSON.parse(response);
                         // Show success or failure depending on response
                        if (response.value) {
                            $scope.setBannerClass('success');
                            $scope.$parent.bannerMessage = "Successfully deleted \"" + $scope.testResultToDelete.name_EN + "/ " + $scope.testResultToDelete.name_FR + "\"!";
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
