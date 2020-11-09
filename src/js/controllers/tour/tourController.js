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

        vm.currentIndex = 0;

        vm.next = next;
        vm.prev = prev;

        let carousel = null;
        activate();

        ////////////////

        function activate() {
            document.addEventListener('ons-carousel:init', initCarouselEvent);

        }

        function initCarouselEvent(e) {
            carousel = e.component;
            carousel.on('postchange', postChangeCarouseIndex);
        }

        /**
        * @name next
        * @desc This public function serves to move the carousel on to the next item
        */
        function next() {
            carousel.next();
        }

        /**
         * @name prev
         * @desc this public function serves to move the carousel to the previous item
         */
        function prev() {
            carousel.prev();
        }

        /**
         * @name postChangeCarouseIndex
         * @desc this public function serves to maintain courseIndex number
         */
        function postChangeCarouseIndex(event) {
            $timeout(function () {
                vm.currentIndex = event.activeIndex;
            });
        }

        vm.$onDestroy = function () {
            document.removeEventListener('ons-carousel:init', initCarouselEvent);
            carousel.off('postchange');
        };
    }
})();
