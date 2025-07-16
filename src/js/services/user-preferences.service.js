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

        /**
         * @description The name of the user's chosen font size (medium, large, xlarge).
         * @type {string}
         */
        let fontSize = '';

        /**
         * @description The app's current language.
         * @type {string}
         */
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
            getFontSize: () => fontSize,
            getLanguage: () => language,
            getSupportedLanguages: () => supportedLanguages,
            initFontSize: initFontSize,
            initializeLanguage: initializeLanguage,
            observeLanguage: fun => languageObserver.attach(fun),
            setFontSize: setFontSize,
            setLanguage: setLanguage,
        };

        return service;

        /**
         * @description Gets the default language based on the app's environment variables.
         * @returns {string} Two-letter code for the default language in upper case (e.g. 'EN').
         */
        function getDefaultLanguage() {
            return supportedLanguages[0];
        }

        /**
         * @description Initializes the user's current font size based on the value stored in localStorage.
         *              If no value has been stored, defaults to 'large'.
         */
        function initFontSize() {
            let font = window.localStorage.getItem(UserAuthorizationInfo.getUsername() + 'fontSize');
            setFontSize(font || 'large');
        }

        /**
         * @description Initializes the app's language. If this is the first time using the device,
         *              sets it to the mobile device's or browser's language.
         *              If language was already set and saved in localStorage, sets the app to that language.
         *              If no language was previously set and the device language is not supported, falls back on the app's default language.
         * @returns {Promise} Resolves if the language was found and correctly set.
         *                    If there was an error using the globalization plugin, falls back on the default language and resolves anyways.
         **/
        function initializeLanguage() {
            // Read the supported languages from the app's environment variables
            supportedLanguages = CONFIG.settings.supportedLanguages.toUpperCase().replaceAll(' ','').split(',');

            // Initialize the app's language
            return new Promise(resolve => {
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
         * @description Sets the app's language.
         * @param {string} lang The language to which to set the app.
         * @param {boolean} isAuthenticated Whether the language is being set from a logged-in state.
         **/
        function setLanguage(lang, isAuthenticated = false) {
            let languageLower = lang.toLowerCase();
            let languageUpper = lang.toUpperCase();

            // Validate the language
            if (!supportedLanguages.includes(languageUpper)) {
                console.warn(`Language '${languageUpper}' is not supported; defaulting to '${getDefaultLanguage()}'`);
                if (window.localStorage.getItem('Language') === languageUpper) window.localStorage.removeItem('Language');
                return setLanguage(getDefaultLanguage());
            }

            // Set the language
            // Note: values set for tmhDynamicLocale correspond to those in the files inside the `angular-locales` directory
            tmhDynamicLocale.set(`${languageLower}-${locale}`);
            $translate.use(languageLower);
            language = languageUpper;

            if (isAuthenticated) window.localStorage.setItem('Language', language);
            languageObserver.notify();
        }

        /**
         * @description Sets the app's font size.
         * @param {string} size The name of the new font size to set; see `fontSize` variable for options.
         */
        function setFontSize(size) {
            let username = UserAuthorizationInfo.getUsername();
            window.localStorage.setItem(username + 'fontSize', size);
            fontSize = size;

            // Format and save the font size class names
            // Options: fontDescMedium, fontTitleMedium, fontDescLarge, fontTitleLarge, fontDescXlarge, fontTitleXlarge (see font.css)
            let sizeText = fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
            $rootScope.fontSizeDesc = `fontDesc${sizeText}`;
            $rootScope.fontSizeTitle = `fontTitle${sizeText}`;
        }

        /**
         * @description Clears the UserPreferences service.
         *              Note: The app's current language is not cleared due to the order in which data is initialized.
         *                    The language is still needed after this service is cleared.
         **/
        function clearUserPreferences() {
            fontSize = '';
            languageObserver.clear();
        }
    }
})();
