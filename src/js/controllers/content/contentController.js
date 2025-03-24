/*
 * Filename     :   contentController.js
 * Description  :   Manages the dynamic content grabbed from depdocs. It can take a content link as input.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ContentController', ContentController);

    ContentController.$inject = ['DynamicContent', 'NavigatorParameters', 'Logger', 'Params', '$timeout'];

    /* @ngInject */
    function ContentController(DynamicContent, NavigatorParameters, Logger, Params, $timeout) {
        var vm = this;
        vm.pageContent = {};
        vm.loading = true;
        vm.alert = undefined;

        activate();

        ////////////////

        // Uses the content pushed from a pushPage. See details in Opal wiki for use.
        function activate() {

            var nav = NavigatorParameters.getNavigator();

            let link = nav.getCurrentPage().options.contentLink;
            let contentType = nav.getCurrentPage().options.contentType;

            vm.pageContent.title = "";

            link ? loadFromURL(link, contentType) : loadPageContent(contentType);
        }

        function loadPageContent(contentType) {
            // Get the content from DepDocs
            DynamicContent.getPageContent(contentType).then(response => {
                $timeout(() => {
                    vm.pageContent.title = response.title;
                    vm.pageContent.content = response.data;
                    vm.loading = false;
                });
            }).catch(handleError);
        }

        function loadFromURL(url, contentType) {
            DynamicContent.loadFromURL(url).then(response => {
                $timeout(() => {
                    Logger.sendLog('About', contentType);
                    vm.pageContent.title = contentType;
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
