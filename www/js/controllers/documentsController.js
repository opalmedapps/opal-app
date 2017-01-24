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
    '$filter', 'Constants', 'NewsBanner',
    function(NavigatorParameters, Documents, $timeout, $scope,$cordovaEmailComposer,$cordovaFileOpener2,
             FileManagerService,Patient,NativeNotification,$filter, Constants, NewsBanner) {

        //Obtain navigator parameters.
        var parameters = NavigatorParameters.getParameters();
        //var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

        var image = Documents.setDocumentsLanguage(parameters.Post);
        var pdfdoc, canvas, ctx, scale = 0.5, uint8pf;
        var content = "";
        //Get pdfviewer path

        $scope.viewerPath = "./lib/js/pdfjs-viewer/web/viewer.html";
        var pdfjsframe = document.getElementById('pdfViewer');

        $scope.documentObject = image;
        $scope.rendering = true;
        $scope.loading = true;
        $scope.errorDownload = false;
        initializeDocument(image);
        //Checks if document exists if it does not it downloads the document from the server

        function initializeDocument(document)
        {
            console.log(document);
            // if(app)
            // {
            //     FileManagerService.findPatientDocumentInDevice(document.DocumentType, document.DocumentSerNum).then(function(url)
            //     {
            //         setDocumentForShowing(document, url);
            //     }).catch(function(error)
            //     {
            //         console.log('File not found', error);
            Documents.downloadDocumentFromServer(document.DocumentSerNum).then(function(doc)
            {
                $scope.loading = false;
                content = doc.Content;
                uint8pf = FileManagerService.convertToUint8Array(content);
                pdfjsframe.contentWindow.PDFViewerApplication.open(uint8pf);

                // PDFJS.getDocument(uint8pf)
                //     .then(function (_pdfdoc) {
                //         pdfdoc = _pdfdoc;
                //         //$scope.rendering=true;
                //         return renderPage(_pdfdoc.numPages)
                //     })
                //     .then(function () {
                //         $scope.rendering = false;
                //         $scope.$apply();
                //     });

                /*var targetPath = FileManagerService.getFilePathForDocument(document);
                 console.log(targetPath);
                 doc = FileManagerService.setBase64Document(doc);

                 FileManagerService.downloadFileIntoStorage(doc.Content, targetPath).then(function()
                 {
                 setDocumentForShowing(document, FileManagerService.getDocumentUrls(document));
                 console.log('success');

                 }).catch(function(error)
                 {
                 console.log('Unable to save document on server',error);
                 //Unable to save document on server
                 });*/
            }).catch(function(error){
                //Unable to get document from server
                $scope.loading = false;
                $scope.errorDownload = true;
                console.log('Unable to get document from server',error);
            });
            // });
            // }else{
            //     Documents.downloadDocumentFromServer(document.DocumentSerNum).then(function(doc)
            //     {
            //         //console.log(doc);
            //         $scope.loading = false;
            //         var uint8pf = FileManagerService.convertToUint8Array(doc.Content);
            //         pdfjsframe.contentWindow.PDFViewerApplication.open(uint8pf);
            //         // PDFJS.getDocument(uint8pf)
            //         //     .then(function (_pdfdoc) {
            //         //         pdfdoc = _pdfdoc;
            //         //         renderPage(_pdfdoc.numPages);
            //         //         console.log(_pdfdoc.numPages);
            //         //
            //         //
            //         //         return pdfdoc.getPage(_pdfdoc.numPages).then(function (pdfPage) {
            //         //             var pdfPageView = new PDFJS.PDFPageView({
            //         //                 container: container,
            //         //                 id: _pdfdoc.numPages,
            //         //                 scale: scale,
            //         //                 defaultViewport: pdfdoc.getViewport(scale),
            //         //                 // We can enable text/annotations layers, if needed
            //         //                 textLayerFactory: new PDFJS.DefaultTextLayerFactory(),
            //         //                 annotationLayerFactory: new PDFJS.DefaultAnnotationLayerFactory()
            //         //             });
            //         //             // Associates the actual page with the view, and drawing it
            //         //             pdfPageView.setPdfPage(pdfdoc);
            //         //             return pdfPageView.draw();
            //         //         });
            //         //
            //         //     });
            //         // doc = FileManagerService.setBase64Document(doc);
            //         // document.Content = doc.Content;
            //         // setDocumentForShowing(document);
            //     }).catch(function(error){
            //         //unable to fetch document from server
            //         console.log(error);
            //     });
            // }

        }

        function renderPage() {
            canvas = document.getElementById("the-canvas");
            ctx = canvas.getContext("2d");

            // Using promise to fetch the page
            pdfdoc.getPage(1).then(function (page) {

                var viewport = page.getViewport(scale);
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                return page.render(renderContext);
                // Wait for rendering to finish
                // renderTask.promise.then(function () {
                //     pageRendering = false;
                //     if (pageNumPending !== null) {
                //         // New page rendering is pending
                //         renderPage(pageNumPending);
                //         pageNumPending = null;
                //     }
                // });

            });
        }

        $scope.openPDF = function () {
            NavigatorParameters.setParameters({pdfdata:uint8pf});
            personalNavigator.pushPage('./views/personal/my-chart/pdfview.html');
            // $scope.viewerPath = "./lib/bower_components/pdfjs-pdfviewer/web/pdfviewer.html";
            // var pdfjsframe = document.getElementById('pdfViewer');
            // $timeout(function () {
            //
            //     console.log(pdfjsframe);
            //     pdfjsframe.contentWindow.PDFViewerApplication.open(uint8pf);
            // },5000);
        };

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

        $timeout(function () {
            ons.createPopover('./views/education/popover-material-options.html',{parentScope: $scope}).then(function (popover) {
                $scope.popoverSharing = popover;
            });
        }, 300);

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


                // var attachment='';
                // var email = {
                //     to: '',
                //     cc: '',
                //     bcc: [],
                //     subject: 'MUHC Document',
                //     body: '',
                //     isHtml: true
                // };
                // var base64=image.Content.indexOf('cdvfile');
                // var data='';
                // if(base64==-1)
                // {
                //     console.log('Base64 file');
                //     attachment='base64:'+'attachment.'+image.DocumentType+'//'+image.Content.substring(image.Content.indexOf(',')+1,image.Content.length);
                //     console.log(attachment);
                //     email.attachments=[attachment];
                //     console.log(email);
                //     cordova.plugins.email.isAvailable(function(isAvailable){
                //         console.log('is available');
                //         if(isAvailable)
                //         {
                //             cordova.plugins.email.open(email,function(sent){
                //                 console.log('email ' + (sent ? 'sent' : 'cancelled'));
                //             },this);
                //         }else{
                //             console.log('is not available');
                //         }
                //     });
                // }else{
                //     console.log('cdvfile',image.Content );
                //     var attachmentFilePath = (ons.platform.isAndroid())?image.PathFileSystem:image.Content;
                //     window.resolveLocalFileSystemURL(attachmentFilePath,function(file){
                //         console.log(file);
                //         attachment=file.toURL();
                //         email.attachments=[attachment];
                //         console.log(email);
                //         cordova.plugins.email.isAvailable(function(isAvailable){
                //             if(isAvailable)
                //             {
                //                 cordova.plugins.email.open(email,function(sent){
                //                     console.log('email ' + (sent ? 'sent' : 'cancelled'));
                //                 },this);
                //
                //             }else{
                //                 console.log('is not available');
                //             }
                //         });
                //     },function(error){
                //         console.log(error);
                //     });
                // }
                // //var attachment='base64:'+'attachment.'+image.DocumentType+'//'+image.Content.substring(image.Content.indexOf(',')+1,image.Content.length);
            } else {
                window.open(image.Content);
            }
        };

        //Print document function, if its an image it puts it into an html tag and prints that html, if its a pdf, it simple prints the pdf
        // $scope.print=function()
        // {
        //     var options = {
        //         // type of content, use either 'Data' or 'File'
        //         title: 'Print Document', 	// title of document
        //         dialogX: -1,				// if a dialog coord is not set, it defaults to -1.
        //         dialogY: -1,
        //         success: function(arg){
        //             console.log(arg);
        //         },
        //         error: function(err){
        //             console.log(err);
        //         }
        //     };
        //     if(ons.platform.isAndroid())
        //     {
        //         if(image.DocumentType=='pdf')
        //         {
        //             options.type='File';
        //             options.data = image.CDVfilePath;
        //             console.log(options);
        //             window.plugins.PrintPDF.print(options);
        //         }else{
        //             FileManagerService.getFileUrl(image.PathFileSystem).then(function(file){
        //                     var page = "<img src='"+file+"' style='width:100%;height:auto'>";
        //                     page.replace(/"/g, '\'');
        //                     console.log(page);
        //                     cordova.plugins.printer.print(page, 'Document.html', function () {
        //                         //alert('Printing finished or canceled');
        //                     });
        //                 }
        //             );
        //         }
        //     }else{
        //         options.type='File';
        //         options.data = image.CDVfilePath;
        //         console.log(options);
        //         window.plugins.PrintPDF.print(options);
        //     }
        // };
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
                    var ref = cordova.InAppBrowser.open(image.Content, '_blank', 'EnableViewPortScale=yes');
                }
            } else {
                window.open(image.Content);
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
