// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

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
        .module('OpalApp')
        .controller('IndividualDocumentController', IndividualDocumentController);

    IndividualDocumentController.$inject = ['$rootScope', '$scope', 'Navigator', 'Documents', '$timeout',
        'FileManagerService', 'Constants', '$q', 'UserPreferences', 'Browser', '$filter', 'Toast'];

    /* @ngInject */
    function IndividualDocumentController($rootScope, $scope, Navigator, Documents, $timeout,
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
            parameters = Navigator.getParameters();
            navigator = Navigator.getNavigator();

            //PDF params
            docParams = Documents.setDocumentsLanguage(parameters.Post);
            docParams.fileName = FileManagerService.generateDocumentName(docParams);
            $scope.docParams = docParams;

            vm.doc_title = docParams.Title;
            vm.DocumentDescription = docParams.Description;

            //Create popover
            ons.createPopover('./views/personal/documents/info-popover.html', {parentScope: $scope}).then(function (popover) {
                $scope.popoverDocsInfo = popover;
            });

            bindEvents();

            if ($rootScope.DocAlreadyInitialized === undefined || $rootScope.DocAlreadyInitialized === false) {
                initializeDocument(docParams);
            }
            $rootScope.DocAlreadyInitialized = false;
        }

        /**
         * @description Sets up event bindings for this controller.
         */
        function bindEvents() {
            $scope.$on('$destroy', function () {
                navigator.off('prepop');
                $scope.popoverDocsInfo.off('posthide');
                $scope.popoverDocsInfo.destroy();

                // After a delay, check if this destroy event corresponds to leaving the clinical reports section
                $timeout(() => {
                    try {
                        let nav = Navigator.getNavigator();

                        // If the destroy event is tied to leaving the page, clear the document info
                        let viewingDocument = nav.pages.some((e) => { return e.page.includes("individual-document.html") });
                        if (!viewingDocument) Documents.clearDocumentContent(docParams);
                    }
                    catch (error) {
                        console.warn(`Unable to delete data for document: ${docParams.fileName}`);
                        console.warn(error);
                    }
                }, 200);
            });

            // Reload user profile if individual document was opened via Notifications,
            // and profile was implicitly changed.
            navigator.on('prepop', () => Navigator.reloadPreviousProfilePrepopHandler('notifications.html'));
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
            let base64URL = `data:application/pdf;base64,${docParams.Content}`;
            FileManagerService.openPDF(base64URL, docParams.fileName).catch(error => {
                console.error(`Error opening PDF: ${JSON.stringify(error)}`);
                Toast.showToast({
                    message: $filter('translate')('OPEN_PDF_ERROR'),
                });
            })
        }

        /**
         * @description Shares a document using cordova's social sharing plugin.
         *              The document must first be saved to the device's internal memory.
         *              Note: document sharing is not supported on a browser (a warning will be shown).
         */
        function share() {
            let base64URL = `data:application/pdf;base64,${docParams.Content}`;
            FileManagerService.share(docParams.fileName, base64URL);
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
                navigator.pushPage('./views/personal/documents/about-document.html', {'Post': docParams});
            } else {
                // Set the options to send to the content controller
                var contentOptions = {
                    contentType: docParams.AliasName_EN,
                    contentLink: docParams["URL_" + UserPreferences.getLanguage()],
                    title: 'INFO',
                };

                navigator.pushPage('./views/templates/content.html', contentOptions);
            }

            $scope.popoverDocsInfo.hide();
        }
    }
})();
