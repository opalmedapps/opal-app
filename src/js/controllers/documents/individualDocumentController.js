/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 12:46 PM
 */

/**
 * @name IndividualDocumentController
 * @description Responsible for displaying and sharing a document.
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualDocumentController', IndividualDocumentController);

    IndividualDocumentController.$inject = ['$rootScope', '$scope', 'NavigatorParameters', 'Documents', '$timeout',
        'FileManagerService', 'Constants', '$q', 'UserPreferences', 'Browser', '$filter'];

    /* @ngInject */
    function IndividualDocumentController($rootScope, $scope, NavigatorParameters, Documents, $timeout,
                                          FileManagerService, Constants, $q, UserPreferences, Browser, $filter) {
        let vm = this;
        let navigator = null;
        let parameters;
        let docParams;

        vm.loading = true;
        vm.errorDownload = false;
        vm.show = false;
        vm.hide = false;

        vm.share = share;
        vm.openPDF = openPDF;
        
        $scope.about = about;
        $scope.warn = warn;
        $scope.warn2 = warn2;
        $scope.docParams = undefined;
        $scope.isAndroid = isAndroid;


        activate();

        /////////////////////////////

        function activate() {
            parameters = NavigatorParameters.getParameters();
            navigator = NavigatorParameters.getNavigator();

            //PDF params
            docParams = Documents.setDocumentsLanguage(parameters.Post);
            $scope.docParams = docParams;

            vm.doc_title = docParams.Title;
            vm.DocumentDescription = docParams.Description;

            //Create popover
            ons.createPopover('./views/personal/documents/info-popover.html', {parentScope: $scope}).then(function (popover) {
                $scope.popoverDocsInfo = popover;
            });

            $scope.$on('$destroy', function () {
                $scope.popoverDocsInfo.off('posthide');
                $scope.popoverDocsInfo.destroy();
            });

            if ($rootScope.DocAlreadyInitialized === undefined || $rootScope.DocAlreadyInitialized === false) {
                initializeDocument(docParams);
            }
            $rootScope.DocAlreadyInitialized = false;
        }

        function initializeDocument(document) {
            if (Documents.getDocumentBySerNum(document.DocumentSerNum).Content) {

            } else {
                Documents.downloadDocumentFromServer(document.DocumentSerNum).then(function () {

                }).catch(function (error) {
                    //Unable to get document from server
                    console.error(error);
                    vm.loading = false;
                    vm.errorDownload = true;
                });
            }
        }

        function openPDF() {
            vm.loading = false;
            let url = "data:application/pdf;base64," + docParams.Content;
            let newDocName = FileManagerService.generateDocumentName(docParams);
            FileManagerService.openPDF(url, newDocName);
        }

        //Share function
        function share() {

            if (Constants.app) {
                var targetPath = FileManagerService.generatePath(docParams);

                var path = FileManagerService.getPathToDocuments();
                var docName = FileManagerService.generateDocumentName(docParams);

                FileManagerService.downloadFileIntoStorage("data:application/pdf;base64," + docParams.Content, path, docName).then(function () {
                    FileManagerService.shareDocument(docName, targetPath);

                    // Now add the filename to an array to be deleted OnExit of the app (CleanUp.Clear())
                    Documents.addToDocumentsDownloaded(path, docName);    // add file info to the array

                }).catch(function (error) {
                    //Unable to download document on device
                    console.log('Error downloading document onto device: ' + error.status + ' - Error message: ' + error.message);
                });
            } else {
                ons.notification.alert({message: $filter('translate')('AVAILABLEDEVICES')});
            }
        }

        function warn() {
            modal.show();
            $scope.popoverDocsInfo.hide();
        }

        function warn2() {
            modalOpenViewer.show();
            $scope.popoverDocsInfo.hide();
        }

        function isAndroid() {
            return ons.platform.isAndroid();
        }

        function about() {

            $rootScope.DocAlreadyInitialized = true;

            if (vm.DocumentDescription !== '') {
                navigator.pushPage('./views/personal/documents/about-document.html');
            } else {
                // Check if there is any about link
                var link = null;
                docParams.hasOwnProperty("URL_EN") ? link = docParams["URL_" + UserPreferences.getLanguage()] : {};

                // Set the options to send to the content controller
                var contentOptions = {
                    contentType: docParams.AliasName_EN,
                    contentLink: link
                };

                navigator.pushPage('./views/templates/content.html', contentOptions);
            }

            $scope.popoverDocsInfo.hide();
        }
    }
})();
