(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .directive('pdfViewer', pdfViewer);

    pdfViewer.$inject = ['$timeout', '$q', 'Browser', 'Constants', 'FileManagerService'];

    function pdfViewer($timeout, $q, Browser, Constants, FileManagerService) {

        let directive = {
            restrict: 'E',
            scope: {
                // The pdf document to display. Should eventually load a "Content" attribute (asynchronously) with the pdf contents.
                "pdfDocument": "=",
                "loadingMessage": "@",
                "errorMessage": "@",
            },
            template: `<div>
                           <!-- LOADING WHEEL -->
                           <loading-spinning-circle
                                   ng-show="loadingPDF"
                                   loading-message="{{loadingMessage}}">
                           </loading-spinning-circle>
                           
                           <!-- ERROR MESSAGE -->
                           <div ng-show="errorDownload">
                               <p class="lucent">{{errorMessage}}</p>
                           </div>
                           
                           <!-- ZOOM INSTRUCTIONS POPUP -->
                           <div class="popup">
                               <span class="popuptext"
                                     ng-class="{'popup-show' : showZoomPopup, 'popup-hide': hideZoomPopup}">{{"TAPTOZOOM"|translate}}
                               </span>
                           </div>
                           
                           <!-- EMBEDDED PDF -->
                           <div id="pdf-container" ng-hide="loadingPDF" align="center"></div>
                       </div>`,

            link: function (scope) {

                scope.loadingPDF = true;
                scope.errorDownload = false;
                scope.showZoomPopup = false;
                scope.hideZoomPopup = false;

                let uint8pf;
                let viewerSize = window.innerWidth;
                let containerEl = document.getElementById('pdf-container');
                let scale = 3;

                // Watch for changes in the "Content" attribute to initialize the pdf when it's ready
                scope.$watch('pdfDocument.Content', function() {
                    try {
                        setUpPDF(scope.pdfDocument);
                    }
                    catch(error) {
                        scope.loadingPDF = false;
                        scope.errorDownload = true;
                        console.log(JSON.stringify(error));
                        console.log(error);
                        console.trace();
                    }
                });

                function setUpPDF() {
                    // If the pdf content isn't ready yet, skip setting up now and wait until it's ready
                    if (!scope.pdfDocument.hasOwnProperty("Content") || !scope.pdfDocument.Content) return;

                    let document = scope.pdfDocument;
                    uint8pf = FileManagerService.convertToUint8Array(document.Content);

                    PDFJS.getDocument(uint8pf).then(function (_pdfDoc) {
                        uint8pf = null;

                        let promises = [];
                        for (let num = 1; num <= _pdfDoc.numPages; num++) {
                            promises.push(renderPage(_pdfDoc, num, containerEl));
                        }
                        return $q.all(promises);
                    })
                    .then(function () {

                        let canvasElements = containerEl.getElementsByTagName("canvas");
                        let viewerScale = viewerSize / canvasElements[0].width * 0.95 * 100 + "%";
                        for (let i = 0; i !== canvasElements.length; ++i) {

                            canvasElements[i].style.zoom = viewerScale;

                            canvasElements[i].onclick = function (event) {
                                Constants.app && ons.platform.isAndroid()
                                    ? convertCanvasToImage(event.srcElement)
                                    : Browser.openInternal("data:application/pdf;base64," + document.Content, true);
                            }
                        }

                        scope.loadingPDF = false;
                        scope.showZoomPopup = true;
                        $timeout(function () {
                            scope.hideZoomPopup = true
                        }, 5000);
                        $timeout(function () {
                            scope.showZoomPopup = false
                        }, 6500);
                        scope.$apply();
                    });
                }

                function convertCanvasToImage(canvas) {
                    let image = new Image();

                    image.onload = function () {
                        let browser = Browser.openInternal(image.src, true, "clearCache=yes");
                        if (browser) browser.addEventListener('loadstop', function () {
                            image = null;
                        });
                    };

                    image.src = canvas.toDataURL("image/jpeg", 0.1);
                }

                function renderPage(pdfDoc, num, containerEl) {

                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');

                    // Using promise to fetch the page
                    return pdfDoc.getPage(num).then(function (page) {
                        let renderContext = draw(page, canvas, ctx);
                        containerEl.appendChild(canvas);
                        return page.render(renderContext);
                    });
                }

                function draw(page, canvas, ctx) {

                    let scaledViewport = page.getViewport(scale);
                    canvas.height = scaledViewport.height;
                    canvas.width = scaledViewport.width;

                    // Render PDF page into canvas context
                    return {
                        canvasContext: ctx,
                        viewport: scaledViewport
                    };
                }
            }
        };
        return directive;
    }
})();
