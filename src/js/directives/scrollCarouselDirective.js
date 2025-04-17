// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

var app = angular.module('OpalApp');
/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/

app.directive('scrollCarousel',function()
{
    return {
        scope:{
            lee:"=pad"
        },
        link:function(scope, element,attr)
        {
            // console.log(attr.david);
            // console.log(element);
            // console.log(scope);
            var pageContent = element[0].firstElementChild.querySelector('.page__content');
            pageContent.addEventListener('scroll',function(event)
            {
                // console.log( this.scrollTop);
                
            });
            scope.$watch('lee',function()
            {
                // console.log(scope.lee);
            });
            var text = (new Array(100)).join('Lorem ipsum dolor sit amet. ');
	// var each = function(selector, f) {
    //     [].forEach.call(document.querySelectorAll(selector), f);
	// };

	// ons.ready(function() {
	// each('.lorem', function(element) {
	// 	element.innerHTML = text;
	// });
	// each('.page__content', function(element, i) {
	// 	element.addEventListener('scroll', function(){
	// 	console.log(i);
	// 	});
	//     });
	// });
        }
    };
});
