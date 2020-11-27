angular.module("MUHCApp").constant('Constants', {
	app: document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1,
	version: ()=>{
		const app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
		if(app){
			return AppVersion.version;
		}else{
			return WEB_VERSION.version;
		}
	},
	build: ()=>{
		const app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
		if(app){
			return AppVersion.build;
		}else{
			return WEB_VERSION.build;
		}
	}
});
