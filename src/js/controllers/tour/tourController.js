// SPDX-FileCopyrightText: Copyright (C) 2021 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Created by Visual Studio.
 * User: Jinal Vyas
 * Date: 2020-07-16
 * Time: 11:00 PM
 */

import "../../../css/views/tour.view.css";

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('TourController', TourController);

    TourController.$inject = ['$filter', '$timeout', 'DynamicContent'];

    function TourController($filter, $timeout, DynamicContent) {
        let vm = this;

        vm.currentIndex = 0;
        vm.helpEmail = "";

        /**
         * @description The sections shown in the tour HTML.
         */
        vm.tourSections = [
            {
                iconType: "opal-logo",
                icon: "",
                title: "TOUR_WELCOME",
                description: "TOUR_WELCOME_DESC",
            },
            {
                iconType: "icon",
                icon: "fa-info-circle",
                title: "INFO",
                description: "TOUR_INFO",
            },
            {
                iconType: "icon",
                icon: "fa-home",
                title: "HOME",
                description: "TOUR_HOME",
            },
            {
                iconType: "icon",
                icon: "fa-user",
                title: "CHART",
                description: "TOUR_CHART",
            },
            {
                iconType: "general-icon",
                icon: "general-icon",
                title: "GENERAL",
                description: "TOUR_GENERAL",
            },
            {
                iconType: "icon",
                icon: "fa-book",
                title: "EDUCATION",
                description: "TOUR_EDUCATION",
            },
            {
                iconType: "icon",
                icon: "fa-cog",
                title: "ACCOUNT",
                description: "TOUR_ACCOUNT",
            },
            {
                iconType: "icon",
                icon: "ion-locked",
                title: "TOUR_SECURITY_TITLE",
                description: "TOUR_SECURITY_DESCRIPTION",
            },
            {
                iconType: "icon",
                icon: "fa-check-circle",
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
            // Initialize the support email value
            let emailFromServer = DynamicContent.getConstant('supportEmail');
            vm.helpEmail = emailFromServer === undefined
                ? `{${$filter('translate')("EMAIL_LOADING_ERROR").toLowerCase()}}`
                : emailFromServer;

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
