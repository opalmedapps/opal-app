//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
//This service will have the user preferences for language and sent sms feature. To be used in account settings.
/**
 *@ngdoc service
 *@name MUHCApp.service:UserPreferences
 *@requires $rootScope
 *@requires tmhDynamicLocale
 *@requires $translate
 *@requires MUHCApp.service:UserAuthorizationInfo
 *@description Service stores and manages user preferences
 **/
myApp.service('UserPreferences', ['UserAuthorizationInfo','$rootScope','tmhDynamicLocale','$translate','Constants',
    function (UserAuthorizationInfo, $rootScope, tmhDynamicLocale, $translate, Constants) {

    //Fields for user preference and authentication
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#fontSize
     *@propertyOf MUHCApp.service:UserPreferences
     *@description Font size property
     **/
    var fontSize = '';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#calendarOption
     *@propertyOf MUHCApp.service:UserPreferences
     *@description Calendar option preperty
     **/
    var calendarOption = '';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#language
     *@propertyOf MUHCApp.service:UserPreferences
     *@description Language property
     **/
    var language = '';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#enableSMS
     *@propertyOf MUHCApp.service:UserPreferences
     *@description Enable SMS property
     **/
    var enableSMS = '';

    /**
     *@ngdoc method
     *@name setLanguage
     *@methodOf MUHCApp.service:UserPreferences
     *@param {String} lan Either 'EN' or 'FR'
     *@param isAuthenticated
     *@description Setter method for patient language of preference
     **/
    function setLang(lan, isAuthenticated = false){
        if (lan == 'EN') {
            tmhDynamicLocale.set('en-ca');
            $translate.use('en');
            language = 'EN';
        } else {
            tmhDynamicLocale.set('fr-ca');
            $translate.use('fr');
            language = 'FR';
        }
        if (isAuthenticated)  window.localStorage.setItem('Language', language);
    }


    return {

        setFontSize: function(size) {
            var username = UserAuthorizationInfo.getUsername();
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
        },
        setLanguage: setLang,
        /**
         *@ngdoc method
         *@name getFontSize
         *@methodOf MUHCApp.service:UserPreferences
         *@returns {String} Returns font-size
         **/
        getFontSize: function() {
            /*var username=UserAuthorizationInfo.getUsername();
            var appfontSize='large';
            $rootScope.fontSizeDesc='fontDescLarge';
            $rootScope.fontSizeTitle='fontTitleLarge';
            var fontSize=window.localStorage.getItem(username+'fontSize');
            if(fontSize&&typeof fontSize!=='undefined'&&fontSize=='medium')
            {
                fontSize=appfontSize;
                $rootScope.fontSizeDesc='fontDescMedium';
                $rootScope.fontSizeTitle='fontTitleMedium';
            }*/
            var font = fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
            $rootScope.fontSizeDesc = 'fontDesc' + font;
            $rootScope.fontSizeTitle = 'fontTitle' + font;
            return fontSize;
        },
        /**
         *@ngdoc method
         *@name setNativeCalendarOption
         *@methodOf MUHCApp.service:UserPreferences
         *@param {String} option Boolean value for option
         *@description Setter method for patient calendar option
         **/
        setNativeCalendarOption: function(option) {
            if (option) {
                calendarOption = option;
            }
        },
        /**
         *@ngdoc method
         *@name getNativeCalendarOption
         *@methodOf MUHCApp.service:UserPreferences
         *@returns {String} Returns calendarOption
         **/
        getNativeCalendarOption: function() {
            return calendarOption;
        },
        /**
         *@ngdoc method
         *@name initializeLanguage
         *@methodOf MUHCApp.service:UserPreferences
         *@description The method accesses the globalization plugin of the device to find the actual language of device and sets default to that language.
         * If language was already set previously within the app, set default to that language. Otherwise it sets English as default.
         *@returns {Promise} Returns a promise that fulfills if the language is been found and correctly set or rejects if there was a problem using the plugin.
         **/
        initializeLanguage: function() {
            return new Promise((resolve) => {
                var lan = window.localStorage.getItem('Language') || navigator.language || navigator.userLanguage;
                lan = lan.substring(0, 2).toLowerCase();
                //If language is not defined and its a device
                if (!lan && Constants.app) {
                    //Finds out the language of the default storage
                    navigator.globalization.getPreferredLanguage(function (success) {
                        var lan = success.value;
                        //Extract only the prefix for language
                        setLang(lan.substring(0, 2).toUpperCase());
                        resolve(language);
                    }, function (error) {
                        // TODO log error.
                        setLang('FR');
                        resolve(language);
                    });
                } else {
                    setLang(lan.toUpperCase());
                    resolve(language);
                }
            });
        },
        /**
         *@ngdoc method
         *@name setEnableSMS
         *@methodOf MUHCApp.service:UserPreferences
         *@param {String} option Boolean value for option
         *@description Setter method for enable sms notifications option
         **/
        setEnableSMS: function() {
            return enableSMS;
        },
        getLanguage: function() {
            return language;

        },
        getEnableSMS: function() {
            return enableSMS;
        },
        /**
         *@ngdoc method
         *@name setUserPreferences
         *@methodOf MUHCApp.service:UserPreferences
         *@param {Object} preferences Object containing the user preferences

         *@description Setter method for patient preferences, format
         *<pre>preferences = {Language:'EN',EnableSMS:'1'}</pre>
         **/
        setUserPreferences: function(preferences) {
            language = preferences.Language;
            enableSMS = preferences.EnableSMS;
        },
        /**
         *@ngdoc method
         *@name clearUserPreferences
         *@methodOf MUHCApp.service:UserPreferences
         *@description Clears user preferences for logout functionality
         **/
        clearUserPreferences: function() {
            fontSize = '';
            calendarOption = '';
            enableSMS = '';
        }

    };



}]);
