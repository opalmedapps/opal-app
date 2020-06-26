import initPage from "../views/navigators/initNavigator.html";
import loginPage from "../views/login/login.html";
import loadingPage from "../views/login/loading.html";
import tabsPage from "../views/tabs/tabs.html";
import logoutPage from "../views/logOut.html";

(()=>{
	const app = angular.module("MUHCApp");
	app.config(RoutesConfiguration);
	RoutesConfiguration.$inject = ['$urlRouterProvider', '$stateProvider'];
	function RoutesConfiguration($urlRouterProvider, $stateProvider) {
		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('logIn', {
				url: '/login',
				template: loginPage,
				controller: 'LoginController'

			})
			.state('init', {
				url: '/',
				template: initPage
			})
			.state('loading', {
				url: '/loading',
				template: loadingPage,
				controller: 'LoadingController',
				resolve: {
					// controller will not be loaded until $requireSignIn resolves
					// Auth refers to our $firebaseAuth wrapper in the example above
					"currentAuth": ["FirebaseService", function(FirebaseService) {
						// $requireSignIn returns a promise so the resolve waits for it to complete
						return FirebaseService.getAuthentication().$requireSignIn();
					}]
				}
			})
			.state('Home', {
				url: '/Home',
				template: tabsPage,
				controller: 'TabsController',
				resolve: {
					// controller will not be loaded until $requireSignIn resolves
					// Auth refers to our $firebaseAuth wrapper in the example above
					"currentAuth": ["FirebaseService", function(FirebaseService) {
						// $requireSignIn returns a promise so the resolve waits for it to complete
						// console.log(FirebaseService.getAuthentication().$requireSignIn());
						return FirebaseService.getAuthentication().$requireSignIn();
					}]
				}

			})
			.state('logOut', {
				url: '/Logout',
				template: logoutPage,
				controller: 'logOutController',
				resolve: {
					// controller will not be loaded until $requireSignIn resolves
					// Auth refers to our $firebaseAuth wrapper in the example above
					"currentAuth": ["FirebaseService", function(FirebaseService) {
						// $requireSignIn returns a promise so the resolve waits for it to complete
						return FirebaseService.getAuthentication().$requireSignIn();
					}]
				}
			});
	}
})();

