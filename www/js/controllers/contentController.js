(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ContentController', ContentController);

    ContentController.$inject = ['DepDocsService', 'NavigatorParameters'];

    /* @ngInject */
    function ContentController(DepDocsService, NavigatorParameters) {
        var vm = this;
        vm.title = 'ContentController';
        vm.pageContent = {};
        vm.loading = true;
        vm.alert = undefined;
        vm.loadPageContent = loadPageContent;

        activate();

        ////////////////

        function activate() {
            var params = NavigatorParameters.getParameters();
            console.log(params);
            var contentType = params.nav.getCurrentPage().options.contentType;
            //console.log(contentType)
            loadPageContent(contentType);
        }

        function loadPageContent(contentType){
            // push the new page on the satck

            var pageContent = DepDocsService.getContentData(contentType);

            vm.pageContent.title = pageContent.title;

            // get the content from depdocs
            DepDocsService.getPageContent(contentType)
                .then(function (response) {
                    console.log(response);
                    vm.pageContent.content = response.data;
                    console.log(vm.pageContent);
                    vm.loading = false;
                })
                .catch(function (response) {
                    console.log("Problems... ", response);
                    vm.loading = false;
                    vm.alert = {
                        type :'danger',
                        content: 'INTERNETERROR'
                    }
                });
        }

    }

})();

