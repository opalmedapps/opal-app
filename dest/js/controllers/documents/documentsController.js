//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('DocumentsController', DocumentsController);

    DocumentsController.$inject = ['Documents', '$filter', 'NavigatorParameters', 'Permissions', 'Logger', '$timeout'];

    /* @ngInject */
    function DocumentsController(Documents, $filter, NavigatorParameters, Permissions, Logger, $timeout) {
        var vm = this;
        vm.noDocuments = true;
        vm.documents = [];

        vm.goToDocument = goToDocument;
        vm.showHeader = showHeader;

        activate();

        ////////////////

        function activate() {

            // Check for document permission
            Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'Storage access disabled. Unable to write documents.');
            Logger.sendLog('Documents', 'all');

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
            }
            NavigatorParameters.setParameters({'navigatorName':'personalNavigator', 'Post':doc});
            personalNavigator.pushPage('./views/personal/documents/individual-document.html');
        }

        // Determines whether or not to show the date header.
        function showHeader(index)
        {
            if (index === 0){
                return true;
            }
            else {
                var previous = (new Date(vm.documents[index-1].CreatedTimeStamp)).setHours(0,0,0,0);
                var current = (new Date(vm.documents[index].CreatedTimeStamp)).setHours(0,0,0,0);
                return (current !== previous);
            }
        }

    }

})();

