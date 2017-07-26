var myApp=angular.module('MUHCApp');
myApp.service('MapLocation',function(){
	var map={};
	return{
		updateMapLocation:function(maplocation)
		{


			map=maplocation;
		},
		getMapLocation:function()
		{


			return map;
		}

	};


});
