/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:09 PM
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
        .module('MUHCApp')
        .controller('BookletMaterialController', BookletMaterialController);

    BookletMaterialController.$inject = ['$scope', '$timeout', 'NavigatorParameters', '$rootScope', '$filter'];

    /* @ngInject */
    function BookletMaterialController($scope, $timeout, NavigatorParameters, $rootScope, $filter) {

        var vm = this;

        var parameters;
        var navigatorName;

        vm.goBack = goBack;
        vm.goNext = goNext;

        activate();
        /////////////////////////////

        function activate(){
            parameters = NavigatorParameters.getParameters();
            navigatorName = parameters.Navigator;

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
                ons.createPopover('./views/education/table-contents-popover.html').then(function (popover) {
                    vm.popover = popover;
                    $rootScope.popoverEducation = popover;
                    vm.popover.on('posthide', function () {
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
                vm.popover.off('posthide');
                vm.popover.destroy();
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
        }

        //Sets the height dynamically for educational material contents. Fixing the bug from Onsen.
        function setHeightSection(index) {
            vm.heightSection = $('#sectionContent' + index).height();
        }

        //This method is in charge of "lazy loading". It only loads the material if it has not been loaded yet and only for the current, previous and next slides.
        function lazilyLoadSlides(index) {
            if (index - 1 >= 0 && !vm.tableOfContents[index - 1].hasOwnProperty("Content")) {
                $.get(vm.tableOfContents[index - 1].Url, function (res) {
                    $timeout(function () {
                        vm.tableOfContents[index - 1].Content = $filter('removeTitleEducationalMaterial')(res);
                    });
                });
            }
            if (!vm.tableOfContents[index].hasOwnProperty("Content")) {
                $.get(vm.tableOfContents[index].Url, function (res) {
                    $timeout(function () {
                        vm.tableOfContents[index].Content = $filter('removeTitleEducationalMaterial')(res);
                    });
                });
            }
            if (index + 1 < vm.tableOfContents.length && !vm.tableOfContents[index + 1].hasOwnProperty("Content")) {
                $.get(vm.tableOfContents[index + 1].Url, function (res) {
                    $timeout(function () {
                        vm.tableOfContents[index + 1].Content = $filter('removeTitleEducationalMaterial')(res);
                    });
                });
            }
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


    }
})();
