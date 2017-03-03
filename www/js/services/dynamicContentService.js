/*
 * Filename     :   DynamicContentService.js
 * Description  :   service that manages the dynamc html for Opal. It grabs data from depdocs.com
 * Created by   :   Robert Maglieri 
 * Date         :   02 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 *@name MUHCApp.service:DynamicContentService
 *@requires $q
 *@requires $http
 *@description Service that manages the dynamic html for Opal. It grabs data from depdocs.com
 **/
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('DynamicContentService', DynamicContentService);

    DynamicContentService.$inject = ['$http','$q'];

    /* @ngInject */
    function DynamicContentService($http, $q) {

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#content
         *@propertyOf MUHCApp.service:DynamicContentService
         *@description Content to be displayed in the Opal page.
         **/
        var content = undefined;

        var service = {
            getPageContent: getPageContent,
            initializeLinks: initializeLinks,
            getContentData: getContentData,
            setContentData: setContentData
        };

        return service;

        ////////////////

        /**
         *@ngdoc method
         *@name initializeLinks
         *@methodOf MUHCApp.service:DynamicContentService
         *@description Function that gets the available content links from the links.php file on external server
         *@returns {Promise} containing the available list of contents on the external server. If the content is
         **/
        function initializeLinks(){
            if(content) return $q.resolve({exists: true});
            return $http({
                method: 'GET',
                url: 'https://www.depdocs.com/opal/links/links.php'
            })
        }

        /**
         *@ngdoc method
         *@name getContentData
         *@methodOf MUHCApp.service:DynamicContentService
         *@param {String} contentType The content key that requests data from external server
         *@description gets the URL and Title of the requested data.
         *@returns {Object} contains the URL and Title for the content.
         **/
        function getContentData(contentType){
            return content[contentType];
        }

        /**
         *@ngdoc method
         *@name setContentData
         *@methodOf MUHCApp.service:DynamicContentService
         *@param {String} contentData The list of content links returned from initialize links
         *@description Sets all the links after initializeLinks function.
         *@returns {Object} contains the URL and Title for the content.
         **/
        function setContentData(contentData){
            content = contentData;
        }

        /**
         *@ngdoc method
         *@name getPageContent
         *@methodOf MUHCApp.service:DynamicContentService
         *@param {String} contentType The content to request from the external server
         *@description Grabs the content from the external server
         *@returns {Promise} contains the content to be loaded into the view.
         **/
        function getPageContent(contentType) {
            return $http({
                method: 'GET',
                url: content[contentType].url
            })
        }
    }

})();

