// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive("videoTagByFormat", VideoTagByFormat);

    VideoTagByFormat.$inject = ['FileManagerService', 'Params'];

    /**
     * @name VideoTagByFormat
     * @author Shifeng Chen
     * @date 2022-03-17
     * @desc This directive use <iframe> or <video> tag depends on the different video format.
     * @example <video-tag-by-format></video-tag-by-format>
     */
    function VideoTagByFormat(FileManagerService, Params) {
        var directive = {
            restrict: 'E',
            scope: {
                "edumaterialUrl": "@",
                "errorMessage": "@",
            },
            template: `
                        <!-- video url for 'youtube' and 'vimeo' -->
                        <iframe id="opal-video-iframe" class="embed-responsive-item" ng-if="iframeTag" ng-src="{{edumaterialUrl|trustThisUrl}}" allowfullscreen="allowfullscreen" mozallowfullscreen="mozallowfullscreen" msallowfullscreen="msallowfullscreen" oallowfullscreen="oallowfullscreen" webkitallowfullscreen="webkitallowfullscreen">
                        </iframe>

                        <!-- video format for 'mp4', 'ogv' and 'webm' -->
                        <video controls ng-if="videoTag" preload="metadata">
                            <source ng-src="{{formatedUrl|trustThisUrl}}" type="video/{{fileExt}}">
                        </video>

                        <!-- ERROR MESSAGE -->
                        <div ng-if="showError" align="center" style="width: 95%; margin: 10px auto" ng-class="fontSizeDesc">
                            <uib-alert type="{{errorAlertType}}">{{errorMessage}}</uib-alert>
                        </div>
            `,
            link: checkVideoFormat,
        };
        return directive;

        /**
          * This function check the video url (youtube or vimeo link) and format (other link with mp4, ogv and webm file extention)
          *
          * Some notes of one possible idea about video tag attribute "autopalay"
          *     - Video tag with or without autoplay depending on the device.
          *     - For iPhones it is set to autoplay so the poster image automatically appears on initial load.
          *     - iPhones will prevent the video from auto playing, but the poster image appears as the result.
          */
        function checkVideoFormat(scope, element, attrs) {
            // inialize each division's switch variable
            scope.iframeTag = false;
            scope.videoTag = false;
            scope.showError = false;

            // get error alert type
            scope.errorAlertType = Params.alertTypeDanger;

            // get the material's file extension
            scope.fileExt = FileManagerService.getFileExtension(scope.edumaterialUrl);

            // a new url is just for iphone device to get the poster when time is loading at 0.05s
            scope.formatedUrl = scope.edumaterialUrl;

            try {

                if ((scope.edumaterialUrl.indexOf('youtube') !== -1) || (scope.edumaterialUrl.indexOf('vimeo') !== -1)) {
                    scope.iframeTag = true;
                }
                else if (['mp4', 'ogv', 'webm'].indexOf(scope.fileExt.toLowerCase()) !== -1) {
                    scope.videoTag = true;
                    /**
                    *  Modify the video url when using iPhone deice to show the poster at a specific time frame.
                    */
                    if(ons.platform.isIOS()){
                        scope.formatedUrl = scope.formatedUrl + "#t=0.05";
                    }

                }
                else {
                    scope.showError = true;
                }
            }
            catch (error) {
                scope.showError = true;
                console.error(error);
            }
        }
    }
})();
