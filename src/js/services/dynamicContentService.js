// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   dynamicContentService.js
 * Description  :   Service that manages the dynamic data for Opal, hosted on an external server.
 * Created by   :   Robert Maglieri
 * Date         :   02 Mar 2017
 */

/**
 * @description Service that manages the dynamic data for Opal, hosted on an external server.
 **/
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('DynamicContent', DynamicContent);

    DynamicContent.$inject = ['$http', 'UserPreferences'];

    function DynamicContent($http, UserPreferences) {

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

        const getLanguage = () => UserPreferences.getLanguage().toLowerCase();

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

        ////////////////

        /**
         * @description Ensures that the data in this service has been initialized.
         * @author Stacey Beard
         * @date 2021-07-20
         * @returns {Promise<void>}
         * @throws Throws an error if initialization fails.
         */
        async function ensureInitialized() {
            const objectIsEmpty = obj => Object.keys(obj).length === 0;

            if (objectIsEmpty(constants) || objectIsEmpty(links))
                await initialize(CONFIG.settings.externalContentFileURL);
        }

        /**
         * @description Requests a page from the content provided by the server.
         *              Content must already have been initialized.
         * @param {string} contentKey The key for the page to request from the external server.
         * @returns {Promise<*>} Resolves to the page content to be loaded into the view, or rejects with an error.
         **/
        async function getPageContent(contentKey) {
            const details = {
                contentType: contentKey,
                userLanguage: getLanguage(),
                fallbackLanguage: CONFIG.settings.fallbackLanguage,
            };

            // Get he requested content's link, if it exists
            const url = getURL(contentKey);

            try {
                // Request the content
                const response = await $http({
                    method: 'GET',
                    url: url,
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
            const details = {
                contentType: contentKey,
                userLanguage: getLanguage(),
                fallbackLanguage: CONFIG.settings.fallbackLanguage,
            };

            // Return the requested content's link if it exists, or throw an error
            return links[contentKey][details.userLanguage] || links[contentKey][details.fallbackLanguage] || throw {code: "NO_PAGE_CONTENT", ...details};
        }

        /**
         * @description Gets a constant from the constants variable.
         *              Content must already have been initialized; this is done to allow this function to be non-async.
         * @param {string} contentKey The key for the constant to request.
         * @returns {*|undefined} The constant, or undefined if the constant is not found.
         */
        function getConstant(contentKey) {
            return constants?.[contentKey];
        }

        /**
         * @description Loads data from a specific URL without accessing the links variable
         * @param url The URL from which to load data.
         * @returns {Promise<*>} Resolves to the result of calling GET on the specified URL.
         */
        function loadFromURL(url) {
            return $http({
                method: 'GET',
                url: url
            })
        }
    }
})();
