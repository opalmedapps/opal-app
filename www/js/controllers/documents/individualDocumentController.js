/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 12:46 PM
 */

/**
 * @name SingleDocumentController
 * @description Responsible for displaying, sharing and printing document
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualDocumentController', IndividualDocumentController);

    IndividualDocumentController.$inject = ['$scope', 'NavigatorParameters','Documents', '$timeout', 'FileManagerService', 'Constants', '$q', 'UserPreferences', 'Logger'];

    /* @ngInject */
    function IndividualDocumentController($scope, NavigatorParameters, Documents, $timeout, FileManagerService, Constants, $q, UserPreferences, Logger) {
        var vm = this;

        var parameters;
        var docParams;
        var pdfdoc;
        var uint8pf;
        var scale;
        var viewerSize;
        var containerEl;

        vm.rendering = true;
        vm.loading = true;
        vm.errorDownload = false;
        vm.show = false;
        vm.hide = false;

        vm.share = share;
        vm.about = about;
        vm.warn = warn;

        activate();
        /////////////////////////////

        function activate() {
            parameters = NavigatorParameters.getParameters();

            //PDF params
            docParams = Documents.setDocumentsLanguage(parameters.Post);
            pdfdoc = 3;
            scale = uint8pf;
            viewerSize = window.innerWidth;
            containerEl = document.getElementById('holder');

            vm.documentObject = docParams;

            //Log usage
            Logger.sendLog('Document', docParams.DocumentSerNum);

            //Create popover
            ons.createPopover('./views/personal/documents/info-popover.html', {parentScope: $scope}).then(function (popover) {
                $scope.popoverDocsInfo = popover;
            });

            $scope.$on('$destroy', function () {

                $scope.popoverDocsInfo.off('posthide');
                $scope.popoverDocsInfo.destroy();
            });


            initializeDocument(docParams);
        }

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
                    vm.loading = false;
                    vm.errorDownload = true;

                });
            }

        }

        function setUpPDF(document) {
            vm.loading = false;
            uint8pf = FileManagerService.convertToUint8Array(document.Content);

            PDFJS.getDocument(uint8pf)
                .then(function (_pdfDoc) {

                    var promises = [];

                    for (var num = 1; num <= _pdfDoc.numPages; num++) {
                        promises.push(renderPage(_pdfDoc, num, containerEl));
                    }
                    pdfdoc = _pdfDoc;

                    //vm.rendering=true;
                    return $q.all(promises);
                })
                .then(function () {

                    var canvasElements = containerEl.getElementsByTagName("canvas");
                    var viewerScale = viewerSize / canvasElements[0].width * 0.95 * 100 + "%";
                    // var translateY = canvasElements[0].height*(1-viewerSize/canvasElements[0].width);
                    for (var i = 0; i !== canvasElements.length; ++i) {
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

                    vm.rendering = false;
                    vm.loading = false;
                    vm.show = true;
                    $timeout(function(){vm.hide = true}, 5000);
                    $timeout(function(){vm.show = false}, 6500);
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

            //Set the documentObject
            $timeout(function()
            {
                vm.loading = false;
                vm.documentObject = document;
            });

        }

        //Share function
        function share()
        {
            if (Constants.app) {

                var targetPath = FileManagerService.generatePath(docParams);


                FileManagerService.downloadFileIntoStorage("data:application/pdf;base64," + docParams.Content, targetPath).then(function()
                {

                    FileManagerService.shareDocument(docParams.Title.replace(/ /g,"")+docParams.ApprovedTimeStamp.toDateString().replace(/ /g,"-"), targetPath);

                }).catch(function(error)
                {
                    //Unable to save document on server

                });

            } else {
                window.open("data:application/pdf;base64," + docParams.Content);
            }
        }

        function warn(){
            modal.show();
            vm.popoverDocsInfo.hide();
        }

        function about(){

            // Check if there is any about link
            var link = null;
            docParams.hasOwnProperty("URL_EN") ? link  = docParams["URL_"+UserPreferences.getLanguage()] : {} ;

            // Set the options to send to the content controller
            var contentOptions = {
                contentType: docParams.AliasName_EN,
                contentLink: link
            };

            personalNavigator.pushPage('./views/templates/content.html',contentOptions);
            vm.popoverDocsInfo.hide();
        }
    }
})();
