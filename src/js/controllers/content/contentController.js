/*
 * Filename     :   contentController.js
 * Description  :   Manages the dynamic content grabbed from the external server. It can take a content link as input.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('ContentController', ContentController);

    ContentController.$inject = ['DynamicContent', 'Navigator', 'Logger', 'Params', '$timeout'];

    /* @ngInject */
    function ContentController(DynamicContent, Navigator, Logger, Params, $timeout) {
        var vm = this;
        vm.pageContent = {};
        vm.loading = true;
        vm.alert = undefined;

        activate();

        ////////////////

        // Uses the content pushed from a pushPage. See details in Opal wiki for use.
        function activate() {
            let parameters = Navigator.getParameters();

            let link = parameters.contentLink;
            let contentType = parameters.contentType;

            vm.pageContent.title = parameters.title;

            link ? loadFromURL(link, contentType) : loadPageContent(contentType);
        }

        function loadPageContent(contentType) {
            // Get the content from the external server
            DynamicContent.getPageContent(contentType).then(response => {
                $timeout(() => {
                    vm.pageContent.content = response.data;
                    vm.loading = false;
                });
            }).catch(handleError);
        }

        function loadFromURL(url, contentType) {
            DynamicContent.loadFromURL(url).then(response => {
                $timeout(() => {
                    Logger.sendLog('About', contentType);
                    vm.pageContent.content = response.data;
                    vm.loading = false;
                });
            }).catch(handleError);
        }

        function handleError(response) {
            $timeout(() => {
                vm.loading = false;
                console.error(response);
                switch (response.code) {
                    case "NO_PAGE_CONTENT":
                        vm.alert = {
                            type: Params.alertTypeInfo,
                            content: "NO_PAGE_CONTENT"
                        };
                        break;
                    case "PAGE_ACCESS_ERROR":
                        vm.alert = {
                            type: Params.alertTypeDanger,
                            content: "PAGE_ACCESS_ERROR"
                        };
                        break;
                    default:
                        vm.alert = {
                            type: Params.alertTypeDanger,
                            content: "ERROR_GENERIC"
                        };
                }
            });
        }
    }
})();
