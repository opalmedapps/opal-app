angular.module('ATO_InterfaceApp.controllers.hospitalMapController', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns']).


	/******************************************************************************
	* Hospital Map Page controller 
	*******************************************************************************/
	controller('hospitalMapController', function($scope, $filter, $sce, $uibModal, hosmapAPIservice) {

        // Function to go to add hospital map page
        $scope.goToAddHospitalMap = function() {
            window.location.href = URLPATH+"main.php#/hospital-map/add";
        }
        // Function to control search engine model
        $scope.filterHosMap = function(filterValue) {
            $scope.filterValue = filterValue
            $scope.gridApi.grid.refresh();
            
        };

        // Templates for the table
		var cellTemplateName = '<div style="cursor:pointer;" class="ui-grid-cell-contents" ' + 
            'ng-click="grid.appScope.editHosMap(row.entity)">' + 
            '<a href="">{{row.entity.name_EN}} / {{row.entity.name_FR}}</a></div>';
		var cellTemplateOperations = '<div style="text-align:center; padding-top: 5px;">' +
            '<strong><a href="" ng-click="grid.appScope.editHosMap(row.entity)">Edit</a></strong> ' + 
            '- <strong><a href="" ng-click="grid.appScope.deleteHosMap(row.entity)">Delete</a></strong></div>';

	    // Search engine for table
		$scope.filterOptions = function(renderableRows) {
            var matcher = new RegExp($scope.filterValue, 'i');
            renderableRows.forEach( function( row ) {
                var match = false;
                [ 'name_EN' ].forEach(function( field ){
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

        // Table options for hospital maps
        $scope.gridOptions = {
            data: 'hosMapList',
            columnDefs: [
            {field:'name_EN', displayName:'Name (EN / FR)', cellTemplate:cellTemplateName, width:'355'},
            {field:'qrid', displayName:'QR Identifier', width:'145'},
            {field:'url', displayName:'Map URL', width:'310'},
            {name:'Operations', cellTemplate:cellTemplateOperations, sortable:false}
        ],
        useExternalFiltering: true,
			enableColumnResizing: true,	
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor($scope.filterOptions, 300);
            },
        };
	
        // Initialize list of existing maps
        $scope.hosMapList = [];

        // Initialize an object for deleting map
        $scope.hosMapToDelete = {};

        $scope.oldqrid = ""; 
        $scope.updatedHosMap = false;

        // Call our API to get the list of existing maps
        hosmapAPIservice.getHospitalMaps().success(function(response) {
            $scope.hosMapList = response;
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

        // Initialize a scope variable for a selected map
        $scope.currentHosMap = {};

        // Function for when the map has been clicked for editing
        $scope.editHosMap = function(hosmap) {

            $scope.currentHosMap = hosmap;
            var modalInstance = $uibModal.open({
				templateUrl: 'editHosMapModalContent.htm',
				controller: EditHosMapModalInstanceCtrl,
				scope: $scope,
				windowClass: 'customModal',
			});
	
			// After update, refresh the hospital map list
			modalInstance.result.then(function () {
				// Call our API to get the list of existing maps
				hosmapAPIservice.getHospitalMaps().success(function (response) {
			
					// Assign the retrieved response
        			$scope.hosMapList = response;
    			});
			});

            modalInstance.closed.then(function() {
    
                if (!$scope.updatedHosMap) {
                    hosmapAPIservice.generateQRCode($scope.currentHosMap.qrid, $scope.oldqrid).success(function (response) {
                        $scope.updatedHosMap = false;
                    });
                }

            });

		};

  	    // Controller for the edit Map modal
		var EditHosMapModalInstanceCtrl = function ($scope, $uibModalInstance, $filter) {

		    // Default Booleans
			$scope.changesMade = false; // changes have been made? 
			$scope.hosMap = {}; // initialize map object

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

            $scope.mapURL = "";

            // Call our API to get the current map details
            hosmapAPIservice.getHospitalMapDetails($scope.currentHosMap.serial).success(function (response) {
                $scope.hosMap = response;
                $scope.$parent.oldqrid = response.qrid;
                $scope.mapURL = response.url;

                processingModal.close(); // hide modal
                processingModal = null; // remove reference
            });

            // Function to call api to generate qr code
            $scope.generateQRCode = function(qrid) {

                if (qrid && $scope.changesMade) {
                    hosmapAPIservice.generateQRCode(qrid, $scope.$parent.oldqrid).success(function (response) {
                        $scope.hosMap.qrcode = response.qrcode;
                        $scope.hosMap.qrpath = response.qrpath;

                        $scope.$parent.oldqrid = qrid;
    
                    });
                }
                else if (!qrid) {
                    $scope.hosMap.qrcode = "";
                    $scope.hosMap.qrpath = "";
                }

            }
            // Function to show map
            $scope.showMap = function (url) {
                $scope.mapURL = url;
            };


            // Function to check necessary form fiels are complete
            $scope.checkForm = function() {
                if($scope.hosMap.name_EN && $scope.hosMap.name_FR && $scope.hosMap.description_EN
                        && $scope.hosMap.description_FR && $scope.hosMap.qrid && $scope.hosMap.qrcode && $scope.hosMap.url
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
            $scope.updateHosMap = function() {
                if($scope.checkForm()) {
                    // Submit form
	    			$.ajax({
		    			type: "POST",
			    		url: "php/hospital-map/update_hospitalMap.php",
				    	data: $scope.hosMap,
					    success: function() {
                            $scope.$parent.bannerMessage = "Successfully updated \"" + $scope.hosMap.name_EN + "/ " + $scope.hosMap.name_FR + "\"!" ;
                            $scope.showBanner();
                            $scope.$parent.updatedHosMap = true;
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

	    // Function for when the map has been clicked for deletion
		// Open a modal
		$scope.deleteHosMap = function(currentHosMap) {

			// Assign selected map as the item to delete
			$scope.hosMapToDelete = currentHosMap;
			var modalInstance = $uibModal.open({
				templateUrl: 'deleteHosMapModalContent.htm',
				controller: DeleteHosMapModalInstanceCtrl,
				windowClass: 'deleteModal',
				scope: $scope,
			});

			// After delete, refresh the map list
			modalInstance.result.then(function () {
				// Call our API to get the list of existing hospital maps
				hosmapAPIservice.getHospitalMaps().success(function (response) {
					// Assign the retrieved response
        			$scope.hosMapList = response;
    			});
			});
		}
	
        // Controller for the delete hospital map modal
		var DeleteHosMapModalInstanceCtrl = function ($scope, $uibModalInstance) {
	
			// Submit delete
			$scope.deleteHospitalMap = function () {
				$.ajax({
					type: "POST",
					url: "php/hospital-map/delete_hospitalMap.php",
					data: $scope.hosMapToDelete,
					success: function() {
                        $scope.$parent.bannerMessage = "Successfully deleted \"" + $scope.hosMapToDelete.name_EN + "/ " + $scope.hosMapToDelete.name_FR + "\"!";
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
