angular.module('ATO_InterfaceApp.controllers.sidePanelMenuController', ['ui.bootstrap', 'ui.grid']).


	/******************************************************************************
	* Controller for the side panel on main pages
	*******************************************************************************/
	controller('sidePanelMenuController', function($scope, $location) {

        // Get the current page from url
        $scope.currentPage = $location.path().replace('/',''); // and remove leading slash

        // Function to go to alias page
        $scope.goToAlias = function () {
            window.location.href = URLPATH+"main.php#/alias";
        }
        // Function to go to post page
        $scope.goToPost = function () {
            window.location.href = URLPATH+"main.php#/post";
        }
        // Function to go to home page
        $scope.goToHome= function () {
            window.location.href = URLPATH+"main.php#/";
        }
        // Function to go to educational material page
        $scope.goToEducationalMaterial = function () {
            window.location.href = URLPATH+"main.php#/educational-material";
        }
        // Function to go to hospital map page
        $scope.goToHospitalMap= function () {
            window.location.href = URLPATH+"main.php#/hospital-map";
        }
        // Function to go to notification page
        $scope.goToNotification= function () {
            window.location.href = URLPATH+"main.php#/notification";
        }
        // Function to go to patient page
        $scope.goToPatient= function () {
            window.location.href = URLPATH+"main.php#/patients";
        }
		// Function to go to test results page
        $scope.goToTestResult= function () {
            window.location.href = URLPATH+"main.php#/test-result";
        }
			
	});

