(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ContentController', ContentController);

    ContentController.$inject = ['DynamicContentService', 'NavigatorParameters', 'Logger'];

    /* @ngInject */
    function ContentController(DynamicContentService, NavigatorParameters, Logger) {
        var vm = this;
        vm.title = 'ContentController';
        vm.pageContent = {};
        vm.loading = true;
        vm.alert = undefined;

        activate();

        ////////////////

        function activate() {
            var nav = NavigatorParameters.getNavigator();
            console.log(nav.getCurrentPage());
            var link = nav.getCurrentPage().options.contentLink;
            var contentType = nav.getCurrentPage().options.contentType;
            vm.pageContent.title = contentType;
            link ? loadFromURL(link, contentType) : loadPageContent(contentType);
        }

        function loadPageContent(contentType){

            var pageContent = DynamicContentService.getContentData(contentType);

            // get the content from depdocs
            DynamicContentService.getPageContent(contentType)
                .then(function (response) {
                    console.log(response);
                    vm.pageContent.title = pageContent.title;
                    vm.pageContent.content = response.data;
                    console.log(vm.pageContent);
                    vm.loading = false;
                })
                .catch(handleError);
        }

        function loadFromURL(url, contentType) {
            DynamicContentService.loadFromURL(url)
                .then(function (response) {
                    Logger.sendLog('About', contentType);
                    vm.pageContent.title = contentType;
                    vm.pageContent.content = response.data;
                    console.log(vm.pageContent);
                    vm.loading = false;
                })
                .catch(handleError);

        }

        function handleError(response) {
            vm.loading = false;
            console.log(response.code == "NO_PAGE");
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

