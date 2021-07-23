/*
 * Filename     :   dynamicContentService.js
 * Description  :   Service that manages the dynamic data for Opal, hosted on depdocs.com.
 * Created by   :   Robert Maglieri 
 * Date         :   02 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 *@name MUHCApp.service:DynamicContent
 *@requires $q
 *@requires $http
 *@requires MUHCApp.service:UserPreferences
 *@description Service that manages the dynamic data for Opal, hosted on depdocs.com.
 **/
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('DynamicContent', DynamicContent);

    DynamicContent.$inject = ['$http','$q','UserPreferences'];

    /* @ngInject */
    function DynamicContent($http, $q, UserPreferences) {

        // The location of the links file on the external server
        const linksURL = "https://www.depdocs.com/opal/links/links_1.11.5.php";

        /**
         *@ngdoc property
         *@name MUHCApp.service.#content
         *@propertyOf MUHCApp.service:DynamicContent
         *@description Content mapping downloaded from the server.
         **/
        let content = undefined;

        const service = {
            ensureInitialized: ensureInitialized,
            getPageContent: getPageContent,
            getURL: getURL,
            loadFromURL: loadFromURL,
        };

        return service;

        ////////////////

        /**
         *@ngdoc method
         *@name initializeLinks
         *@methodOf MUHCApp.service:DynamicContent
         *@description Function that gets the available content from the links file on the external server.
         *@returns {Promise<void>}
         */
        async function initializeLinks() {
            try{
                const response = await $http({
                    method: 'GET',
                    url: linksURL
                });
                content = response.data;

                if (response.status !== 200) throw {...response, code: "INIT_ERROR"};
            }
            catch(err) { throw {...err, code: "INIT_ERROR" } }
        }

        /**
         * @description Checks whether the requested content exists in the content variable.
         * @param contentKey The key of the content to check.
         * @returns {boolean} True if a URL in the right language exists for the given contentKey; false otherwise.
         */
        function contentExists(contentKey) {
            return content && content[contentKey] && content[contentKey][getURLKey()];
        }

        /**
         * @description Returns a URL key based on the user's language.
         * @returns {string} The URL key.
         */
        function getURLKey() {
            return `url_${UserPreferences.getLanguage()}`;
        }

        ////////////////

        /**
         * @description Ensures that the links in this service have been initialized.
         * @author Stacey Beard
         * @date 2021-07-20
         * @returns {Promise<void>}
         * @throws Throws an error if initialization fails.
         */
        async function ensureInitialized() {
            if (!content) await initializeLinks();
        }

        /**
         *@ngdoc method
         *@name getPageContent
         *@methodOf MUHCApp.service:DynamicContent
         *@description Requests a page from the content provided by the server.
         *             Content must already have been initialized.
         *@param {String} contentKey The key for the page to request from the external server.
         *@returns {Promise<*>} The page content to be loaded into the view.
         **/
        async function getPageContent(contentKey) {
            // Check whether the requested content's link exists
            const urlKey = getURLKey();
            const details = {contentType: contentKey, urlKey: urlKey};
            if (!contentExists(contentKey)) throw {code: "NO_PAGE_CONTENT", ...details};

            try{
                // Request the content
                const response = await $http({
                    method: 'GET',
                    url: content[contentKey][urlKey]
                });

                // Add the content title if it exists
                response.title = !content[contentKey].title ? "" : content[contentKey].title;

                // Validate and return the result
                if (response.status === 200) return response;
                else throw {...response, code: "PAGE_ACCESS_ERROR", ...details};
            }
            catch(err) { throw {...err, code: "PAGE_ACCESS_ERROR", ...details} }
        }

        /**
         * @description Gets a URL from the content variable.
         *              Content must already have been initialized; this is done to allow this function to be non-async.
         * @param contentKey The key for the URL to request.
         * @returns {string} The URL, or an empty string if the URL is not found.
         */
        function getURL(contentKey) {
            let url = "";

            // Check whether the requested content's URL exists
            const urlKey = getURLKey();
            if (contentExists(contentKey)) url = content[contentKey][urlKey];

            return url;
        }

        // Loads data from a specific URL without accessing the content variable
        function loadFromURL(url) {
            return $http({
                method: 'GET',
                url: url
            })
        }
    }
})();
