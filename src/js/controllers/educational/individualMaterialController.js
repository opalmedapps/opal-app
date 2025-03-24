/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:08 PM
 */

/**
 * Modification History
 *
 * 2018 Nov: Project: Fertility Educate / Educational Material Packages / Education Material Interaction Logging
 *           Developed by Tongyou (Eason) Yang in Summer 2018
 *           Merged by Stacey Beard
 *           Commit # 6706edfb776eabef4ef4a2c9b69d834960863435
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualMaterialController', IndividualMaterialController);

    IndividualMaterialController.$inject = ['$scope', '$timeout', 'NavigatorParameters', 'EducationalMaterial',
        'FileManagerService', '$filter', 'Logger', 'Params', 'Toast', 'Constants'];

    /* @ngInject */
    function IndividualMaterialController($scope, $timeout, NavigatorParameters, EducationalMaterial,
        FileManagerService, $filter, Logger, Params, Toast, Constants) {
        var vm = this;

        var param;
        var navigatorPage;

        vm.loadingContents = false;
        vm.errorLoadingContents = false;

        // Error message used when a pdf fails to download
        vm.alert = {
            type: Params.alertTypeDanger,
            message: "OPEN_PDF_ERROR",
        };

        vm.goToEducationalMaterial = goToEducationalMaterial;
        vm.openPDF = openPDF;
        vm.isShareable = isShareable;

        // Logging functions
        vm.scrollDown = scrollDown;
        vm.clickBack = clickBack;

        // Function used to open a material contained in a package
        vm.goInPackage = goInPackage;

        // Used by the share popover
        $scope.popoverSharing = undefined;
        $scope.share = share;

        activate();
        /////////////////////////////

        function activate() {
            //Getting Parameters from navigation
            param = NavigatorParameters.getParameters();
            navigatorPage = param.Navigator;

            bindEvents();

            // Set educational material language
            vm.edumaterial = EducationalMaterial.setLanguage(param.Post);

            // Log the activity
            if (param.Post.EducationalMaterialSerNum) {
                Logger.sendLog('EducationalMaterialSerNum', param.Post.EducationalMaterialSerNum);
            }
            else if (param.Post.EducationalMaterialControlSerNum) {
                Logger.sendLog('EducationalMaterialControlSerNum', param.Post.EducationalMaterialControlSerNum);
            }

            // RStep refers to recursive depth in a package (since packages can contain other packages).
            vm.recursive_step = param.RStep;

            // Determine the material's display type (pdf, package, html, etc.)
            vm.displayType = EducationalMaterial.getDisplayType(vm.edumaterial);

            //If its a booklet, translate table of contents
            if (vm.displayType === "booklet") {
                vm.tableOfContents = vm.edumaterial.TableContents;
                vm.tableOfContents = EducationalMaterial.setLanguage(vm.tableOfContents);
            }

            // If the material is an html page to be shown immediately, download it
            if (vm.displayType === "html") downloadIndividualPage();

            // Determine if it's a package.
            if (vm.displayType === "package") {

                vm.loadingContents = true;

                // Get the package contents from the database if it hasn't been downloaded already.
                if (!vm.edumaterial.PackageContents) {

                    EducationalMaterial.getPackageContents(vm.edumaterial.EducationalMaterialControlSerNum).then((packageContents) => {
                        vm.edumaterial.PackageContents = packageContents;

                        // Translate the package materials to the correct language.
                        EducationalMaterial.setLanguage(vm.edumaterial.PackageContents);

                        vm.loadingContents = false;

                    }).catch((err) => {
                        console.log("Failed to get package contents from the server.");
                        console.log(err);

                        vm.loadingContents = false;
                        vm.errorLoadingContents = true;
                    });
                }
                else {
                    // If the package materials were already downloaded, translate them anyways (in case the user switched language).
                    EducationalMaterial.setLanguage(vm.edumaterial.PackageContents);

                    vm.loadingContents = false;
                }
            }
        }

        function bindEvents() {
            let navigator = NavigatorParameters.getNavigator();

            //Instantiating popover controller
            $timeout(() => {
                ons.createPopover('./views/personal/education/share-popover.html', { parentScope: $scope }).then(function (popover) {
                    $scope.popoverSharing = popover;
                });
            }, 300);

            //On destroy clean up
            $scope.$on('$destroy', function () {
                navigator.off('prepop');
                $scope.popoverSharing.destroy();
            });

            navigator.on('prepop', () => NavigatorParameters.reloadPreviousProfilePrepopHandler());
        }

        function goToEducationalMaterial(index) {
            try {
                let nextStatus = EducationalMaterial.openEducationalMaterialDetails(vm.edumaterial);
                if (nextStatus !== -1) {
                    NavigatorParameters.setParameters({ 'Navigator': navigatorPage, 'Index': index, 'Booklet': vm.edumaterial, 'TableOfContents': vm.tableOfContents });
                    navigatorPage.pushPage(nextStatus.Url);

                    /* Most calls to logSubClickedEduMaterial() are handled by the function handlePostChangeEventCarousel()
                     * in bookletMaterialController.js. However, the one special case (clicking on the first material in
                     * a table of contents) is handled here. That's why logSubClickedEduMaterial() is only called if
                     * index == 0.
                     * -SB */

                    // Logs the sub material as clicked, if it is the first sub-material in the table of contents.
                    if (index == 0) {
                        Logger.logSubClickedEduMaterial(vm.tableOfContents[index].EducationalMaterialTOCSerNum);
                    }
                }
            }
            catch (error) {
                console.error(error);
                Toast.showToast({
                    message: $filter('translate')('EDU_OPEN_ERROR'),
                });
            }
        }

        /**
         * @description Special case of "goToEducationalMaterial" for opening pdfs.
         *              Opens a pdf, showing a loading wheel while it downloads.
         *              If the download/opening process fails, an error is displayed.
         */
        function openPDF() {
            vm.loadingContents = true;
            vm.errorLoadingContents = false;
            EducationalMaterial.openEducationalMaterialPDF(vm.edumaterial).then(() => {
                $timeout(() => {
                    vm.loadingContents = false;
                });
            }).catch(error => {
                console.error(JSON.stringify(error));
                $timeout(() => {
                    vm.loadingContents = false;
                    vm.errorLoadingContents = true;
                });
            })
        }

        /**
         * @description Determines whether the material can be shared, based on whether it has a URL for this.
         * @returns {boolean} True if the material can be shared; false otherwise.
         */
        function isShareable() {
            return getURLToShare() !== "";
        }

        /**
         * @description Returns the URL to use when sharing the material: if a ShareURL is provided, it is used.
         *              Otherwise, it defaults to using the regular material URL, if one exists.
         *              Note: materials without either URL (e.g. a booklet for which no ShareURL was provided)
         *                    are not shareable.
         * @author Stacey Beard
         * @date 2021-10-08
         * @returns {string} The URL to use to share the material if possible, or otherwise an empty string.
         */
        function getURLToShare() {
            let shareURL = vm.edumaterial.ShareURL;
            let regularURL = vm.edumaterial.Url;

            if (shareURL && shareURL !== "") return shareURL;
            else if (regularURL && regularURL !== "") return regularURL;
            else return "";
        }

        /**
         * @description Shares a document using cordova's social sharing plugin.
         *              The document must first be saved to the device's internal memory.
         *              Note: document sharing is not supported on a browser (a warning will be shown).
         */
        function share() {
            FileManagerService.share(vm.edumaterial.Name, getURLToShare());
        }

        function downloadIndividualPage() {
            if (!vm.edumaterial.hasOwnProperty('Content')) {
                vm.loadingContents = true;

                EducationalMaterial.getMaterialPage(vm.edumaterial.Url)
                    .then(function (response) {
                        vm.edumaterial.Content = response.data;
                        vm.loadingContents = false;
                    })
                    .catch(function () {
                        vm.loadingContents = false;
                        vm.errorLoadingContents = true;
                    })
            }
        }

        // Author: Tongyou (Eason) Yang
        function scrollDown() {

            $timeout(function () {

                var $ = document.getElementById(vm.recursive_step);

                // This makes sure that scrolling is only checked here for HTML pages (not on Videos, Packages, etc.)
                // [Scrolling is also checked for booklet sub-materials, handled in bookletMaterialController.]
                if (vm.displayType === "html") {

                    $.onscroll = function () {
                        EducationalMaterial.logScrolledToBottomIfApplicable($, {
                            "EducationalMaterialControlSerNum": vm.edumaterial.EducationalMaterialControlSerNum
                        });
                    };

                    $.onclick = function () {
                        EducationalMaterial.logScrolledToBottomIfApplicable($, {
                            "EducationalMaterialControlSerNum": vm.edumaterial.EducationalMaterialControlSerNum
                        });
                    }
                }
            }, 0);

        }

        // Logs when a user clicks back from an educational material.
        // Author: Tongyou (Eason) Yang
        function clickBack() {
            Logger.logClickedBackEduMaterial(vm.edumaterial.EducationalMaterialControlSerNum);
        }

        // Opens a material contained in a package.
        // Author: Tongyou (Eason) Yang
        function goInPackage(material) {
            // Logs the material as clicked.
            Logger.logClickedEduMaterial(material.EducationalMaterialControlSerNum);

            // RStep refers to recursive depth in a package (since packages can contain other packages).
            var rstep = vm.recursive_step + 1;
            NavigatorParameters.setParameters({ 'Navigator': navigatorPage, 'Post': material, 'RStep': rstep });
            navigatorPage.pushPage('./views/personal/education/individual-material.html');

        }
    }
})();
