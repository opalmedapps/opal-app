// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
import {Observer} from "../models/utility/observer";

var myApp=angular.module('OpalApp');
//This service will have the user preferences for language. To be used in account settings.
/**
 *@ngdoc service
 *@requires $rootScope
 *@requires tmhDynamicLocale
 *@requires $translate
 *@description Service stores and manages user preferences
 **/
myApp.service('UserPreferences', ['UserAuthorizationInfo','$rootScope','tmhDynamicLocale','$translate','Constants',
    function (UserAuthorizationInfo, $rootScope, tmhDynamicLocale, $translate, Constants) {

    //Fields for user preference and authentication
    /**
     *@ngdoc property
     *@description Font size property
     **/
    var fontSize = '';
    /**
     *@ngdoc property
     *@description Language property
     **/
    var language = '';

    /**
     * @desc Observer object that notifies other parts of the app when the language changes.
     * @type {Observer}
     */
    const languageObserver = new Observer();

    /**
     *@ngdoc method
     *@name setLanguage
     *@param {String} lang Either 'EN' or 'FR'
     *@param isAuthenticated
     *@description Setter method for patient language of preference
     **/
    function setLang(lang, isAuthenticated = false) {
        if (lang == 'EN') {
            tmhDynamicLocale.set('en-ca');
            $translate.use('en');
            language = 'EN';
        } else {
            tmhDynamicLocale.set('fr-ca');
            $translate.use('fr');
            language = 'FR';
        }
        if (isAuthenticated)  window.localStorage.setItem('Language', language);
        languageObserver.notify();
    }

    function setFontSize(size) {
        let username = UserAuthorizationInfo.getUsername();
        window.localStorage.setItem(username + 'fontSize', size);
        fontSize = size;
        if (size === 'medium') {
            $rootScope.fontSizeDesc = 'fontDescMedium';
            $rootScope.fontSizeTitle = 'fontTitleMedium';
        } else if (size === 'large') {
            $rootScope.fontSizeDesc = 'fontDescLarge';
            $rootScope.fontSizeTitle = 'fontTitleLarge';
        } else if (size === 'xlarge') {
            $rootScope.fontSizeDesc = 'fontDescXlarge';
            $rootScope.fontSizeTitle = 'fontTitleXlarge';
        }
    }

    return {
        setFontSize: setFontSize,
        setLanguage: setLang,
        observeLanguage: fun => languageObserver.attach(fun),
        initFontSize: function() {
            let font = window.localStorage.getItem(UserAuthorizationInfo.getUsername() + 'fontSize');
            setFontSize(font || 'large');
        },
        /**
         *@ngdoc method
         *@name getFontSize
         *@returns {String} Returns font-size
         **/
        getFontSize: function() {
            var font = fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
            $rootScope.fontSizeDesc = 'fontDesc' + font;
            $rootScope.fontSizeTitle = 'fontTitle' + font;
            return fontSize;
        },
        /**
         *@ngdoc method
         *@name initializeLanguage
         *@description The method accesses the globalization plugin of the device to find the actual language of device and sets default to that language.
         * If language was already set previously within the app, set default to that language. Otherwise it sets English as default.
         *@returns {Promise} Returns a promise that fulfills if the language is been found and correctly set or rejects if there was a problem using the plugin.
         **/
        initializeLanguage: function() {
            return new Promise((resolve) => {
                var lang = window.localStorage.getItem('Language') || navigator.language || navigator.userLanguage;
                lang = lang.substring(0, 2).toLowerCase();
                //If language is not defined and its a device
                if (!lang && Constants.app) {
                    //Finds out the language of the default storage
                    navigator.globalization.getPreferredLanguage(function (success) {
                        var lang = success.value;
                        //Extract only the prefix for language
                        setLang(lang.substring(0, 2).toUpperCase());
                        resolve(language);
                    }, function (error) {
                        // TODO log error.
                        setLang('FR');
                        resolve(language);
                    });
                } else {
                    setLang(lang.toUpperCase());
                    resolve(language);
                }
            });
        },
        getLanguage: function() {
            return language;

        },
        /**
         *@ngdoc method
         *@name clearUserPreferences
         *@description Clears user preferences for logout functionality
         **/
        clearUserPreferences: function() {
            fontSize = '';
            languageObserver.clear();
        }
    };
}]);
