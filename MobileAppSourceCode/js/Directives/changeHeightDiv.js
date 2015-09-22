angular.module('MUHCApp').directive('heightChange', function() {
  return function(scope, element, attrs) {
    var start=document.documentElement.clientHeight-115;
  	element.css('height', start +'px');
    scope.$watch(attrs.heightChange, function(newValue, oldValue) {
    	var change=newValue;
    	var changeHeight=element[0].offsetHeight+change;
    	changeHeight=changeHeight+'';
 
    	if(newValue){
    		element.css('height',newValue+'px');
    	}
    	
    });
  };
});