
angular.module("MUHCApp").config(ImageSanitation);

ImageSanitation.$inject = [ '$compileProvider' ];
/* @ngInject */
function ImageSanitation($compileProvider){
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile):|data:image\//);
}
