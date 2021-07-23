/**
 * Created by Visual Studio.
 * User: Jinal Vyas
 * Date: 2020-07-16
 * Time: 11:00 PM
 */

import "../../../css/tour.view.css";

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('TourController', TourController);

    TourController.$inject = ['$timeout'];

    function TourController($timeout) {
        let vm = this;

        vm.currentIndex = 0;

        /**
         * @description The sections shown in the tour HTML.
         */
        vm.tourSections = [
            {
                icon: "img/Opal_Logo_Black.png",
                iconType: "img",
                title: "TOUR_WELCOME",
                description: "TOUR_WELCOME_DESC",
            },
            {
                icon: "fa-home",
                iconType: "icon",
                title: "HOME",
                description: "TOUR_HOME",
            },
            {
                icon: "fa-user",
                iconType: "icon",
                title: "MYCHART",
                description: "TOUR_MYCHART",
            },
            {
                icon: "fa-th",
                iconType: "icon",
                title: "GENERAL",
                description: "TOUR_GENERAL",
            },
            {
                icon: "fa-book",
                iconType: "icon",
                title: "EDUCATION",
                description: "TOUR_EDUCATION",
            },
            {
                icon: "fa-cog",
                iconType: "icon",
                title: "ACCOUNT",
                description: "TOUR_ACCOUNT",
            },
            {
                icon: "fa-info-circle",
                iconType: "icon",
                title: "INFO",
                description: "TOUR_INFO",
            },
            {
                icon: "fa-check-circle",
                iconType: "icon",
                title: "TOUR_END_TITLE",
                description: "TOUR_END_DESC",
            },
        ];

        vm.next = next;
        vm.prev = prev;

        let carousel = null;

        activate();

        ////////////////

        function activate() {
            bindEvents();
        }

        function bindEvents(){
            document.addEventListener('ons-carousel:init', initCarouselEvent);

            vm.$onDestroy = function () {
                document.removeEventListener('ons-carousel:init', initCarouselEvent);
                carousel.off('postchange');
            };
        }

        function initCarouselEvent(e) {
            carousel = e.component;
            carousel.on('postchange', postChangeCarouselIndex);
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
         * @desc This public function serves to move the carousel to the previous item
         */
        function prev() {
            carousel.prev();
        }

        /**
         * @name postChangeCarouselIndex
         * @desc This public function serves to maintain the carousel's current index number
         */
        function postChangeCarouselIndex(event) {
            $timeout(function () {
                vm.currentIndex = event.activeIndex;
            });
        }
    }
})();
