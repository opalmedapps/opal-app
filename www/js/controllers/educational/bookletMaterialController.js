/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:09 PM
 */

/**
 * @method BookletEduMaterialController
 * @description This controller takes care of the displying the educational material that has a table of contents in a carousel fashion. It also takes care of the popover that controls the table of contents and
 * rating.
 *
 */
myApp.controller('BookletMaterialController', ['$scope', '$timeout', 'NavigatorParameters', 'EducationalMaterial', '$rootScope', '$filter', function ($scope, $timeout, NavigatorParameters, EducationalMaterial, $rootScope, $filter) {

    //Obtaining educational material parameters
    var parameters = NavigatorParameters.getParameters();
    var navigatorName = parameters.Navigator;

    initBooklet();

    //Initialization variables for material
    function initBooklet() {
        $rootScope.contentsEduBooklet = parameters;
        $scope.booklet = parameters.Booklet;
        $scope.activeIndex = parameters.Index;
        $scope.tableOfContents = parameters.TableOfContents;
    }
    $scope.isFullscreen = false;

    /**
     * Event listeners for carousel element
     */
    document.addEventListener('ons-carousel:init', handleInitEventCarousel);
    document.addEventListener('ons-carousel:postchange', handlePostChangeEventCarousel);

    /**
     * Function handlers for advancing with the carousel
     */
    $scope.goNext = function () {
        if ($scope.activeIndex < $scope.tableOfContents.length - 1) {
            $scope.activeIndex++;
            $scope.carousel.setActiveCarouselItemIndex($scope.activeIndex);

        }
    };
    $scope.goBack = function () {
        if ($scope.activeIndex > 0) {
            $scope.activeIndex--;
            $scope.carousel.setActiveCarouselItemIndex($scope.activeIndex);
        }
    };

    /**
     * Instantiation the popover for table of contents, delayed is to prevent the transition animation from lagging.
     */
    $timeout(function () {
        ons.createPopover('./views/education/table-contents-popover.html').then(function (popover) {
            $scope.popover = popover;
            $rootScope.popoverEducation = popover;
            $scope.popover.on('posthide', function () {
                if (typeof $rootScope.indexEduMaterial !== 'undefined') $scope.carousel.setActiveCarouselItemIndex($rootScope.indexEduMaterial);
            });
        });
    }, 300);

    //Popover method to jump between educational material sections from a table of contents
    $rootScope.goToSectionBooklet = function (index) {
        $rootScope.indexEduMaterial = index;
        $rootScope.popoverEducation.hide();
    };
    //Cleaning up controller after its uninstantiated. Destroys all the listeners and extra variables
    $scope.$on('$destroy', function () {

        ons.orientation.off("change");
        delete $rootScope.contentsEduBooklet;
        document.removeEventListener('ons-carousel:postchange', handlePostChangeEventCarousel);
        document.removeEventListener('ons-carousel:init', handleInitEventCarousel);
        $scope.carousel.off('init');
        $scope.carousel.off('postchange');
        $scope.popover.off('posthide');
        $scope.popover.destroy();
        delete $rootScope.indexEduMaterial;
        delete $rootScope.popoverEducation;
        delete $rootScope.goToSectionBooklet;
    });
    /**
     * Set height of container carousel element
     *
     */
    function setHeightElement() {
        $timeout(function () {
            var constantHeight = (ons.platform.isIOS()) ? 120 : 100;
            var divTitleHeight = $('#divTitleBookletSection').height();
            if ($scope.isFullscreen) {
                divTitleHeight = 0;
                constantHeight -= 48;
            }
            var heightChange = document.documentElement.clientHeight - constantHeight - divTitleHeight;
            $scope.heightSection = heightChange + 'px';
            $('#contentMaterial').height(heightChange);
        }, 10);
    }

    //Handles the post change even carousel, basically updates activeIndex, sets height of view and lazily loads slides
    function handlePostChangeEventCarousel(ev) {
        setHeightSection(ev.activeIndex);
        $scope.carousel = ev.component;
        $scope.activeIndex = ev.activeIndex;
        setHeightElement();
        lazilyLoadSlides(ev.activeIndex);
    }

    //Sets the height dynamically for educational material contents. Fixing the bug from Onsen.
    function setHeightSection(index) {
        $scope.heightSection = $('#sectionContent' + index).height();
    }

    //This method is in charge of "lazy loading". It only loads the material if it has not been loaded yet and only for the current, previous and next slides.
    function lazilyLoadSlides(index) {
        if (index - 1 >= 0 && !$scope.tableOfContents[index - 1].hasOwnProperty("Content")) {
            $.get($scope.tableOfContents[index - 1].Url, function (res) {
                $timeout(function () {
                    $scope.tableOfContents[index - 1].Content = $filter('removeTitleEducationalMaterial')(res);
                });
            });
        }
        if (!$scope.tableOfContents[index].hasOwnProperty("Content")) {
            $.get($scope.tableOfContents[index].Url, function (res) {
                $timeout(function () {
                    $scope.tableOfContents[index].Content = $filter('removeTitleEducationalMaterial')(res);
                });
            });
        };
        if (index + 1 < $scope.tableOfContents.length && !$scope.tableOfContents[index + 1].hasOwnProperty("Content")) {
            $.get($scope.tableOfContents[index + 1].Url, function (res) {
                $timeout(function () {
                    $scope.tableOfContents[index + 1].Content = $filter('removeTitleEducationalMaterial')(res);
                });
            });
        }
    }
    //Function that handles the initialization of the carousel. Basically deals with instantiation of carousel, loading the first slides, settings initial height, and then instaitiating a listener to watch the
    //change from portrait to landscape.
    function handleInitEventCarousel(ev) {

        $scope.carousel = ev.component;
        $timeout(function () {
            $scope.carousel.setActiveCarouselItemIndex(parameters.Index);
            $scope.carousel.refresh();
            lazilyLoadSlides(parameters.Index);
            setHeightElement();

        }, 10);
        if (app) {
            ons.orientation.on("change", function (event) {

                //$scope.carousel.refresh();

                setHeightElement();
                var i = $scope.carousel._scroll / $scope.carousel._currentElementSize;
                delete $scope.carousel._currentElementSize;
                $scope.carousel.setActiveCarouselItemIndex(i);
            });
        }
    }
}]);