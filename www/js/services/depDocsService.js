(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('DepDocsService', DepDocsService);

    DepDocsService.$inject = ['$http'];

    /* @ngInject */
    function DepDocsService($http) {

        var content = undefined;

        var service = {
            getPageContent: getPageContent,
            initializeLinks: initializeLinks,
            getContentData: getContentData,
            setContentData: setContentData
        };

        return service;

        ////////////////

        function initializeLinks(){
            if(content) return;
            return $http({
                method: 'GET',
                url: 'https://www.depdocs.com/opal/links/links.php'
            })
        }

        function getContentData(contentType){
            return content[contentType];
        }

        function setContentData(contentData){
            content = contentData;
        }

        function getPageContent(contentType) {
            return $http({
                method: 'GET',
                url: content[contentType].url
            })
        }
    }

})();

