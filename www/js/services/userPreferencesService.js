var myApp=angular.module('MUHCApp');
//This service will have the user preferences for language and sent sms feature. To be used in account settings.
myApp.service('UserPreferences',[ 'UserAuthorizationInfo','$rootScope','tmhDynamicLocale','$translate','$q', function(UserAuthorizationInfo,$rootScope,tmhDynamicLocale,$translate,$q){
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    
    //Fields for user preference and authentication
    var fontSize = '';
    var calendarOption = '';
    var language = '';
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
        setNativeCalendarOption:function(option){
            if(option){
                calendarOption = option;
            }
        },
        getNativeCalendarOption:function(){
            return calendarOption;
        },
        initializeLanguage:function()
        {
            var r = $q.defer();
           var lan =  window.localStorage.getItem('Language');
           if(!lan&&app)
           {
                    navigator.globalization.getPreferredLanguage(function(success){
                        console.log(success);
                        var lan = success.value;
                        lan = lan.substring(0,2);
                        if(lan=='en')
                        {
                            tmhDynamicLocale.set('en');
                            $translate.use('en');
                            window.localStorage.setItem('Language','EN');
                            r.resolve('EN');
                        }else if(lan=='fr'){
                            tmhDynamicLocale.set('fr');
                            $translate.use('fr');
                            window.localStorage.setItem('Language','FR');
                            r.resolve('FR');
                        }else{
                            tmhDynamicLocale.set('en');
                            $translate.use('en');
                            window.localStorage.setItem('Language','EN');
                            r.reject({error:'Neither english or french'});
                        }
                    },function(error){
                        tmhDynamicLocale.set('en');
                        $translate.use('en');
                        window.localStorage.setItem('Language','EN');
                        r.reject({error:error});
                    });
           }else{
            if(lan == 'EN')
            {
                tmhDynamicLocale.set('en');
                $translate.use('en');
            }else{
                tmhDynamicLocale.set('fr');
                $translate.use('fr');
            }
            language = lan;
            r.resolve(lan);
           }
           return r.promise;
        },
        setLanguage:function(lan){
            console.log(lan);
             if(lan == 'EN')
            {
                tmhDynamicLocale.set('en');
                $translate.use('en');
            }else{
                tmhDynamicLocale.set('fr');
                $translate.use('fr');
            }
            window.localStorage.setItem('Language', lan);
            language=lan;
        },
        setEnableSMS:function(){
            return enableSMS;
        },
        getLanguage:function(){
            return language;

        },
        getEnableSMS:function(){
            return enableSMS;
        },
        setUserPreferences:function(preferences){
            language=preferences.Language;
            enableSMS=preferences.EnableSMS;
        },
        clearUserPreferences:function()
        {
            fontSize = '';
            calendarOption = '';
            language = '';
            enableSMS = '';
        }

    };



}]);
