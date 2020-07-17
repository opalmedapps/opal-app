/**
 * Created by Visual Studio.
 * User: Jinal Vyas
 * Date: 2020-07-16
 * Time: 11:00 PM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('TourController', TourController);

    TourController.$inject = ['$timeout'];
    function TourController($timeout) {

        var vm = this;

        vm.currentIndex;
        vm.carousel;
        
        vm.next = next;
        vm.prev = prev;
        
        activate();

        ////////////////

        function activate() {
            debugger;
            document.addEventListener('ons-carousel:init', initCarouselEvent);
            
        }
        
        function initCarouselEvent(e) {
            $timeout(function () {
                debugger;
                vm.carousel = e.component;
                vm.leftArrow = true;
                
                vm.carousel.on('postchange', postChangeCarouseIndex);
            });
        }

        /**
        * @name next
        * @desc This public function serves to move the carousel on to the next item
        */
        function next() {
            debugger;
            vm.carousel.next();
        }
       
        /**
         * @name prev
         * @desc this public function serves to move the carousel to the previous item
         */
        function prev() {
            debugger;
            vm.carousel.prev();
        }

        function postChangeCarouseIndex(event) {
            $timeout(function () {
                vm.currentIndex = event.activeIndex;
                if (vm.currentIndex == 0)
                    vm.leftArrow = true;
                else
                    vm.leftArrow = false;
            });
        }

        vm.$onDestroy = function () {
            debugger;
            document.removeEventListener('ons-carousel:init', initCarouselEvent);
            vm.carousel.off('postchange');
        };
    }
})();