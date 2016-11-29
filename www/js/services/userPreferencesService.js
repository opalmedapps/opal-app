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
 *@requires $q
 *@requires MUHCApp.service:UserAuthorizationInfo
 *@description Service stores and manages user preferences
 **/
myApp.service('UserPreferences',[ 'UserAuthorizationInfo','$rootScope','tmhDynamicLocale','$translate','$q', function(UserAuthorizationInfo,$rootScope,tmhDynamicLocale,$translate,$q){
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

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


    return{

        setFontSize:function(size)
        {
            var username=UserAuthorizationInfo.getUsername();
            window.localStorage.setItem(username+'fontSize',size);
            fontSize=size;
            if(size=='medium')
            {
                $rootScope.fontSizeDesc='fontDescMedium';
                $rootScope.fontSizeTitle='fontTitleMedium';
            }else if(size=='large'){
                $rootScope.fontSizeDesc='fontDescLarge';
                $rootScope.fontSizeTitle='fontTitleLarge';
            }
        },
        /**
         *@ngdoc method
         *@name getFontSize
         *@methodOf MUHCApp.service:UserPreferences
         *@returns {String} Returns font-size
         **/
        getFontSize:function()
        {
            var username=UserAuthorizationInfo.getUsername();
            fontSize='large';
            $rootScope.fontSizeDesc='fontDescLarge';
            $rootScope.fontSizeTitle='fontTitleLarge';
            var fontSize=window.localStorage.getItem(username+'fontSize');
            if(fontSize&&typeof fontSize!=='undefined'&&fontSize=='medium')
            {
                fontSize=fontSize;
                $rootScope.fontSizeDesc='fontDescMedium';
                $rootScope.fontSizeTitle='fontTitleMedium';
            }
            return fontSize;
        },
        /**
         *@ngdoc method
         *@name setNativeCalendarOption
         *@methodOf MUHCApp.service:UserPreferences
         *@param {String} option Boolean value for option
         *@description Setter method for patient calendar option
         **/
        setNativeCalendarOption:function(option){
            if(option){
                calendarOption = option;
            }
        },
        /**
         *@ngdoc method
         *@name getFontSize
         *@methodOf MUHCApp.service:UserPreferences
         *@returns {String} Returns calendarOption
         **/
        getNativeCalendarOption:function(){
            return calendarOption;
        },
        /**
         *@ngdoc method
         *@name getFontSize
         *@methodOf MUHCApp.service:UserPreferences
         *@description The method accesses the globalization plugin of the device to find the actual language of device and sets default to that language. Otherwise it sets
         *English as default
         *@returns {Promise} Returns a promise that fulfills if the language is been found and correctly set or rejects if there was a problem using the plugin.
         **/
        initializeLanguage:function()
        {
            var r = $q.defer();
            //var lan =  window.localStorage.getItem('Language');
            var lan = navigator.language || navigator.userLanguage;
            lan = lan.substring(0,2).toLowerCase();
            console.log(lan);
            //If language is not defined and its a device
            if(!lan&&app)
            {
                //Finds out the language of the default storage
                navigator.globalization.getPreferredLanguage(function(success){
                    var lan = success.value;
                    //Extract only the prefix for language
                    lan = lan.substring(0,2);
                    //Set language
                    if(lan=='en')
                    {
                        tmhDynamicLocale.set('en-ca');
                        $translate.use('en');
                        //window.localStorage.setItem('Language','EN');
                        r.resolve('EN');
                    }else if(lan=='fr'){
                        tmhDynamicLocale.set('fr-ca');
                        $translate.use('fr');
                        //window.localStorage.setItem('Language','FR');
                        r.resolve('FR');
                    }else{
                        tmhDynamicLocale.set('en-cs');
                        $translate.use('en');
                        //window.localStorage.setItem('Language','EN');
                        r.resolve('EN');
                    }
                },function(error){
                    tmhDynamicLocale.set('en-cs');
                    $translate.use('en');
                    //window.localStorage.setItem('Language','EN');
                    r.reject({error:error});
                });
            }else{
                if(lan == 'en')
                {
                    tmhDynamicLocale.set('en-ca');
                    $translate.use('en');
                }else{
                    tmhDynamicLocale.set('fr-ca');
                    $translate.use('fr');
                }
                language = lan.toUpperCase();
                r.resolve(language);
            }
            return r.promise;
        },
        /**
         *@ngdoc method
         *@name setLanguage
         *@methodOf MUHCApp.service:UserPreferences
         *@param {String} lan Either 'EN' or 'FR'
         *@description Setter method for patient language of preference
         **/
        setLanguage:function(lan){
            console.log(lan);
            if(lan == 'EN')
            {
                tmhDynamicLocale.set('en-ca');
                $translate.use('en');
            }else{
                tmhDynamicLocale.set('fr-ca');
                $translate.use('fr');
            }
            window.localStorage.setItem('Language', lan);
            language=lan;
        },
        /**
         *@ngdoc method
         *@name setEnableSMS
         *@methodOf MUHCApp.service:UserPreferences
         *@param {String} option Boolean value for option
         *@description Setter method for enable sms notifications option
         **/
        setEnableSMS:function(){
            return enableSMS;
        },
        getLanguage:function(){
            return language;

        },
        getEnableSMS:function(){
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
        setUserPreferences:function(preferences){
            language=preferences.Language;
            enableSMS=preferences.EnableSMS;
        },
        /**
         *@ngdoc method
         *@name clearUserPreferences
         *@methodOf MUHCApp.service:UserPreferences
         *@description Clears user preferences for logout functionality
         **/
        clearUserPreferences:function()
        {
            fontSize = '';
            calendarOption = '';
            language = '';
            enableSMS = '';
        }

    };



}]);
