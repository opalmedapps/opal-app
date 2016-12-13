// Angular Module 
// To collect various data using JSONP (JavaScript Object Notation with Padding), a safer (than JSON) cross-domain ajax call
// Most pages on the site require information from either our database or ARIA so we create an "API service" (Application
// Programming Interface) for each page with functions to collect relevant data. 
// Each function calls a JSON script (located in api directory), it's really a PHP script (and 
// also encodes the data in JSON because the callback will not work otherwise. So in reality, we are calling a PHP script (that executes 
// JSON_ENCODE) to get relevant data using JavaScript 

angular.module('ATO_InterfaceApp.collections', []).

	// Alias API service
	factory('aliasAPIservice', function ($http) { 

		var aliasAPI = {};
	
		// Function to get the list of existing alias in our DB
		aliasAPI.getAliases = function() {
			return $http({
				method: 'JSONP',
				url: URLPATH+"api/alias/alias.php?callback=JSON_CALLBACK"
			});
		}
	
		// Function to get an alias detail given an id number
		aliasAPI.getAliasDetails = function(serial) {
			return $http({
				method: 'JSONP',
				url: URLPATH+"api/alias/alias_details.php?callback=JSON_CALLBACK&serial="+serial
			});
		}

		// Function to get a list of unassigned expressions
		aliasAPI.getExpressions = function(sourcedbser, type) { 
			return $http({
				method: 'JSONP',
				url: URLPATH+"api/alias/expressions.php?callback=JSON_CALLBACK&sourcedbser="+sourcedbser+"&type="+type
			});
		}
        
        // Function to get a list of source databases
        aliasAPI.getSourceDatabases = function() {
			return $http({
				method: 'JSONP',
				url: URLPATH+"api/alias/source_databases.php?callback=JSON_CALLBACK"
			});
		}

		return aliasAPI;
	}).

    // Post API service
    factory('postAPIservice', function($http) {

        var postAPI = {};

        // Function to get the list of posts 
        postAPI.getPosts = function() {
	        return $http({
				method: 'JSONP',
				url: URLPATH+"api/post/posts.php?callback=JSON_CALLBACK"
			});
		}

        // Function to get a post detail given a serial
        postAPI.getPostDetails = function(serial) {
	        return $http({
				method: 'JSONP',
				url: URLPATH+"api/post/post_details.php?callback=JSON_CALLBACK&serial="+serial
			});
		}

        return postAPI;
    }).

    // Educational Material API service
    factory('edumatAPIservice', function($http) {

        var edumatAPI = {};

        // Function to get the list of existing education materials
        edumatAPI.getEducationalMaterials = function() {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/educational-material/educational-materials.php?callback=JSON_CALLBACK"
            });
        }

        // Function to get an educational material detail given a serial
        edumatAPI.getEducationalMaterialDetails = function (serial) {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/educational-material/educationalMaterial_details.php?callback=JSON_CALLBACK&serial="+serial
            });
        }

        // Function to get distinct educational material types 
        edumatAPI.getEducationalMaterialTypes = function() {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/educational-material/educationalMaterial_types.php?callback=JSON_CALLBACK"
            });
        }

        // Function to get phases in treatment 
        edumatAPI.getPhaseInTreatments = function() {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/educational-material/phase_in_treatments.php?callback=JSON_CALLBACK"
            });
        }

        // Function to get parent educational materials
        edumatAPI.getParentEducationalMaterials = function() {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/educational-material/educationalMaterial_parents.php?callback=JSON_CALLBACK"
            });
        }

        return edumatAPI;
    }).

    // Hospital Map API service
    factory('hosmapAPIservice', function($http) {

        var hosmapAPI = {};

        // Function to get the list of hospital maps
        hosmapAPI.getHospitalMaps = function () {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/hospital-map/hospital-maps.php?callback=JSON_CALLBACK"
            });
        }

        // Function to get map details given a serial
        hosmapAPI.getHospitalMapDetails = function (serial) {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/hospital-map/hospitalMap_details.php?callback=JSON_CALLBACK&serial="+serial
            });
        }

        // Function to generate qrcode and return image path
        hosmapAPI.generateQRCode = function (qrid, oldqrid) {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/hospital-map/generateQRCode.php?callback=JSON_CALLBACK&qrid="+qrid+"&oldqrid="+oldqrid
            });
        }

        return hosmapAPI;
    }).

    // Notification API service
    factory('notifAPIservice', function($http) {

        var notifAPI = {};
 
        // Function to get the list of notifications
        notifAPI.getNotifications = function () {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/notification/notifications.php?callback=JSON_CALLBACK"
            });
        }

        // Function to get notification details given a serial
        notifAPI.getNotificationDetails = function (serial) {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/notification/notification_details.php?callback=JSON_CALLBACK&serial="+serial
            });
        }
  
        // Function to get distinct notification types 
        notifAPI.getNotificationTypes = function() {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/notification/notification_types.php?callback=JSON_CALLBACK"
            });
        }

        return notifAPI;
    }).

    // Patient API service
    factory('patientAPIservice', function($http) {

        var patientAPI = {};

        // Function to get the list of patients
        patientAPI.getPatients = function() {
	        return $http({
				method: 'JSONP',
				url: URLPATH+"api/patient/patients.php?callback=JSON_CALLBACK"
			});
		}

        return patientAPI;
    }).

    // Fitler API service
    factory('filterAPIservice', function($http) {

        var filterAPI = {};

        // Function to get all filters 
        filterAPI.getFilters = function() {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/filter/filters.php?callback=JSON_CALLBACK"
            });
        }

        return filterAPI;
    }).

    // Test Result API service
    factory('testresAPIservice', function($http) {

        var testresAPI = {};
 
        // Function to get distinct test groups
        testresAPI.getTestResultGroups = function () {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/test-result/testResult_groups.php?callback=JSON_CALLBACK"
            });
        }

        // Function to get distinct tests
        testresAPI.getTestNames = function () {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/test-result/testNames.php?callback=JSON_CALLBACK"
            });
        }

        // Function to get existing test results
        testresAPI.getExistingTestResults = function () {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/test-result/testResults.php?callback=JSON_CALLBACK"
            });
        }

        // Function to get test result details
        testresAPI.getTestResultDetails = function (serial) {
            return $http({
                method: 'JSONP',
                url: URLPATH+"api/test-result/testResult_details.php?callback=JSON_CALLBACK&serial="+serial
            });
        }

        return testresAPI;
    }).


	// Cron API service
	factory('cronAPIservice', function($http) {
	
		var cronAPI = {};
	
		// Function to get the cron details in our DB
		cronAPI.getCronDetails = function() {
			return $http({
				method: 'JSONP',
				url: URLPATH+"api/cron/cron_details.php?callback=JSON_CALLBACK"
			});
		}

		return cronAPI;
	});

