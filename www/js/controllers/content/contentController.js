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

    ContentController.$inject = ['DynamicContentService', 'NavigatorParameters', 'Logger', '$rootScope'];

    /* @ngInject */
    function ContentController(DynamicContentService, NavigatorParameters, Logger, $rootScope) {
        var vm = this;
        vm.pageContent = {};
        vm.loading = true;
        vm.alert = undefined;

        activate();

        ////////////////

        // Uses the content pushed from a pushPage. See details in Opal wiki for use.
        function activate() {

            var nav = NavigatorParameters.getNavigator();

            var link = "";
            var contentType = "";

            try {
                link = nav.getCurrentPage().options.contentLink;
                contentType = nav.getCurrentPage().options.contentType;
            } catch (err) {
                // console.log("contentController: ", err.message, "  $rootScope.contentType: ", $rootScope.contentType, " will be used instead.");
                contentType = $rootScope.contentType;
                $rootScope.contentType = "";
                // For some reason, pushing this page from settingsNavigator (settingsNavigator.pushPage)
                // causes NavigatorParameters.getNavigator() to return null (i.e. no Navigator).
                // That's why we end up here in the Catch section.
                // Consequesntly, .options.contentType becomes null so we used $rootScope.contentType
                // to hold the value from the caller, mainly initSettingsController.js where
                // settingNavigator is used. We should find out why this is happening
            }

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

