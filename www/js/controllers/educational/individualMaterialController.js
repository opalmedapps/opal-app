/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:08 PM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualMaterialController', IndividualMaterialController);

    IndividualMaterialController.$inject = ['$scope', '$timeout', 'NavigatorParameters', 'EducationalMaterial', 'FileManagerService', '$filter', 'Logger', 'NetworkStatus'];

    /* @ngInject */
    function IndividualMaterialController($scope, $timeout, NavigatorParameters, EducationalMaterial, FileManagerService, $filter, Logger, NetworkStatus) {
        var vm = this;

        var param;
        var navigatorPage;
        var app;


        vm.goToEducationalMaterial = goToEducationalMaterial;
        vm.share = share;
        vm.print = print;

        activate();
        /////////////////////////////

        function activate(){
            //Getting Parameters from navigation
            param = NavigatorParameters.getParameters();
            navigatorPage = param.Navigator;

            bindEvents();

            //set educational material language
            vm.edumaterial =EducationalMaterial.setLanguage(param.Post);
            Logger.sendLog('Educational Material', param.Post.EducationalMaterialSerNum);

            //Determine if material has a ShareURL and is printable
            if(vm.edumaterial.hasOwnProperty('ShareURL')&& vm.edumaterial.ShareURL !=="") {
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
            }
        }

        function share(){
            FileManagerService.shareDocument(vm.edumaterial.Name, vm.edumaterial.ShareURL);
            $scope.popoverSharing.hide();
        }

        function print(){
            //If no connection then simply alert the user to connect to the internet
            $scope.popoverSharing.hide();
            if(app && NetworkStatus.isOnline())
            {
                EducationalMaterial.getMaterialBinary(vm.edumaterial.ShareURL)
                    .then(function(){
                        var blob = new Blob([this.response], { type: 'application/pdf' });
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(blob);
                        fileReader.onloadend = function() {
                            var base64data = fileReader.result;
                            base64data = base64data.replace('data:application/pdf;base64,','');
                            window.plugins.PrintPDF.print({
                                data: base64data,
                                type: 'Data',
                                title: $filter('translate')("PRINTDOCUMENT"),
                                success: function(){},
                                error: function(data){
                                    ons.notification.alert({'message':$filter('translate')('UNABLETOOBTAINEDUCATIONALMATERIAL')});
                                }
                            });
                        }
                    })
                    .catch(function(){
                        ons.notification.alert({'message':$filter('translate')('UNABLETOOBTAINEDUCATIONALMATERIAL')});
                    });
            }else{
                $scope.popoverSharing.hide();
                ons.notification.alert({'message':$filter('translate')("PRINTINGUNAVAILABLE")});
            }
        }

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
    }
})();

