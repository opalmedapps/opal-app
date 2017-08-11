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

    ContentController.$inject = ['DynamicContentService', 'NavigatorParameters', 'Logger'];

    /* @ngInject */
    function ContentController(DynamicContentService, Logger) {
        var vm = this;
        vm.title = 'ContentController';
        vm.pageContent = {};
        vm.loading = true;
        vm.alert = undefined;

        activate();
 
        ////////////////

        // Uses the content pushed from a pushPage. See details in Opal wiki for use.
        function activate() {
            var page_params = initNavigator.topPage.data;
            var link = page_params.contentLink;
            var contentType = page_params.contentType;
            vm.pageContent.title = contentType;
            link ? loadFromURL(link, contentType) : loadPageContent(contentType);
        }

        function loadPageContent(contentType){

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
                case "NO_PAGE":
                    vm.alert = {
                        type: 'info',
                        content: "NO_CONTENT"
                    };
                    break;
                default:
                    vm.alert = {
                        type: 'danger',
                        content: "INTERNETERROR"
                    };
            }
        }

    }

})();

