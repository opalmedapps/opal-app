//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp = angular.module('MUHCApp');
myApp.controller('DocumentsController', ['Patient', 'Documents', 'UpdateUI', '$scope', '$timeout',
    'UserPreferences', 'RequestToServer', '$cordovaFile','UserAuthorizationInfo',
    '$q','$filter','NavigatorParameters', 'Permissions', 'Logger',
    function(Patient, Documents, UpdateUI, $scope, $timeout, UserPreferences,
             RequestToServer,$cordovaFile,UserAuthorizationInfo,$q,$filter,
             NavigatorParameters, Permissions, Logger){

        Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'Storage access disabled. Unable to write documents.');

        documentsInit();

        Logger.sendLog('Documents', 'all');

        //Initialize documents, determine if there are documents, set language, determine if content has preview
        function documentsInit() {
            var documents = Documents.getDocuments();
            documents = Documents.setDocumentsLanguage(documents);
            if(documents.length === 0) $scope.noDocuments=true;
            //console.log(documents);
            $scope.documents = $filter('orderBy')(documents,'documents.CreatedTimeStamp');
            console.log($scope.documents);

        }
        //Go to document function, if not read, read it, then set parameters for navigation
        $scope.goToDocument=function(doc)
        {
            if(doc.ReadStatus == '0')
            {
                doc.ReadStatus ='1';
                Documents.readDocument(doc.DocumentSerNum);
            }
            NavigatorParameters.setParameters({'navigatorName':'personalNavigator', 'Post':doc});
            personalNavigator.pushPage('./views/personal/my-chart/individual-document.html');
        };
        //Function for document refresh, deprecated at the moment. Only refresh at home.
        $scope.refreshDocuments = function($done) {
            RequestToServer.sendRequest('Refresh', 'Documents');
            var UserData = UpdateUI.update('Documents');
            UserData.then(function(){
                documentsInit();
                $done();
            });
            $timeout(function() {
                $done();
            }, 5000);
        };

        //Show header function helper
        $scope.showHeader=function(index, length)
        {
            if (index === 0){
                return true;
            }
            else {
                var previous = (new Date($scope.documents[index-1].CreatedTimeStamp)).setHours(0,0,0,0);
                var current = (new Date($scope.documents[index].CreatedTimeStamp)).setHours(0,0,0,0);
                return (current !== previous);
            }
        };

    }]);

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
            console.log(document);

            if (Documents.getDocumentBySerNum(document.DocumentSerNum).Content){
                console.log("on device");
                setUpPDF(document);
            }

            else {
                Documents.downloadDocumentFromServer(document.DocumentSerNum).then(function () {
                    console.log("request to server");
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

                    console.log(window.innerHeight, window.innerWidth);

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
                    console.log(canvasElements);
                    var viewerScale = viewerSize / canvasElements[0].width * 0.95 * 100 + "%";
                    // var translateY = canvasElements[0].height*(1-viewerSize/canvasElements[0].width);
                    for (var i = 0; i != canvasElements.length; ++i) {
                        canvasElements[i].style.zoom = viewerScale;
                        canvasElements[i].onclick = function (event) {
                            console.log(event);
                            if (Constants.app) {
                                if (ons.platform.isAndroid()) {
                                    var docParams = new docParams();
                                    docParams.src = event.srcElement.toDataURL("docParams/png");
                                    cordova.InAppBrowser.open(docParams.src, '_blank', 'location=no,enableViewportScale=true');
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
                    $scope.$apply();
                });
        }

        function convertCanvasTodocParams(canvas) {
            var docParams = new docParams();
            docParams.src = canvas.toDataURL("docParams/png");
            docParams.width = viewerSize;
            docParams.height = 'auto';
            docParams.style.border = "1px solid black";
            // docParams.onclick = function () {
            //     if (Constants.app) {
            //         cordova.InAppBrowser.open(docParams.src, '_blank', 'location=no,enableViewportScale=true');
            //     } else{
            //         window.open(docParams.src, '_blank', 'location=no,enableViewportScale=true');
            //     }
            // }
            return docParams;
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
            //var viewport = page.getViewport(scale);

            //var rescale = viewerSize*0.95/(viewport.width);

            var scaledViewport = page.getViewport(scale);
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;
            //console.log(canvas);
            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: ctx,
                viewport: scaledViewport
            };

            return renderContext;
        }

        // function simply sets document for showing
        function setDocumentForShowing(document, url)
        {
            console.log(url);
            //Determine if its a pdf or an docParams for small window preview.
            if(document.DocumentType=='pdf')
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

        //Share function, detemines if its an app, sets the parameters for the email and formats depending on whether is a
        //base64 string or a simple attachment and depending on whether is an Android device or an iOS device
        $scope.share =function()
        {
            if (Constants.app) {

                var targetPath = FileManagerService.generatePath(docParams);
                console.log(docParams);
                FileManagerService.downloadFileIntoStorage("data:application/pdf;base64," + docParams.Content, targetPath).then(function()
                {
                    if (ons.platform.isAndroid()) {
                        NewsBanner.showCustomBanner($filter('translate')("DOCUMENT_DOWNLOADED"), '#0047f2', null, 3000);
                    }

                    FileManagerService.shareDocument(docParams.Title.replace(/ /g,"")+docParams.ApprovedTimeStamp.toDateString().replace(/ /g,"-"), targetPath);

                    console.log('success');

                }).catch(function(error)
                {
                    console.log('Unable to save document on device',error);
                    //Unable to save document on server
                });

            } else {
                console.log(docParams);
                window.open("data:application/pdf;base64," + docParams.Content);
            }
        };

        console.log(FileManagerService);


        //Open document function: Opens document depending on the format
        $scope.openDocument = function() {
            var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
            if (app) {
                if(ons.platform.isAndroid()){
                    //window.open('https://docs.google.com/viewer?url='+docParams.Content+'&embedded=true', '_blank', 'location=yes');
                    if(docParams.DocumentType=='pdf')
                    {
                        console.log(docParams.PathFileSystem);
                        $cordovaFileOpener2.open(
                            docParams.PathFileSystem,
                            'application/pdf'
                        ).then(function() {
                            // file opened successfully
                        }, function(err) {
                            console.log(err);
                            if(err.status == 9)
                            {
                                NativeNotification.showNotificationAlert($filter('translate')("NOPDFPROBLEM"));
                            }
                            console.log('boom');
                            // An error occurred. Show a message to the user
                        });
                    }else{
                        var ref = cordova.InAppBrowser.open(docParams.PathFileSystem, '_blank', 'EnableViewPortScale=yes');
                    }

                    //var ref = cordova.InAppBrowser.open(docParams.Content, '_system', 'location=yes');
                }else{
                    var ref = cordova.InAppBrowser.open("data:application/pdf;base64, " + docParams.Content, '_blank', 'EnableViewPortScale=yes');
                }
            } else {
                window.open("data:application/pdf;base64, " + docParams.Content);
            }
        };

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
