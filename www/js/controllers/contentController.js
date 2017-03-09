(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ContentController', ContentController);

    ContentController.$inject = ['DynamicContentService', 'NavigatorParameters'];

    /* @ngInject */
    function ContentController(DynamicContentService, NavigatorParameters) {
        var vm = this;
        vm.title = 'ContentController';
        vm.pageContent = {};
        vm.loading = true;
        vm.alert = undefined;
        vm.loadPageContent = loadPageContent;

        activate();

        ////////////////

        function activate() {
            var nav = NavigatorParameters.getNavigator();
            var contentType = nav.getCurrentPage().options.contentType;
            loadPageContent(contentType);
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
                .catch(function (response) {
                    vm.loading = false;
                    console.log(response.code == "NO_PAGE");
                    switch (response.code) {
                        case "NO_PAGE":
                            vm.alert = {
                                type :'info',
                                content: "NO_CONTENT"
                            };
                            break;
                        default:
                            vm.alert = {
                                type :'danger',
                                content: "INTERNETERROR"
                            };
                    }
                });
        }

    }

})();

