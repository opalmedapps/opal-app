// SPDX-FileCopyrightText: Copyright (C) 2021 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @description Provides a container that renders and displays a pdf from base64 data.
 * @author Originally written by Robert Maglieri, Jan 2017 (documentsController.js).
 *         Refactored by James Brace, Sept 2017 (individualDocumentController.js).
 *         Refactored as a directive by Stacey Beard, Aug 2021 (pdf-viewer.directive.js).
 */
// See: https://github.com/mozilla/pdf.js/tree/master/examples/webpack
import * as pdfjsLib from '../../lib/pdfjs_legacy_webpack.mjs';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('pdfViewer', pdfViewer);

    pdfViewer.$inject = ['$timeout', '$q', 'Browser', 'Constants', 'FileManagerService', 'Params'];

    function pdfViewer($timeout, $q, Browser, Constants, FileManagerService, Params) {

        let directive = {
            restrict: 'E',
            scope: {
                // The pdf document to display (in base64); should eventually load (asynchronously) with the pdf contents
                // Expects the raw base64 data, not preceded by "data:application/pdf;base64,"
                "pdfContent": "=",

                // Variable indicating that an error has occurred and that an error message should be displayed
                "showError": "=",

                // Translated messages to display while loading and on error
                "loadingMessage": "@",
                "errorMessage": "@",

                // Optional parameter to override the loading circle's top margin
                "loadingMarginTop": "@",
            },
            template: `<div>
                           <!-- LOADING WHEEL -->
                           <loading-spinning-circle
                                   ng-show="loadingPDF && !showError"
                                   loading-message="{{loadingMessage}}"
                                   margintop="{{loadingMarginTop}}"
                           ></loading-spinning-circle>

                           <!-- ERROR MESSAGE -->
                           <div ng-show="showError" align="center" style="width: 95%; margin: 10px auto" ng-class="fontSizeDesc">
                               <uib-alert type="{{errorAlertType}}">{{errorMessage}}</uib-alert>
                           </div>

                           <!-- ZOOM INSTRUCTIONS POPUP -->
                           <div class="popup">
                               <span class="popuptext" ng-class="{'popup-show' : showZoomPopup, 'popup-hide': hideZoomPopup}">
                                   {{"TAPTOZOOM"|translate}}
                               </span>
                           </div>

                           <!-- EMBEDDED PDF -->
                           <div id="pdf-container" ng-hide="loadingPDF" align="center"></div>
                       </div>`,

            link: function (scope) {

                scope.loadingPDF = true;
                scope.showZoomPopup = false;
                scope.hideZoomPopup = false;
                scope.errorAlertType = Params.alertTypeDanger;

                let uint8pf;
                let viewerSize = window.innerWidth;
                let containerEl = document.getElementById('pdf-container');
                let scale = 3;

                // Watch for changes in the pdf content attribute to initialize the pdf when it's ready
                scope.$watch('pdfContent', function() {
                    try {
                        setUpPDF(scope.pdfContent);
                    }
                    catch(error) {
                        scope.loadingPDF = false;
                        scope.showError = true;
                        console.error(error);
                    }
                });

                function setUpPDF() {
                    // If the pdf content isn't ready yet, skip setting up now and wait until it's ready
                    if (!scope.pdfContent) return;

                    uint8pf = FileManagerService.convertToUint8Array(scope.pdfContent);

                    pdfjsLib.getDocument(uint8pf).promise.then(function (_pdfDoc) {
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
                                    : Browser.openInternal("data:application/pdf;base64," + scope.pdfContent, true);
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

                    let scaledViewport = page.getViewport({ scale: scale });
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
