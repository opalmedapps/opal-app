angular.module('ATO_InterfaceApp.controllers.patientController', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns']).


	/******************************************************************************
	* Patient Page controller 
	*******************************************************************************/
	controller('patientController', function($scope, $filter, $sce, $uibModal, patientAPIservice) {

        $scope.bannerMessage = "";
        // Function to show page banner 
        $scope.showBanner = function() {
            $(".bannerMessage").slideDown(function()  {
                setTimeout(function() {             
                    $(".bannerMessage").slideUp(); 
                }, 3000); 
            });
        }

        $scope.changesMade = false;

        var checkboxCellTemplate = '<div style="text-align: center; cursor: pointer;" ' +
            'ng-click="grid.appScope.checkTransferFlag(row.entity)" ' +
            'class="ui-grid-cell-contents"><input style="margin: 4px;" type="checkbox" ' +
            'ng-checked="grid.appScope.updateTransferFlag(row.entity.transfer)" ng-model="row.entity.transfer"></div>';  

        // patient table search textbox param
		$scope.filterOptions = function(renderableRows) {
            var matcher = new RegExp($scope.filterValue, 'i');
            renderableRows.forEach( function( row ) {
                var match = false;
                [ 'name', 'patientid' ].forEach(function( field ){
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
   

        $scope.filterPatient = function(filterValue) {
            $scope.filterValue = filterValue
            $scope.gridApi.grid.refresh();
            
        };

        // Table options for patient
    	$scope.gridOptions = { 
			data: 'patientList',
			columnDefs: [
				{field:'patientid', displayName:'Patient ID', width:'145'},
				{field:'name', displayName:'Name', width:'355'},
                {field:'transfer', displayName:'Publish Flag', width:'150', cellTemplate:checkboxCellTemplate},
				{field:'lasttransferred', displayName:'Last Publish', width:'355'}
                
			],
            useExternalFiltering: true,
			enableColumnResizing: true,	
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor($scope.filterOptions, 300);
            },
	
		};

        // Initialize list of existing patients
		$scope.patientList = [];
        $scope.patientTransfers = {
            transferList: []
        };

        // Call our API to get the list of existing patients
		patientAPIservice.getPatients().success(function (response) {
			// Assign value
			$scope.patientList = response;
		});

        // When this function is called, we set the "publish" field to checked 
		// or unchecked based on value in the argument
		$scope.updateTransferFlag = function (value) {
            value = parseInt(value);
			if (value == 1) {
				return 1;
			} else {
				return 0;
			}
		}


        // Function for when the patient checkbox has been modified
		$scope.checkTransferFlag = function (patient) {

            $scope.changesMade = true;
            patient.transfer = parseInt(patient.transfer);
			// If the "transfer" column has been checked
			if (patient.transfer) {
				patient.transfer = 0; // set transfer to "false"
			}

			// Else the "Transfer" column was unchecked
			else {
				patient.transfer = 1; // set transfer to "true"
			}
		};

        // Function to submit changes when transfer flags have been modified
        $scope.submitTransferFlags = function() {
            if($scope.changesMade) {
                angular.forEach($scope.patientList, function(patient) {
                    $scope.patientTransfers.transferList.push({
                        serial:patient.serial,
                        transfer:patient.transfer
                    });
                });
	            // Submit form
		    	$.ajax({
			    	type: "POST",
				    url: "php/patient/update_transferFlag.php",
    				data: $scope.patientTransfers,
	    			success: function() {
                        // Call our API to get the list of existing patients
                		patientAPIservice.getPatients().success(function (response) {
			                // Assign value
            		    	$scope.patientList = response;
                		});
                        $scope.bannerMessage = "Transfer Flags Saved!";
                        $scope.showBanner();
                        $scope.changesMade = false;
                    }
    			}); 
	    	}
        }

    });


