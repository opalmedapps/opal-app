/*
 * Filename     :   dynamicContentService.js
 * Description  :   Service that manages the dynamic data for Opal, hosted on an external server.
 * Created by   :   Robert Maglieri 
 * Date         :   02 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 *@requires $q
 *@requires $http
 *@description Service that manages the dynamic data for Opal, hosted on an external server.
 **/
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('DynamicContent', DynamicContent);

    DynamicContent.$inject = ['$http','$q','UserPreferences'];

    /* @ngInject */
    function DynamicContent($http, $q, UserPreferences) {

        /**
         * @description Content mapping for links downloaded from the server.
         * @type {object}
         **/
        let links = {};

        /**
         * @description Content mapping for constants downloaded from the server.
         * @type {object}
         */
        let constants = {};

        const service = {
            ensureInitialized: ensureInitialized,
            getPageContent: getPageContent,
            getURL: getURL,
            getConstant: getConstant,
            loadFromURL: loadFromURL,
        };

        return service;

        ////////////////

        /**
         * @description Function that gets the available content from the specified file on the external server.
         * @param variable The variable in which to store the content.
         * @param sourceLink The link on the server from which to fetch the data.
         * @returns {Promise<void>}
         */
        async function initialize(sourceLink) {
            try {
                const response = await $http({
                    method: 'GET',
                    url: sourceLink
                });

                if (
                    response.status !== 200
                    || response.data.constants === undefined
                    || response.data.contentLinks === undefined
                ) throw {...response, code: "INIT_ERROR"};

                constants = response.data.constants;
                links = response.data.contentLinks;
            }
            catch(err) { throw {...err, code: "INIT_ERROR" } }
        }

        /**
         * @description Checks whether the requested content exists in the links variable.
         * @param contentKey The key of the content to check.
         * @returns {boolean} True if a URL in the right language exists for the given contentKey; false otherwise.
         */
        function linkContentExists(contentKey) {
            return links && links[contentKey] && links[contentKey][getURLKey()];
        }

        /**
         * @description Checks whether the requested constant exists in the constants variable.
         * @param constantKey The key of the constant to check.
         * @returns {boolean} True if the constant exists for the given constantKey; false otherwise.
         */
        function constantExists(constantKey) {
            return constants && typeof constants[constantKey] !== "undefined";
        }

        /**
         * @description Returns a URL key based on the user's language.
         * @returns {string} The URL key.
         */
        function getURLKey() {
            return `${UserPreferences.getLanguage()}`.toLowerCase();
        }

        /**
         * @description Helper function to check if an object is empty.
         * @param obj The object to check (must be an object).
         * @returns {boolean} Whether the object is empty.
         */
        function objectIsEmpty(obj) {
            return Object.keys(obj).length === 0;
        }

        ////////////////

        /**
         * @description Ensures that the data in this service has been initialized.
         * @author Stacey Beard
         * @date 2021-07-20
         * @returns {Promise<void>}
         * @throws Throws an error if initialization fails.
         */
        async function ensureInitialized() {
            if (objectIsEmpty(constants) || objectIsEmpty(links))
                await initialize(OPAL_CONFIG.settings.externalContentFileURL);
        }

        /**
         *@ngdoc method
         *@name getPageContent
         *@description Requests a page from the content provided by the server.
         *             Content must already have been initialized.
         *@param {String} contentKey The key for the page to request from the external server.
         *@returns {Promise<*>} The page content to be loaded into the view.
         **/
        async function getPageContent(contentKey) {
            // Check whether the requested content's link exists
            const urlKey = getURLKey();
            const details = {contentType: contentKey, urlKey: urlKey};
            if (!linkContentExists(contentKey)) throw {code: "NO_PAGE_CONTENT", ...details};

            try{
                // Request the content
                const response = await $http({
                    method: 'GET',
                    url: links[contentKey][urlKey]
                });

                // Add the title if it exists
                response.title = !links[contentKey].title ? "" : links[contentKey].title;

                // Validate and return the result
                if (response.status === 200) return response;
                else throw {...response, code: "PAGE_ACCESS_ERROR", ...details};
            }
            catch(err) { throw {...err, code: "PAGE_ACCESS_ERROR", ...details} }
        }

        /**
         * @description Gets a URL from the links variable.
         *              Content must already have been initialized; this is done to allow this function to be non-async.
         * @param contentKey The key for the URL to request.
         * @returns {string} The URL, or an empty string if the URL is not found.
         */
        function getURL(contentKey) {
            let url = "";

            // Check whether the requested content's URL exists
            const urlKey = getURLKey();
            if (linkContentExists(contentKey)) url = links[contentKey][urlKey];

            return url;
        }

        /**
         * @description Gets a constant from the constants variable.
         *              Content must already have been initialized; this is done to allow this function to be non-async.
         * @param contentKey The key for the constant to request.
         * @returns {*|undefined} The constant, or undefined if the constant is not found.
         */
        function getConstant(constantKey) {
            return constantExists(constantKey) ? constants[constantKey] : undefined;
        }

        // Loads data from a specific URL without accessing the links variable
        function loadFromURL(url) {
            return $http({
                method: 'GET',
                url: url
            })
        }
    }
})();
