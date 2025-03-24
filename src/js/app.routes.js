import initPage from "../views/navigators/initNavigator.html";
import loadingPage from "../views/login/loading.html";
import tabsPage from "../views/tabs/tabs.html";

/**
 * @description Configuration of the routes in the application, provided by angular-ui-router.
 */
(()=>{
	angular
		.module('OpalApp')
		.config(RoutesConfiguration);

	RoutesConfiguration.$inject = ['$stateProvider', '$uiRouterProvider', '$urlServiceProvider'];

	function RoutesConfiguration($stateProvider, $uiRouterProvider, $urlServiceProvider) {

		/**
		 * @description Defines a function to handle state change errors (when a Transition fails).
		 *              In particular, we use this function to catch errors thrown by the "resolve" clauses in the
		 *              states defined below to redirect the user to the init page.
		 * @author Stacey Beard
		 * @date 2022-01-31
		 */
		$uiRouterProvider.stateService.defaultErrorHandler(err => {
			// AUTH_REQUIRED is thrown by requireSignIn()
			if (err.detail === "AUTH_REQUIRED") {
				console.warn("Unauthenticated state detected (Firebase); redirecting to the init page", err);
				$uiRouterProvider.stateService.go('init');
			}
			// RELOAD_REDIRECT is thrown by preventReload()
			else if (err.detail === "RELOAD_REDIRECT") {
				console.warn("Reload triggered, causing live data to be cleared; redirecting to the init page", err);
				$uiRouterProvider.stateService.go('init');
			}
			else console.error("Transition Rejection", err);
		});

		/**
		 * @description If an incorrect URL is entered (e.g. '/foo'), redirects to the root of the application.
		 */
		$urlServiceProvider.rules.otherwise('/');

		/**
		 * @description Defines the states available in the application.
		 *              Note: most of the states below have been set up to redirect when reloaded (via "preventReload").
		 *              This is because refreshing discards most of the live data that is needed for the app
		 *              to function correctly.
		 */
		$stateProvider
			.state('init', {
				url: '/',
				template: initPage
			})
			.state('loading', {
				url: '/loading',
				params: {
					isTrustedDevice: null,
				},
				template: loadingPage,
				controller: 'LoadingController',
				resolve: {
					"currentAuth": ["Firebase", requireSignIn],
					"preventReload": ["AppState", preventReload],
				}
			})
			.state('Home', {
				url: '/Home',
				template: tabsPage,
				controller: 'TabsController',
				resolve: {
					"currentAuth": ["Firebase", requireSignIn],
					"preventReload": ["AppState", preventReload],
				}
			});

		/**
		 * @description Prevents certain routes from loading if no Firebase user is authenticated.
		 * @param Firebase Injection of the Firebase service.
		 * @returns {Promise<*>} Resolves if the user is signed in, or rejects with "AUTH_REQUIRED".
		 */
		function requireSignIn(Firebase) {
			let userExists = !!Firebase.getCurrentUser();
			return userExists ? Promise.resolve() : Promise.reject("AUTH_REQUIRED");
		}

		/**
		 * @description Prevents reloading of certain routes by ensuring that the app state is intact before allowing
		 *              them to be resolved. This is done to prevent users from viewing empty (broken) pages within
		 *              the app after a reload (which can be triggered manually or by their mobile device's OS).
		 *              If a reload has been detected, the app is redirected to the init route (see defaultErrorHandler above).
		 * @author Stacey Beard
		 * @date 2022-01-31
		 * @param AppState Injection of the AppState service.
		 * @returns {Promise<void|string>} Resolves if the app state is intact, or rejects with an error
		 *                                 ("RELOAD_REDIRECT") if the app has been reloaded, to trigger a redirect.
		 */
		function preventReload(AppState) {
			/* AppState contains a variable that is set to true when the app is initialized. If the app has been
			 * reloaded, it will lose this variable (and its value will become false), indicating that we should
			 * redirect to the init page. */
			return AppState.isInitialized() ? Promise.resolve() : Promise.reject("RELOAD_REDIRECT");
		}
	}
})();
