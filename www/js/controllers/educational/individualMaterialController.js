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

            //set educational material language
            vm.edumaterial = EducationalMaterial.setLanguage(param.Post);
            Logger.sendLog('Educational Material', param.Post.EducationalMaterialSerNum);

            // RStep refers to recursive depth in a package (since packages can contain other packages).
            vm.recursive_step = param.RStep;

            matchingDocuments();

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

            if(vm.edumaterial.Type === "Package"){
                vm.PackageContents = vm.edumaterial.PackageContents;
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

                // console.log('vm.tableOfContents[index]:');
                // console.log(vm.tableOfContents[index]);

                EducationalMaterial.writeSubClickedRequest(Patient.getPatientId(),vm.tableOfContents[index].EducationalMaterialTOCSerNum)
                    // // For testing
                    // .then((res)=>{
                    //     console.log(res);
                    //     console.log("set sub clicked")
                    // });

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

                    if($.clientHeight===$.scrollHeight-$.scrollTop){

                        EducationalMaterial.writeScrollToBottomRequest(vm.edumaterial.EducationalMaterialSerNum, Patient.getPatientId())
                            // // For testing
                            // .then((res) => {
                            //     console.log(res);
                            //     console.log("set scrolled to bottom");
                            // });
                    }
                };

                $.onclick = function () {

                    if($.scrollHeight<=$.clientHeight) {//don't need to scroll

                        EducationalMaterial.writeScrollToBottomRequest(vm.edumaterial.EducationalMaterialSerNum, Patient.getPatientId())
                            // // For testing
                            // .then((res) => {
                            //     console.log(res);
                            //     console.log("default scrolled to bottom")
                            // });
                    }
                }

            },0);

        }

        // Logs when a user clicks back from an educational material.
        // Author: Tongyou (Eason) Yang
        function clickBack() {
            EducationalMaterial.writeClickedBackRequest(vm.edumaterial.EducationalMaterialSerNum, Patient.getPatientId())
                // // For testing
                // .then((res)=>{
                //     console.log(res);
                //     console.log("clicked back");
                // });
        }

        // Author: Tongyou (Eason) Yang
        function matchingDocuments(){
            vm.existingMaterials = EducationalMaterial.setLanguage(EducationalMaterial.getEducationalMaterial());
            vm.packageContent = {};//build a matching dictionary

            vm.existingMaterials.forEach(function(mat){
                vm.packageContent[mat.EducationalMaterialControlSerNum] = mat;
            });
        }

        // Opens a material contained in a package.
        // Author: Tongyou (Eason) Yang
        function goInPackage(material){

            if(vm.packageContent[material.EducationalMaterialControlSerNum].ReadStatus==0){
                vm.packageContent[material.EducationalMaterialControlSerNum].ReadStatus = 1;
                EducationalMaterial.readMaterial(vm.packageContent[material.EducationalMaterialControlSerNum].EducationalMaterialSerNum);
            }
            EducationalMaterial.writeClickedRequest(vm.packageContent[material.EducationalMaterialControlSerNum].EducationalMaterialSerNum, Patient.getPatientId());

            // RStep refers to recursive depth in a package (since packages can contain other packages).
            var rstep = vm.recursive_step + 1;
            NavigatorParameters.setParameters({ 'Navigator': navigatorPage,'Post': vm.packageContent[material.EducationalMaterialControlSerNum], 'RStep':rstep });
            window[navigatorPage].pushPage('./views/education/individual-material.html');

        }
    }
})();

