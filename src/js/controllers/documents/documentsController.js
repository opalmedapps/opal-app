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
                doc.ReadStatus ='1';
                Documents.readDocument(doc.DocumentSerNum);
                // Mark corresponding notification as read
                markNotificationAsRead(doc.DocumentSerNum);
            }
            NavigatorParameters.setParameters({'navigatorName':'personalNavigator', 'Post':doc});
            personalNavigator.pushPage('./views/personal/documents/individual-document.html');
        }

        /*********************************/
        /******* PRIVATE FUNCTIONS *******/
        /*********************************/

        /**
         * @name markNotificationAsRead
         * @desc Mark corresponding "Document" or "UpdDocument" notifications as read
         */
        function markNotificationAsRead(serNum) {
            const notifications = Notifications.getUserNotifications();
                if (Array.isArray(notifications) && notifications.length)
                {
                    notifications.forEach(
                        (notif, index) => {
                            if (notif.RefTableRowSerNum === serNum
                                && (notif.NotificationType === "Document" || notif.NotificationType === "UpdDocument"))  //TODO: constants for UpdDocument, Document, and NewLabResult
                                Notifications.readNotification(index, notif);
                        });
                }
        }
    }
})();
