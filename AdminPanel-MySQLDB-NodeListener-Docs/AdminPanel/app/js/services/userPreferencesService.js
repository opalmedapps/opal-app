var myApp=angular.module('MUHCApp');
//This service will have the user preferences for language and sent sms feature. To be used in account settings.
myApp.service('UserPreferences', function(){
    return{
        setNativeCalendarOption:function(calendarOption){
            if(calendarOption){
                this.calendarOption=calendarOption;
            }
        },
        getNativeCalendarOption:function(){
            return this.calendarOption;
        },
        setLanguage:function(lan){
            this.Language=lan;
        },
        setEnableSMS:function(){
            return this.EnableSMS;
        },
        getLanguage:function(){
            return this.Language;

        },
        getEnableSMS:function(){
            return this.EnableSMS;
        },
        setUserPreferences:function(lan, smsPreference){
            this.Language=lan;
            this.EnableSMS=smsPreference;
        }

    }



});