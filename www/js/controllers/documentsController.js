//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp = angular.module('MUHCApp');
myApp.controller('DocumentsController', ['Patient', 'Documents', 'UpdateUI', '$scope', '$timeout',
    'UserPreferences', 'RequestToServer', '$cordovaFile','UserAuthorizationInfo',
    '$q','$filter','NavigatorParameters', 'Permissions',
    function(Patient, Documents, UpdateUI, $scope, $timeout, UserPreferences,
             RequestToServer,$cordovaFile,UserAuthorizationInfo,$q,$filter,
             NavigatorParameters, Permissions){

        Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'Storage access disabled. Unable to write documents.');

        documentsInit();

        //Initialize documents, determine if there are documents, set language, determine if content has preview
        function documentsInit() {
            var documents = Documents.getDocuments();
            documents = Documents.setDocumentsLanguage(documents);
            if(documents.length === 0) $scope.noDocuments=true;
            //console.log(documents);
            $scope.documents = $filter('orderBy')(documents,'documents.DateAdded');
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
                var previous = (new Date($scope.documents[index-1].DateAdded)).setHours(0,0,0,0);
                var current = (new Date($scope.documents[index].DateAdded)).setHours(0,0,0,0);
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
    '$filter', 'Constants', 'NewsBanner', '$q',
    function(NavigatorParameters, Documents, $timeout, $scope,$cordovaEmailComposer,$cordovaFileOpener2,
             FileManagerService,Patient,NativeNotification,$filter, Constants, NewsBanner, $q) {

        //Obtain navigator parameters.
        var parameters = NavigatorParameters.getParameters();

        //PDF params
        var image = Documents.setDocumentsLanguage(parameters.Post);
        var pdfdoc, scale = 3, uint8pf;
        var viewerSize = window.innerWidth;
        var content = "";
        //console.log(document.getElementById('topholder'));
        var containerEl = document.getElementById('holder');
        console.log(containerEl);
        $scope.viewerPath = "./lib/js/pdfjs-viewer/web/viewer.html";

        //var pdfjsframe = document.getElementById('pdfViewer');

        $scope.documentObject = image;
        $scope.rendering = true;
        $scope.loading = true;
        $scope.errorDownload = false;
        initializeDocument(image);
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
                                    var image = new Image();
                                    image.src = event.srcElement.toDataURL("image/png");
                                    cordova.InAppBrowser.open(image.src, '_blank', 'location=no,enableViewportScale=true');
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

        function convertCanvasToImage(canvas) {
            var image = new Image();
            image.src = canvas.toDataURL("image/png");
            image.width = viewerSize;
            image.height = 'auto';
            image.style.border = "1px solid black";
            // image.onclick = function () {
            //     if (Constants.app) {
            //         cordova.InAppBrowser.open(image.src, '_blank', 'location=no,enableViewportScale=true');
            //     } else{
            //         window.open(image.src, '_blank', 'location=no,enableViewportScale=true');
            //     }
            // }
            return image;
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
            //Determine if its a pdf or an image for small window preview.
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

        // $timeout(function () {
        //     ons.createPopover('./views/education/popover-material-options.html',{parentScope: $scope}).then(function (popover) {
        //         $scope.popoverSharing = popover;
        //     });
        // }, 300);

        //Share via email function, detemines if its an app, sets the parameters for the email and formats depending on whether is a
        //base64 string or a simple attachment and depending on whether is an Android device or an iOS device
        $scope.share =function()
        {
            if (Constants.app) {

                var targetPath = FileManagerService.generatePath(image);
                FileManagerService.downloadFileIntoStorage("data:application/pdf;base64," + content, targetPath).then(function()
                {
                    if (ons.platform.isAndroid()){
                        NewsBanner.showCustomBanner($filter('translate')("DOCUMENT_DOWNLOADED"),'#0047f2', null, 3000);
                    }
                    if (ons.platform.isIOS()){
                        FileManagerService.shareDocument(image.Title.replace(/ /g,"")+image.ApprovedTimeStamp.toDateString().replace(/ /g,"-"), targetPath);
                    }
                    console.log('success');

                }).catch(function(error)
                {
                    console.log('Unable to save document on device',error);
                    //Unable to save document on server
                });

            } else {
                window.open(image.Content);
            }
        };

        console.log(FileManagerService);


        //Open document function: Opens document depending on the format
        $scope.openDocument = function() {
            var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
            if (app) {
                if(ons.platform.isAndroid()){
                    //window.open('https://docs.google.com/viewer?url='+image.Content+'&embedded=true', '_blank', 'location=yes');
                    if(image.DocumentType=='pdf')
                    {
                        console.log(image.PathFileSystem);
                        $cordovaFileOpener2.open(
                            image.PathFileSystem,
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
                        var ref = cordova.InAppBrowser.open(image.PathFileSystem, '_blank', 'EnableViewPortScale=yes');
                    }

                    //var ref = cordova.InAppBrowser.open(image.Content, '_system', 'location=yes');
                }else{
                    var ref = cordova.InAppBrowser.open("data:application/pdf;base64, " + image.Content, '_blank', 'EnableViewPortScale=yes');
                }
            } else {
                window.open("data:application/pdf;base64, " + image.Content);
            }
        };




        $scope.goToEducationalMaterial = function () {
            // Need to provide
            EducationalMaterial.openEducationalMaterialDetails($scope.edumaterial);
        };
        /*var gesturableImg = new ImgTouchCanvas({
         canvas: document.getElementById('mycanvas2'),
         path: "./img/D-RC_ODC_16June2015_en_FNL.png"
         });*/
    }]);

myApp.controller('pdfViewController', ['NavigatorParameters','$scope', '$timeout',
    function(NavigatorParameters,$scope, $timeout) {
        var parameters = NavigatorParameters.getParameters();
        console.log(parameters);
        $scope.viewerPath = "./lib/js/pdfjs-viewer/web/viewer.html";
        $timeout(function () {
            var pdfjsframe = document.getElementById('pdfViewer');
            console.log(pdfjsframe);
            pdfjsframe.contentWindow.PDFViewerApplication.open(parameters.pdfdata);
        },500);

    }]);
