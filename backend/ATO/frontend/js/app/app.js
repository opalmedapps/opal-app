/* Angular module */
/*
 * Config: To provide location directives when certain links are contained in the url.
 * All pages have a template and a controller module that handles all functions and variables for a given page.
 * If there is an unknown url path, we redirect to the home page.
 *
 */
angular.module('ATO_InterfaceApp', [
  'ATO_InterfaceApp.collections',
  'ATO_InterfaceApp.controllers',
  'ngRoute'
]).
config(['$routeProvider', function($routeProvider) { // Set routes
  $routeProvider.
	when("/", {templateUrl: "templates/home.php", controller: "homeController"}).
	when("/alias", {templateUrl: "templates/alias.php", controller: "aliasController"}).
	when("/alias/add", {templateUrl: "templates/add-alias.php", controller: "newAliasController"}).
	when("/post", {templateUrl: "templates/post.php", controller: "postController"}).
	when("/post/add", {templateUrl: "templates/add-post.php", controller: "newPostController"}).
	when("/educational-material", {templateUrl: "templates/educational-material.php", controller: "eduMatController"}).
	when("/educational-material/add", {templateUrl: "templates/add-educational-material.php", controller: "newEduMatController"}).
	when("/hospital-map", {templateUrl: "templates/hospital-map.php", controller: "hospitalMapController"}).
	when("/hospital-map/add", {templateUrl: "templates/add-hospital-map.php", controller: "newHospitalMapController"}).
	when("/notification", {templateUrl: "templates/notification.php", controller: "notificationController"}).
	when("/notification/add", {templateUrl: "templates/add-notification.php", controller: "newNotificationController"}).
	when("/patients", {templateUrl: "templates/patient.php", controller: "patientController"}).
	when("/test-result", {templateUrl: "templates/test-result.php", controller: "testResultController"}).
	when("/test-result/add", {templateUrl: "templates/add-test-result.php", controller: "newTestResultController"}).
	otherwise({redirectTo: '/'});
}]);

