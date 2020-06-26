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

    ContentController.$inject = ['DynamicContentService', 'NavigatorParameters', 'Logger', 'Params'];

    /* @ngInject */
    function ContentController(DynamicContentService, NavigatorParameters, Logger, Params) {
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

            vm.pageContent.title = contentType;
            link ? loadFromURL(link, contentType) : loadPageContent(contentType);
        }

        function loadPageContent(contentType) {
            var pageContent = DynamicContentService.getContentData(contentType);

            // get the content from depdocs
            DynamicContentService.getPageContent(contentType)
                .then(function (response) {
                    vm.pageContent.title = pageContent.title;
                    vm.pageContent.content = response.data;
                    vm.loading = false;
                }).catch(handleError);
        }

        function loadFromURL(url, contentType) {
            DynamicContentService.loadFromURL(url)
                .then(function (response) {
                    Logger.sendLog('About', contentType);
                    vm.pageContent.title = contentType;
                    vm.pageContent.content = response.data;
                    vm.loading = false;
                })
                .catch(handleError);
        }

        function handleError(response) {
            vm.loading = false;
            switch (response.code) {
                case Params.noPageResponseCase:
                    vm.alert = {
                        type: Params.alertTypeInfo,
                        content: Params.noContentMessage
                    };
                    break;
                default:
                    vm.alert = {
                        type: Params.alertTypeDanger,
                        content: Params.secondNetworkErrorMessage
                    };
            }
        }
    }
})();

