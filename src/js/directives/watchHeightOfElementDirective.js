// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

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
