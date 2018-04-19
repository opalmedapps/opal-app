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

    IndividualDocumentController.$inject = ['$scope', 'NavigatorParameters', 'Documents', '$timeout', 'FileManagerService', 'Constants', '$q', 'UserPreferences', 'Logger'];

    /* @ngInject */
    function IndividualDocumentController($scope, NavigatorParameters, Documents, $timeout, FileManagerService, Constants, $q, UserPreferences, Logger) {
        var vm = this;

        var parameters;
        var docParams;
        var uint8pf;
        var scale;
        var viewerSize;
        var containerEl;

        vm.loading = true;
        vm.errorDownload = false;
        vm.show = false;
        vm.hide = false;

        vm.share = share;
        vm.openPDF = openPDF;

        //$scope.share = share;
        $scope.about = about;
        $scope.warn = warn;
        $scope.warn2 = warn2;
        $scope.docParams = docParams;
        $scope.isAndroid = isAndroid;


        activate();

        /////////////////////////////

        function activate() {
            parameters = NavigatorParameters.getParameters();

            //PDF params
            docParams = Documents.setDocumentsLanguage(parameters.Post);
            $scope.docParams = docParams;

            viewerSize = window.innerWidth;
            containerEl = document.getElementById('holder');
            scale = 3;

            vm.doc_title = docParams.Title;

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

        function initializeDocument(document) {
            if (Documents.getDocumentBySerNum(document.DocumentSerNum).Content) {
                setUpPDF(document);
            } else {
                Documents.downloadDocumentFromServer(document.DocumentSerNum).then(function () {
                    setUpPDF(document);
                }).catch(function (error) {
                    //Unable to get document from server
                    vm.loading = false;
                    vm.errorDownload = true;
                });
            }
        }

        function openPDF() {
            if (Constants.app) {
                if (ons.platform.isAndroid()) {
                    var targetPath = FileManagerService.generatePath(docParams);


                    FileManagerService.downloadFileIntoStorage("data:application/pdf;base64," + docParams.Content, targetPath).then(function () {

                        window.cordova.plugins.FileOpener.canOpenFile(targetPath, function (data2) {
                            // at this point it means data2.canBeOpen = true. A PDF Viewer "is" indeed available to show the document

                            var onSuccess = function (data) {
                                // file opened successfully by Default PDF Viewer on Android. Nothing else to do at this point
                                console.log('file opened successfully by Default PDF Viewer on Android. Nothing else to do at this point');

                                // Now add the filenames to an array to be deleted OnExit of the app (CleanUp.Clear())
                                var path = FileManagerService.getPathToDocuments();
                                var docName = FileManagerService.generateDocumentName(docParams);
                                console.log('+ + + + + + + + + + + + path: ',path);
                                console.log('+ + + + + + + + + + + + docName: ',docName);

                                var filesToDelete = [];   // declare this Globally somewhere else

                                filesToDelete.push({path: path, docName: docName});    // add file info to the array


                                for (var i = 0; i < filesToDelete.length; i++) {
                                    console.log('+ + + + + + + + + + + + fileToDelete: ',filesToDelete.path, ' ==> ',filesToDelete.docName);
                                }
                                //////////////////////////////////////////////////////
                                
                            };

                            function onError(error) {
                                // Unexpected Error occurred. For some reason, file could not be opened and viewed, although canOpenFile function returned (data2.canBeOpen = true)
                                console.log('openPDF (FileOpener.openFile) Error: ' + error.status + ' - Error message: ' + error.message);
                                ons.notification.alert({message: $filter('translate')('UNABLETOOPEN')});
                            }

                            window.cordova.plugins.FileOpener.openFile(targetPath, onSuccess, onError);


                        }, function (error) {   // at this point it means data2.canBeOpen = false. A PDF Viewer is NOT available to show the document
                            ons.notification.alert({message: $filter('translate')('UNABLETOOPEN')});
                            console.log('canOpen 3 Error (A PDF Viewer is NOT available to show the document): ' + error.status + ' - Error message: ' + error.message);
                        });


                        // This is to delete a file after downloading and viewing it.
                        // This code is supposed to be in fileManagerService, but for some reason it did not work there
                        /*
                        $timeout(function () {

                            var path = FileManagerService.getPathToDocuments();
                            var docName = FileManagerService.generateDocumentName(docParams);

                            window.resolveLocalFileSystemURL(path, function (dir) {
                                dir.getFile(docName, {create: false}, function (fileEntry) {
                                    fileEntry.remove(function () {
                                        // The file has been removed successfully
                                        console.log('> > > > > > > > The file has been removed successfully.');
                                    }, function (error) {
                                        // Error deleting the file
                                        console.log('> > > > > > > > Error deleting the file. ');
                                    }, function () {
                                        // The file doesn't exist
                                        console.log('> > > > > > > > The file does not exist. ');
                                    });
                                });
                            });
                        });
                        */
                        ////////////////////////////////////////////////////////////////////////

                    }).catch(function (error) {
                        //Unable to save document on server
                        console.log('Error saving/downloading document from Server downloadFileIntoStorage(): ' + error.status + ' - Error message: ' + error.message);

                    });

                } else {
                    cordova.InAppBrowser.open("data:application/pdf;base64," + docParams.Content, '_blank', 'EnableViewPortScale=yes');
                }
            } else {
                window.open("data:application/pdf;base64, " + docParams.Content, '_blank', 'location=no,enableViewportScale=true');
            }
            vm.loading = false;
        }

        function setUpPDF(document) {
            uint8pf = FileManagerService.convertToUint8Array(document.Content);

            PDFJS.getDocument(uint8pf)
                .then(function (_pdfDoc) {
                    uint8pf = null;

                    var promises = [];
                    for (var num = 1; num <= _pdfDoc.numPages; num++) {
                        promises.push(renderPage(_pdfDoc, num, containerEl));
                    }
                    return $q.all(promises);
                })
                .then(function () {

                    var canvasElements = containerEl.getElementsByTagName("canvas");
                    var viewerScale = viewerSize / canvasElements[0].width * 0.95 * 100 + "%";
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

                    vm.loading = false;
                    vm.show = true;
                    $timeout(function () {
                        vm.hide = true
                    }, 5000);
                    $timeout(function () {
                        vm.show = false
                    }, 6500);
                    $scope.$apply();
                });
        }

        function convertCanvasToImage(canvas) {
            var image = new Image();

            image.onload = function () {
                var ref = cordova.InAppBrowser.open(image.src, '_blank', 'location=no,enableViewportScale=true', 'clearcache=yes');
                ref.addEventListener('loadstop', function () {
                    image = null;
                });
            };

            image.src = canvas.toDataURL("image/jpeg", 0.1);
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


        //Share function
        function share() {

            if (Constants.app) {
                var targetPath = FileManagerService.generatePath(docParams);
                FileManagerService.downloadFileIntoStorage("data:application/pdf;base64," + docParams.Content, targetPath).then(function () {
                    FileManagerService.shareDocument(docParams.Title.replace(/ /g, "") + docParams.ApprovedTimeStamp.toDateString().replace(/ /g, "-"), targetPath);
                }).catch(function (error) {
                    //Unable to save document on server

                });

            } else {
                window.open("data:application/pdf;base64," + docParams.Content);
            }
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

            // Check if there is any about link
            var link = null;
            docParams.hasOwnProperty("URL_EN") ? link = docParams["URL_" + UserPreferences.getLanguage()] : {};

            // Set the options to send to the content controller
            var contentOptions = {
                contentType: docParams.AliasName_EN,
                contentLink: link
            };

            personalNavigator.pushPage('./views/templates/content.html', contentOptions);
            $scope.popoverDocsInfo.hide();
        }
    }
})();