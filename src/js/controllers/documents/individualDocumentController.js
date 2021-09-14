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
        'FileManagerService', 'Constants', '$q', 'UserPreferences', 'Browser', '$filter', 'Toast'];

    /* @ngInject */
    function IndividualDocumentController($rootScope, $scope, NavigatorParameters, Documents, $timeout,
                                          FileManagerService, Constants, $q, UserPreferences, Browser, $filter,
                                          Toast) {
        let vm = this;
        let navigator = null;
        let parameters;
        let docParams;

        vm.errorDownload = false;

        vm.share = share;
        vm.openPDF = openPDF;

        // Variables used by the info popover
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
            // Download the document if it hasn't been successfully downloaded already
            // The pdf viewer directive is bound to the document contents, so it will update automatically on success
            if (!document.Content) Documents.downloadDocumentFromServer(document.DocumentSerNum).catch(function (error) {
                console.error(error);
                $timeout(() => {
                    vm.errorDownload = true;
                });
            });
        }

        function openPDF() {
            let url = "data:application/pdf;base64," + docParams.Content;
            let newDocName = FileManagerService.generateDocumentName(docParams);
            FileManagerService.openPDF(url, newDocName).catch(error => {
                console.error(`Error opening PDF: ${JSON.stringify(error)}`);
                Toast.showToast({
                    message: $filter('translate')('OPEN_PDF_ERROR'),
                });
            })
        }

        /**
         * @description Shares a document using cordova's social sharing plugin.
         *              The document must first be saved to the device's internal memory.
         *              Since clinical documents may contain sensitive medical data, the shareSensitiveDocument function
         *              is used to ensure that the document is deleted immediately after sharing.
         *              Note: document sharing is not supported on a browser (a warning will be shown).
         */
        function share() {
            // Sharing is only available on mobile devices
            if (!Constants.app) {
                ons.notification.alert({message: $filter('translate')('AVAILABLEDEVICES')});
                return;
            }

            let docName = FileManagerService.generateDocumentName(docParams);
            let base64URL = `data:application/pdf;base64,${docParams.Content}`;

            // Sensitive documents are deleted from local storage after being shared
            FileManagerService.shareSensitiveDocument(docName, base64URL).catch(error => {
                console.error(`Error sharing document: ${JSON.stringify(error)}`);
                Toast.showToast({
                    message: $filter('translate')("UNABLE_TO_SHARE_DOCUMENT"),
                });
            });
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
