let mobileApp = window.hasOwnProperty("cordova");

angular.module("MUHCApp").constant('Constants', {
	app: mobileApp,
	version: () => {
		return mobileApp ? AppVersion.version : WEB_VERSION.version;
	},
	build: () => {
		return mobileApp ? AppVersion.build : WEB_VERSION.build;
	}
});
