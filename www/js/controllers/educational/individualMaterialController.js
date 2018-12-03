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
        'FileManagerService', '$filter', 'Logger', 'NetworkStatus', 'Patient'];

    /* @ngInject */
    function IndividualMaterialController($scope, $timeout, NavigatorParameters, EducationalMaterial,
                                          FileManagerService, $filter, Logger, NetworkStatus, Patient) {
        var vm = this;

        var param;
        var navigatorPage;
        var app;

        vm.loadingPackageContents = false;
        vm.noPackageContents = false;

        vm.goToEducationalMaterial = goToEducationalMaterial;
        vm.share = share;
        vm.print = print;

        // Logging functions
        vm.scrollDown = scrollDown;
        vm.clickBack = clickBack;

        // Function used to open a material contained in a package
        vm.goInPackage = goInPackage;

        activate();
        /////////////////////////////

        function activate(){
            //Getting Parameters from navigation
            param = NavigatorParameters.getParameters();
            navigatorPage = param.Navigator;

            bindEvents();

            // Set educational material language
            vm.edumaterial = EducationalMaterial.setLanguage(param.Post);

            // Log the activity
            if (param.Post.EducationalMaterialSerNum){
                Logger.sendLog('EducationalMaterialSerNum', param.Post.EducationalMaterialSerNum);
            }
            else if (param.Post.EducationalMaterialControlSerNum){
                Logger.sendLog('EducationalMaterialControlSerNum', param.Post.EducationalMaterialControlSerNum);
            }

            // RStep refers to recursive depth in a package (since packages can contain other packages).
            vm.recursive_step = param.RStep;

            //Determine if material has a ShareURL and is printable
            if(vm.edumaterial.ShareURL && vm.edumaterial.ShareURL !=="") {
                vm.isPrintable = FileManagerService.isPDFDocument(vm.edumaterial.ShareURL);
            }

            //Determine if material is a booklet
            var isBooklet = vm.edumaterial.hasOwnProperty('TableContents');

            //Determine if material is an app
            app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

            //If its a booklet, translate table of contents
            if (isBooklet) {
                vm.tableOfContents = vm.edumaterial.TableContents;
                vm.tableOfContents = EducationalMaterial.setLanguage(vm.tableOfContents);
            }

            //Determining if its an individual php page to show immediately.
            vm.isIndividualHtmlPage = (FileManagerService.getFileType(vm.edumaterial.URL_EN) === 'php');
            if(vm.isIndividualHtmlPage) downloadIndividualPage();

            // Determine if it's a package.
            if(vm.edumaterial.EducationalMaterialType_EN === "Package"){

                vm.loadingPackageContents = true;

                // Get the package contents from the database if it hasn't been downloaded already.
                if(!vm.edumaterial.PackageContents){

                    EducationalMaterial.getPackageContents(vm.edumaterial.EducationalMaterialControlSerNum).then((packageContents)=>{
                        vm.edumaterial.PackageContents = packageContents;

                        // Translate the package materials to the correct language.
                        EducationalMaterial.setLanguage(vm.edumaterial.PackageContents);

                        vm.loadingPackageContents = false;

                    }).catch((err) => {
                        console.log("Failed to get package contents from the server.");
                        console.log(err);

                        vm.loadingPackageContents = false;
                        vm.noPackageContents = true;
                    });
                }
                else{
                    // If the package materials were already downloaded, translate them anyways (in case the user switched language).
                    EducationalMaterial.setLanguage(vm.edumaterial.PackageContents);

                    vm.loadingPackageContents = false;
                }
            }
        }

        function bindEvents(){
            //Instantiating popover controller
            $timeout(function () {
                ons.createPopover('./views/education/share-print-popover.html',{parentScope: $scope}).then(function (popover) {
                    $scope.popoverSharing = popover;
                });
            }, 300);

            //On destroy clean up
            $scope.$on('$destroy', function () {
                $scope.popoverSharing.destroy();
            });
        }

        function goToEducationalMaterial(index){

            var nextStatus = EducationalMaterial.openEducationalMaterialDetails(vm.edumaterial);
            if (nextStatus !== -1) {
                NavigatorParameters.setParameters({ 'Navigator': navigatorPage, 'Index': index, 'Booklet': vm.edumaterial, 'TableOfContents': vm.tableOfContents });
                window[navigatorPage].pushPage(nextStatus.Url);

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

        function share(){
            FileManagerService.shareDocument(vm.edumaterial.Name, vm.edumaterial.ShareURL,vm.edumaterial.Type);
            $scope.popoverSharing.hide();
        }

        // PrintPDF.print uses the plugin cordova-plugin-print-pdf
        // 
        // function print(){
        //     //If no connection then simply alert the user to connect to the internet
        //     $scope.popoverSharing.hide();
        //     if(app && NetworkStatus.isOnline())
        //     {
        //         EducationalMaterial.getMaterialBinary(vm.edumaterial.ShareURL)
        //             .then(function(){
        //                 var blob = new Blob([this.response], { type: 'application/pdf' });
        //                 var fileReader = new FileReader();
        //                 fileReader.readAsDataURL(blob);
        //                 fileReader.onloadend = function() {
        //                     var base64data = fileReader.result;
        //                     base64data = base64data.replace('data:application/pdf;base64,','');
        //                     window.plugins.PrintPDF.print({
        //                         data: base64data,
        //                         type: 'Data',
        //                         title: $filter('translate')("PRINTDOCUMENT"),
        //                         success: function(){},
        //                         error: function(data){
        //                             ons.notification.alert({'message':$filter('translate')('UNABLETOOBTAINEDUCATIONALMATERIAL')});
        //                         }
        //                     });
        //                 }
        //             })
        //             .catch(function(){
        //                 ons.notification.alert({'message':$filter('translate')('UNABLETOOBTAINEDUCATIONALMATERIAL')});
        //             });
        //     }else{
        //         $scope.popoverSharing.hide();
        //         ons.notification.alert({'message':$filter('translate')("PRINTINGUNAVAILABLE")});
        //     }
        // }

        function downloadIndividualPage()
        {
            if(!vm.edumaterial.hasOwnProperty('Content'))
            {
                EducationalMaterial.getMaterialPage(vm.edumaterial.Url)
                    .then(function(response){
                        vm.edumaterial.Content = response.data;
                    })
                    .catch(function(){
                        ons.notification.alert({'message':$filter('translate')('UNABLETOOBTAINEDUCATIONALMATERIAL')});
                    })
            }
        }

        // Author: Tongyou (Eason) Yang
        function scrollDown(){

            $timeout(function () {

                var $ = document.getElementById(vm.recursive_step);

                $.onscroll = function () {
                    EducationalMaterial.logScrolledToBottomIfApplicable($, vm.edumaterial.EducationalMaterialType_EN, {
                        "EducationalMaterialControlSerNum":vm.edumaterial.EducationalMaterialControlSerNum
                    });
                };

                $.onclick = function () {
                    EducationalMaterial.logScrolledToBottomIfApplicable($, vm.edumaterial.EducationalMaterialType_EN, {
                        "EducationalMaterialControlSerNum":vm.edumaterial.EducationalMaterialControlSerNum
                    });
                }

            },0);

        }

        // Logs when a user clicks back from an educational material.
        // Author: Tongyou (Eason) Yang
        function clickBack() {
            Logger.logClickedBackEduMaterial(vm.edumaterial.EducationalMaterialControlSerNum);
        }

        // Opens a material contained in a package.
        // Author: Tongyou (Eason) Yang
        function goInPackage(material){
            // Logs the material as clicked.
            Logger.logClickedEduMaterial(material.EducationalMaterialControlSerNum);

            // RStep refers to recursive depth in a package (since packages can contain other packages).
            var rstep = vm.recursive_step + 1;
            NavigatorParameters.setParameters({ 'Navigator': navigatorPage,'Post': material, 'RStep':rstep });
            window[navigatorPage].pushPage('./views/education/individual-material.html');

        }
    }
})();

