/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
angular.module('OpalApp').directive('heightChange', function() {
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