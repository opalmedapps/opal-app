//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('DocumentsController', DocumentsController);

    DocumentsController.$inject = ['Documents', '$filter', 'NavigatorParameters', 'Permissions', 'Logger'];

    /* @ngInject */
    function DocumentsController(Documents, $filter, NavigatorParameters, Permissions, Logger) {
        var vm = this;
        vm.title = 'DocumentsController';
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
            vm.documents = $filter('orderBy')(documents,'documents.CreatedTimeStamp');
        }

        //Go to document function, if not read, read it, then set parameters for navigation
        function goToDocument(doc){

            if(doc.ReadStatus == '0')
            {
                doc.ReadStatus ='1';
                Documents.readDocument(doc.DocumentSerNum);
            }
            NavigatorParameters.setParameters({'navigatorName':'personalNavigator', 'Post':doc});
            personalNavigator.pushPage('./views/personal/my-chart/individual-document.html');
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

/**
 * @name SingleDocumentController
 * @description Responsible for displaying, sharing and printing document
 */
myApp.controller('SingleDocumentController', ['NavigatorParameters','Documents', '$timeout', '$scope',
    '$cordovaEmailComposer','$cordovaFileOpener2','FileManagerService','Patient','NativeNotification',
    '$filter', 'Constants', 'NewsBanner', '$q', 'UserPreferences', 'Logger',
    function(NavigatorParameters, Documents, $timeout, $scope,$cordovaEmailComposer,$cordovaFileOpener2,
             FileManagerService,Patient,NativeNotification,$filter, Constants, NewsBanner, $q, UserPreferences, Logger) {

        //Obtain navigator parameters.
        var parameters = NavigatorParameters.getParameters();

        //PDF params
        var docParams = Documents.setDocumentsLanguage(parameters.Post);
        var pdfdoc, scale = 3, uint8pf;
        var viewerSize = window.innerWidth;
        //console.log(document.getElementById('topholder'));
        var containerEl = document.getElementById('holder');

        $scope.documentObject = docParams;
        $scope.rendering = true;
        $scope.loading = true;
        $scope.errorDownload = false;
        $scope.show = false;
        $scope.hide = false;

        //Log usage
        Logger.sendLog('Document', docParams.DocumentSerNum);

        //Create popover
        ons.createPopover('./views/personal/my-chart/popoverDocsInfo.html', {parentScope: $scope}).then(function (popover) {
            $scope.popoverDocsInfo = popover;
        });

        $scope.$on('$destroy', function () {
            console.log('on destroy');
            $scope.popoverDocsInfo.off('posthide');
            $scope.popoverDocsInfo.destroy();
        });


        initializeDocument(docParams);
        //Checks if document exists if it does not it downloads the document from the server

        function initializeDocument(document)
        {

            if (Documents.getDocumentBySerNum(document.DocumentSerNum).Content){
                setUpPDF(document);
            }

            else {
                Documents.downloadDocumentFromServer(document.DocumentSerNum).then(function () {
                    setUpPDF(document);
                }).catch(function (error) {
                    //Unable to get document from server
                    $scope.loading = false;
                    $scope.errorDownload = true;
                    console.log('Unable to get document from server', error);
                });
            }

        }

        function setUpPDF(document) {
            $scope.loading = false;
            uint8pf = FileManagerService.convertToUint8Array(document.Content);
            //pdfjsframe.contentWindow.PDFViewerApplication.open(uint8pf);

            PDFJS.getDocument(uint8pf)
                .then(function (_pdfDoc) {

                    var promises = [];

                    for (var num = 1; num <= _pdfDoc.numPages; num++) {
                        promises.push(renderPage(_pdfDoc, num, containerEl));
                    }
                    pdfdoc = _pdfDoc;

                    //$scope.rendering=true;
                    return $q.all(promises);
                })
                .then(function () {

                    var canvasElements = containerEl.getElementsByTagName("canvas");
                    var viewerScale = viewerSize / canvasElements[0].width * 0.95 * 100 + "%";
                    // var translateY = canvasElements[0].height*(1-viewerSize/canvasElements[0].width);
                    for (var i = 0; i != canvasElements.length; ++i) {
                        canvasElements[i].style.zoom = viewerScale;
                        canvasElements[i].onclick = function (event) {
                            if (Constants.app) {
                                if (ons.platform.isAndroid()) {
                                    convertCanvasToImage(event.srcElement);
                                } else {
                                    cordova.InAppBrowser.open("data:application/pdf;base64," + document.Content, '_blank', 'EnableViewPortScale=yes');
                                }
                            } else {
                                window.open("data:application/pdf;base64, " + document.Content, '_blank', 'location=no,enableViewportScale=true');
                            }
                        }
                    }

                    $scope.rendering = false;
                    $scope.loading = false;
                    $scope.show = true;
                    $timeout(function(){$scope.hide = true}, 5000);
                    $timeout(function(){$scope.show = false}, 6500);
                    $scope.$apply();
                });
        }

        function convertCanvasToImage(canvas) {
            var image = new Image();
            image.onload = function(){
                cordova.InAppBrowser.open(image.src, '_blank', 'location=no,enableViewportScale=true');
            };
            image.src = canvas.toDataURL("image/jpeg", 0.5);
        }


        function renderPage(pdfDoc, num, containerEl) {

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            // Using promise to fetch the page
            return pdfDoc.getPage(num).then(function (page) {

                var renderContext = draw(page, canvas, ctx);

                containerEl.appendChild(canvas);
                return page.render(renderContext);

            });
        }

        function draw(page, canvas, ctx) {

            var scaledViewport = page.getViewport(scale);
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            // Render PDF page into canvas context
            return {
                canvasContext: ctx,
                viewport: scaledViewport
            };
        }

        // function simply sets document for showing
        function setDocumentForShowing(document, url)
        {
            console.log(url);
            //Determine if its a pdf or an docParams for small window preview.
            if(document.DocumentType ==='pdf')
            {
                document.PreviewContent=(ons.platform.isIOS()&&app)?url.cdvUrl:'./img/pdf-icon.png';
            }else{
                if(app) document.PreviewContent=url.cdvUrl;
                else document.PreviewContent = document.Content;
            }
            if(app)
            {
                document.CDVfilePath = url.cdvUrl;
                document.PathFileSystem = url.urlPathFile;
                document.Content =  url.cdvUrl;
            }

            console.log(document);

            //Set the documentObject
            $timeout(function()
            {
                $scope.loading = false;
                $scope.documentObject = document;
            });

        }

        //Share function
        $scope.share =function()
        {
            if (Constants.app) {

                var targetPath = FileManagerService.generatePath(docParams);


                FileManagerService.downloadFileIntoStorage("data:application/pdf;base64," + docParams.Content, targetPath).then(function()
                {

                    FileManagerService.shareDocument(docParams.Title.replace(/ /g,"")+docParams.ApprovedTimeStamp.toDateString().replace(/ /g,"-"), targetPath);

                }).catch(function(error)
                {
                    //Unable to save document on server
                    console.log('Unable to save document on device',error);
                });

            } else {
                window.open("data:application/pdf;base64," + docParams.Content);
            }
        };

        $scope.warn = function(){
            modal.show();
            $scope.popoverDocsInfo.hide();
        };


        //Open document function: Opens document depending on the format
        // $scope.openDocument = function() {
        //     var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
        //     if (app) {
        //         if(ons.platform.isAndroid()){
        //             //window.open('https://docs.google.com/viewer?url='+docParams.Content+'&embedded=true', '_blank', 'location=yes');
        //             if(docParams.DocumentType=='pdf')
        //             {
        //                 console.log(docParams.PathFileSystem);
        //                 $cordovaFileOpener2.open(
        //                     docParams.PathFileSystem,
        //                     'application/pdf'
        //                 ).then(function() {
        //                     // file opened successfully
        //                 }, function(err) {
        //                     console.log(err);
        //                     if(err.status == 9)
        //                     {
        //                         NativeNotification.showNotificationAlert($filter('translate')("NOPDFPROBLEM"));
        //                     }
        //                     console.log('boom');
        //                     // An error occurred. Show a message to the user
        //                 });
        //             }else{
        //                 var ref = cordova.InAppBrowser.open(docParams.PathFileSystem, '_blank', 'EnableViewPortScale=yes');
        //             }
        //
        //             //var ref = cordova.InAppBrowser.open(docParams.Content, '_system', 'location=yes');
        //         }else{
        //             var ref = cordova.InAppBrowser.open("data:application/pdf;base64, " + docParams.Content, '_blank', 'EnableViewPortScale=yes');
        //         }
        //     } else {
        //         window.open("data:application/pdf;base64, " + docParams.Content);
        //     }
        // };

        $scope.about = function(){

            // Check if there is any about link
            var link = null;
            docParams.hasOwnProperty("URL_EN") ? link  = docParams["URL_"+UserPreferences.getLanguage()] : {} ;

            // Set the options to send to the content controller
            var contentOptions = {
                contentType: docParams.AliasName_EN,
                contentLink: link
            };

            console.log(contentOptions);
            personalNavigator.pushPage('./views/templates/content.html',contentOptions);
            $scope.popoverDocsInfo.hide();
        }
    }]);
