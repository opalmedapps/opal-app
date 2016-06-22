angular.module('MUHCApp').directive( 'height-element', function() {

    return {
        link: function( scope, elem, attrs ) {
          scope.$watch( '__height', function( newHeight, oldHeight ) {
            scope.heightCalendar=oldHeight-newHeight;
         } );
        }
    }

} )
