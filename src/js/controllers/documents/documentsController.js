//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('DocumentsController', DocumentsController);

    DocumentsController.$inject = [
        'Documents', '$filter', 'NavigatorParameters', 'Permissions', 'Logger', '$timeout', 'Notifications',
    ];

    /* @ngInject */
    function DocumentsController(Documents, $filter, NavigatorParameters, Permissions, Logger, $timeout, Notifications) {
        var vm = this;
        vm.noDocuments = true;
        vm.documents = [];

        vm.goToDocument = goToDocument;

        // Used by patient-data-handler
        vm.setDocumentsView = setDocumentsView;

        activate();

        ////////////////

        function activate() {
            Logger.sendLog('Documents', 'all');
        }

        /**
         * @description Filters and displays the documents from the Documents service.
         */
        function setDocumentsView() {
            var documents = Documents.getDocuments();
            documents = Documents.setDocumentsLanguage(documents);

            if(documents.length > 0) vm.noDocuments=false;

            $timeout(function(){
                vm.documents = $filter('orderBy')(documents,'documents.CreatedTimeStamp');
            })
        }

        //Go to document function, if not read, read it, then set parameters for navigation
        function goToDocument(doc){

            if(doc.ReadStatus == '0')
            {
                Documents.readDocument(doc.DocumentSerNum);
                // Mark corresponding notifications as read
                Notifications.implicitlyMarkNotificationAsRead(
                    doc.DocumentSerNum,
                    ["Document", "UpdDocument"], //TODO: constants for UpdDocument, Document, and NewLabResult
                );
            }
            NavigatorParameters.setParameters({'navigatorName':'personalNavigator', 'Post':doc});
            personalNavigator.pushPage('./views/personal/documents/individual-document.html');
        }
    }
})();
