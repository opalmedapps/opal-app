(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("videoTagByFormat", VideoTagByFormat);

    VideoTagByFormat.$inject = ['FileManagerService'];

    /**
     * @name VideoTagByFormat
     * @author Shifeng Chen
     * @date 2022-03-17
     * @desc This directive use <iframe> or <video> tag depends on the different video format.
     * @example <video-tag-by-format></video-tag-by-format>
     */
    function VideoTagByFormat(FileManagerService) {
        var directive = {
            restrict: 'E',
            scope: {
                "edumaterialUrl": "@",
                "errorMessage": "@",
            },
            template: `
                    <div align="center" class="embed-responsive embed-responsive-16by9">

                        <!-- video url for 'youtube' and 'vimeo' -->
                        <iframe class="embed-responsive-item" ng-show="iframeTag" ng-src="{{edumaterialUrl|trustThisUrl}}" allowfullscreen="allowfullscreen" mozallowfullscreen="mozallowfullscreen" msallowfullscreen="msallowfullscreen" oallowfullscreen="oallowfullscreen" webkitallowfullscreen="webkitallowfullscreen">
                        </iframe>

                        <!-- video format for 'mp4', 'ogv' and 'webm' -->
                        <video controls ng-show="videoTag" autoplay preload="metadata">
                            <source ng-src="{{edumaterialUrl|trustThisUrl}}" type="video/{{fileExt}}">
                        </video>

                        <!-- ERROR MESSAGE -->
                        <div ng-show="showError" align="center" style="width: 95%; margin: 10px auto" ng-class="fontSizeDesc">
                            <uib-alert type="{{errorAlertType}}">{{errorMessage}}</uib-alert>
                        </div>
                    </div>
            `,
            link: checkVideoFormat,
        };
        return directive;

        /**
          * This function check the video url (youtube or vimeo link) and format (other link with mp4, ogv and webm file extention)
          */
        function checkVideoFormat(scope, element, attrs) {
            scope.iframeTag = false;
            scope.videoTag = false;
            scope.showError = false;
            console.log('----1-----'+scope.edumaterialUrl);
            scope.$watch('edumaterialUrl', function () {
                try {
                    // get the material's file extension
                    scope.fileExt = FileManagerService.getFileExtension(scope.edumaterialUrl);

                    console.log('----2-----'+scope.fileExt);

                    if ((scope.edumaterialUrl.indexOf('youtube') !== -1) || (scope.edumaterialUrl.indexOf('vimeo') !== -1)) {
                        scope.iframeTag = true;
                        console.log('----3-----'+scope.iframeTag);
                    }
                    else if (['mp4', 'ogv', 'webm'].indexOf(scope.fileExt) !== -1) {
                        scope.videoTag = true;
                        console.log('----4-----'+scope.videoTag);
                    }
                    else {
                        scope.showError = true;
                    }
                }
                catch (error) {
                    scope.showError = true;
                    console.error(error);
                }
            });
        }
    }
})();
