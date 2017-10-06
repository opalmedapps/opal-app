
"use strict";

var Mocks = {
    $state : {
        go: function(stuff) {
            return true
        }
    },

    CleanUp : {
        clear: function(){
            return true;
        }
    },

    FirebaseService : {
        getDBRef: function(stuff){
            return { remove: function() {return true;}}
        },
        signOut: function(){
            return true
        }
    },


    RequestToServer :{
        sendRequest: function(stuff) {
            return stuff;
        }
    },


    $window : {
        navigator: {
            pushPage: function () {
                return true;
            }
        },
        localStorage: {
            getItem: function (stuff) {
                return null;
            },
            setItem: function (stuff, moreStuff) {
                return stuff;
            },
            removeItem: function (stuff) {
                return stuff
            }
        },
        sessionStorage: {
            getItem: function (stuff) {
                return null;
            },
            setItem: function (stuff, moreStuff) {
                return stuff;
            },
            removeItem: function (stuff) {
                return stuff
            }
        }
    },

    NewsBanner : {
        showCustomBanner: function(stuff){
            return true;
        }
    },

    DeviceIdentifiers : {
        sendIdentifiersToServer: function() {
            return Promise.resolve(true)
        },
        sendFirstTimeIdentifierToServer: function() {
            return Promise.resolve({securityQuestion_EN: 'this is a security question'})
        },
        sendDevicePasswordRequest: function(email) {
            return Promise.resolve({Data: {securityQuestion: { securityQuestion_EN: 'english question', securityQuestion_FR: 'french question'}}})

        }
    }

};