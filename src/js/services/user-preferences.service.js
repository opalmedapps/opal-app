// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import {Observer} from "../models/utility/observer";

/**
 * @author Based on UserPreferences by David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
 *         Refactored by Stacey Beard in July 2025.
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('UserPreferences', UserPreferences);

    UserPreferences.$inject = ['$rootScope', '$translate', 'Constants', 'tmhDynamicLocale', 'UserAuthorizationInfo'];

    /**
     * @description Service that stores and manages user preferences.
     */
    function UserPreferences($rootScope, $translate, Constants, tmhDynamicLocale, UserAuthorizationInfo) {

        let fontSize = '';
        let language = '';

        /**
         * @description The list of languages supported by the system. Each language is a two-letter code in upper case (e.g. 'EN').
         *              The first language in the list is considered the default.
         * @type {string[]}
         */
        let supportedLanguages = [];

        /**
         * @description The locale for language files in the app.
         * @type {string}
         */
        let locale = 'ca';

        /**
         * @desc Observer object that notifies other parts of the app when the language changes.
         * @type {Observer}
         */
        const languageObserver = new Observer();

        let service = {
            clearUserPreferences: clearUserPreferences,
            getDefaultLanguage: getDefaultLanguage,
            getFontSize: getFontSize,
            getLanguage: () => language,
            initFontSize: initFontSize,
            initializeLanguage: initializeLanguage,
            observeLanguage: fun => languageObserver.attach(fun),
            setFontSize: setFontSize,
            setLanguage: setLanguage,
        };

        return service;

        function getDefaultLanguage() {
            return supportedLanguages[0];
        }

        /**
         * @returns {String} Returns font-size
         **/
        function getFontSize() {
            let font = fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
            $rootScope.fontSizeDesc = 'fontDesc' + font;
            $rootScope.fontSizeTitle = 'fontTitle' + font;
            return fontSize;
        }

        function initFontSize() {
            let font = window.localStorage.getItem(UserAuthorizationInfo.getUsername() + 'fontSize');
            setFontSize(font || 'large');
        }

        /**
         * @description The method accesses the globalization plugin of the device to find the actual language of device and sets default to that language.
         *              If language was already set previously within the app, set default to that language.
         *              If no language was previously set and the device language is not supported, fall back on the app's default language.
         * @returns {Promise} Returns a promise that fulfills if the language is been found and correctly set or rejects if there was a problem using the plugin.
         **/
        function initializeLanguage() {
            // Read the supported languages from the app's environment variables
            supportedLanguages = CONFIG.settings.supportedLanguages.toUpperCase().replaceAll(' ','').split(',');

            // Initialize the app's language
            return new Promise((resolve) => {
                let lang = window.localStorage.getItem('Language') || navigator.language;
                lang = lang.substring(0, 2);
                // If language is not defined and it's a device
                if (!lang && Constants.app) {
                    // Finds out the language of the default storage
                    navigator.globalization.getPreferredLanguage(success => {
                        // Extract only the prefix for language
                        setLanguage(success.value.substring(0, 2).toUpperCase());
                        resolve(language);
                    }, error => {
                        console.error('Error getting the language from the current device', error);
                        setLanguage(getDefaultLanguage());
                        resolve(language);
                    });
                } else {
                    setLanguage(lang);
                    resolve(language);
                }
            });
        }

        /**
         * @param {string} lang The language to which to set the app.
         * @param {boolean} isAuthenticated Whether the language is being set from a logged-in state.
         * @description Sets the current app language.
         **/
        function setLanguage(lang, isAuthenticated = false) {
            let languageLower = lang.toLowerCase();
            let languageUpper = lang.toUpperCase();

            // Validate the language
            if (!supportedLanguages.includes(languageUpper)) throw `Language '${languageUpper}' is not supported`;

            // Set the language
            // Note: values set for tmhDynamicLocale correspond to those in the files inside the `angular-locales` directory
            tmhDynamicLocale.set(`${languageLower}-${locale}`);
            $translate.use(languageLower);
            language = languageUpper;

            if (isAuthenticated) window.localStorage.setItem('Language', language);
            languageObserver.notify();
        }

        function setFontSize(size) {
            let username = UserAuthorizationInfo.getUsername();
            window.localStorage.setItem(username + 'fontSize', size);
            fontSize = size;

            // Format and save the right font size name
            // Options: fontDescMedium, fontTitleMedium, fontDescLarge, fontTitleLarge, fontDescXlarge, fontTitleXlarge (see font.css)
            let sizeText = fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
            $rootScope.fontSizeDesc = `fontDesc${sizeText}`;
            $rootScope.fontSizeTitle = `fontTitle${sizeText}`;
        }

        /**
         * @description Clears user preferences for logout functionality
         **/
        function clearUserPreferences() {
            fontSize = '';
            language = '';
            supportedLanguages = [];
            languageObserver.clear();
        }
    }
})();
