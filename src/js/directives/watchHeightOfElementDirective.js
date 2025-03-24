/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
angular.module('OpalApp').directive( 'height-element', function() {

    return {
        link: function( scope, elem, attrs ) {
          scope.$watch( '__height', function( newHeight, oldHeight ) {
            scope.heightCalendar=oldHeight-newHeight;
         } );
        }
    };

} );
