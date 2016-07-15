var myApp=angular.module('MUHCApp');
myApp.service('MapLocation',function(){
	var map={}
	return{
		updateMapLocation:function(maplocation)
		{
			console.log(maplocation);
			console.log(new Date());
			map=maplocation;
		},
		getMapLocation:function()
		{
			console.log(map);
			console.log(new Date());
			return map;
		}

	};


});
