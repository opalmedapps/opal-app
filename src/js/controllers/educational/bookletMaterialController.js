// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:09 PM
 */

/**
 * Modification History
 *
 * 2018 Nov: Project: Fertility Educate / Educational Material Packages / Education Material Interaction Logging
 *           Developed by Tongyou (Eason) Yang in Summer 2018
 *           Merged by Stacey Beard
 *           Commit # 6706edfb776eabef4ef4a2c9b69d834960863435
 */

/**
 * @method BookletEduMaterialController
 * @description This controller takes care of the displaying the educational material that has a table of contents in a carousel fashion. It also takes care of the popover that controls the table of contents and
 * rating.
 *
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('BookletMaterialController', BookletMaterialController);

    BookletMaterialController.$inject = ['$http', '$scope', '$timeout', 'Navigator', '$rootScope', '$filter',
        'EducationalMaterial', 'Logger', 'Params'];


    /* @ngInject */
    function BookletMaterialController($http, $scope, $timeout, Navigator, $rootScope, $filter,
                                       EducationalMaterial, Logger, Params) {

        var vm = this;

        var parameters;

        vm.goBack = goBack;
        vm.goNext = goNext;

        // Logging functions
        vm.scrollDown = scrollDown;
        vm.subClickBack = subClickBack;

        // Error message shown when a booklet page fails to load
        vm.alert = {
            type: Params.alertTypeDanger,
            message: "PAGE_ACCESS_ERROR",
        };

        activate();
        /////////////////////////////

        function activate(){
            parameters = Navigator.getParameters();

            initBooklet();
            bindEvents();

            vm.isFullscreen = false;
        }

        function initBooklet() {
            $rootScope.contentsEduBooklet = parameters;
            vm.booklet = parameters.Booklet;
            vm.activeIndex = parameters.Index;
            vm.tableOfContents = parameters.TableOfContents;
        }

        function bindEvents(){
            //Event listeners for carousel element
            document.addEventListener('ons-carousel:init', handleInitEventCarousel);
            document.addEventListener('ons-carousel:postchange', handlePostChangeEventCarousel);


            //Instantiation the popover for table of contents, delayed is to prevent the transition animation from lagging.
            $timeout(function () {
                ons.createPopover('./views/personal/education/table-contents-popover.html').then(function (popover) {
                    $scope.popover = popover;
                    $rootScope.popoverEducation = popover;
                    $scope.popover.on('posthide', function () {
                        if (typeof $rootScope.indexEduMaterial !== 'undefined') vm.carousel.setActiveCarouselItemIndex($rootScope.indexEduMaterial);
                    });
                });
            }, 300);

            //Cleaning up controller after its uninstantiated. Destroys all the listeners and extra variables
            $scope.$on('$destroy', function () {

                ons.orientation.off("change");
                delete $rootScope.contentsEduBooklet;
                document.removeEventListener('ons-carousel:postchange', handlePostChangeEventCarousel);
                document.removeEventListener('ons-carousel:init', handleInitEventCarousel);
                vm.carousel.off('init');
                vm.carousel.off('postchange');
                $scope.popover.off('posthide');
                $scope.popover.destroy();
                delete $rootScope.indexEduMaterial;
                delete $rootScope.popoverEducation;
                delete $rootScope.goToSectionBooklet;
            });
        }

        /**
         * Function handlers for advancing with the carousel
         */
        function goNext() {
            if (vm.activeIndex < vm.tableOfContents.length - 1) {
                // window.scrollTo(0,0); // Not working
                vm.activeIndex++;
                vm.carousel.setActiveCarouselItemIndex(vm.activeIndex);
            }
        }

        function goBack() {
            if (vm.activeIndex > 0) {
                vm.activeIndex--;
                vm.carousel.setActiveCarouselItemIndex(vm.activeIndex);
            }
        }

        //Popover method to jump between educational material sections from a table of contents
        $rootScope.goToSectionBooklet = function (index) {
            $rootScope.indexEduMaterial = index;
            $rootScope.popoverEducation.hide();
        };

        //Set height of container carousel element
        function setHeightElement() {
            $timeout(function () {
                var constantHeight = (ons.platform.isIOS()) ? 120 : 100;
                var divTitleHeight = $('#divTitleBookletSection').height();
                if (vm.isFullscreen) {
                    divTitleHeight = 0;
                    constantHeight -= 48;
                }
                var heightChange = document.documentElement.clientHeight - constantHeight - divTitleHeight;
                vm.heightSection = heightChange + 'px';
                $('#contentMaterial').height(heightChange);
            }, 10);
        }

        //Handles the post change even carousel, basically updates activeIndex, sets height of view and lazily loads slides
        function handlePostChangeEventCarousel(ev) {
            setHeightSection(ev.activeIndex);
            vm.carousel = ev.component;
            vm.activeIndex = ev.activeIndex;
            setHeightElement();
            lazilyLoadSlides(ev.activeIndex);

            /* This function is called exactly once every time the user navigates to a new page in the booklet carousel,
             * no matter how they do it (clicking in the TOC, clicking the carousel arrows, swiping, using the
             * pop-out TOC). Thus, this is the perfect place to log "clicking" on a booklet sub-material.
             * NOTE: There is one exception. This function does not get called when the user clicks on the first
             *   sub-material in the table of contents. That special case is addressed separately in the function
             *   goToEducationalMaterial() in individualMaterialController.js.
             * -SB */

            // Logs the sub material as clicked.
            Logger.logSubClickedEduMaterial(vm.tableOfContents[vm.activeIndex].EducationalMaterialTOCSerNum);
        }

        //Sets the height dynamically for educational material contents. Fixing the bug from Onsen.
        function setHeightSection(index) {
            vm.heightSection = $('#sectionContent' + index).height();
        }

        //This method is in charge of "lazy loading". It only loads the material if it has not been loaded yet and only for the current, previous and next slides.
        function lazilyLoadSlides(index) {
            let slidesToLoad = [index - 1, index, index + 1];

            slidesToLoad.forEach(i => {
                if (i >= 0 && i < vm.tableOfContents.length && !vm.tableOfContents[i].hasOwnProperty("Content")) {
                    $http({
                        method: 'GET',
                        url: vm.tableOfContents[i].Url,
                    }).then(res => {
                        $timeout(() => {
                            vm.tableOfContents[i].Content = $filter('removeTitleEducationalMaterial')(res.data);
                        });
                    }).catch(error => {
                        console.error(error);
                        $timeout(() => {
                            vm.tableOfContents[i].Error = true;
                        });
                    });
                }
            });
        }

        //Function that handles the initialization of the carousel. Basically deals with instantiation of carousel, loading the first slides, settings initial height, and then instaitiating a listener to watch the
        //change from portrait to landscape.
        function handleInitEventCarousel(ev) {

            vm.carousel = ev.component;
            $timeout(function () {
                vm.carousel.setActiveCarouselItemIndex(parameters.Index);
                vm.carousel.refresh();
                lazilyLoadSlides(parameters.Index);
                setHeightElement();

            }, 10);
            if (app) {
                ons.orientation.on("change", function (event) {
                    setHeightElement();
                    var i = vm.carousel._scroll / vm.carousel._currentElementSize;
                    delete vm.carousel._currentElementSize;
                    vm.carousel.setActiveCarouselItemIndex(i);
                });
            }
        }

        // Author: Tongyou (Eason) Yang
        function scrollDown(i,section){

            $timeout(function () {
                var $ = document.getElementById(i+'sub');

                $.onscroll = function () {
                    EducationalMaterial.logScrolledToBottomIfApplicable($, {
                        "EducationalMaterialTOCSerNum":section.EducationalMaterialTOCSerNum
                    });
                };

                $.onclick = function(){
                    EducationalMaterial.logScrolledToBottomIfApplicable($, {
                        "EducationalMaterialTOCSerNum":section.EducationalMaterialTOCSerNum
                    });
                };

            },0);
        }

        // Logs when a user clicks back from an educational sub-material (material contained in a booklet).
        // Author: Tongyou (Eason) Yang
        function subClickBack() {
            Logger.logSubClickedBackEduMaterial(vm.tableOfContents[vm.activeIndex].EducationalMaterialTOCSerNum);
        }
    }
})();
