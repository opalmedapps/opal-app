angular.module('MUHCApp').directive('heightChange', function() {
  return function(scope, element, attrs) {
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