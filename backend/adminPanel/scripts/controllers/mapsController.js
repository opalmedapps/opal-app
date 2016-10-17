var myApp=angular.module('adminPanelApp');
myApp.controller('MapsController',['$timeout','$scope','api','URLs', function($timeout,$scope,api,URLs ){
	console.log('maps');
	$scope.$watch('MapUrl',function(){
		var MapUrl=$scope.MapUrl;
		if(typeof MapUrl!=='undefined'&&MapUrl&&MapUrl!=='')
		{
			$scope.showMap=true;
		}else{
			$scope.showMap=false;
		}
	});
	$scope.submitMap=function()
	{
		var objectToSend={
			MapAliasName:$scope.MapAliasName,
			MapName_EN:$scope.MapNameEN,
			MapName_FR:$scope.MapNameFR,
			MapDescription_EN:$scope.MapDescriptionEN,
			MapDescription_FR:$scope.MapDescriptionFR,
			MapUrl:$scope.MapUrl
		};
		console.log(objectToSend);
		api.getFieldFromServer(URLs.getInsertMapUrl(),objectToSend).then(function(result)
		{
			console.log(result);
			if(result.response=='Success')
			{
				$timeout(function(){
					$scope.showQRCode=true;
					$scope.QRCode=result.QRCode;
				});
				
			}else{
				
			}
			
		});
	}
}]);