// Environment variables to be used by the app for Opal Dev
const config = {
    name: "Opal Dev",
    env: "dev",
    settings: {
        kickOutConcurrentUsers: false,
        messageOfTheDayKey: "",
        showVersionOnInit: true,
        useSourceMap: true,
        screenshotsAllowed: true,
        webpackMode: 'development',
    },
    firebase: {
        apiKey: "AIzaSyC_2PJUxJlGTd16BmuRxCiPEq3mGLYq2m8",
        authDomain: "opal-registration-beta.firebaseapp.com",
        databaseURL: "https://opal-registration-beta.firebaseio.com",
        projectId: "opal-registration-beta",
        storageBucket: "opal-registration-beta.appspot.com",
        messagingSenderId: "452605759067",
        appId: "1:452605759067:web:b372ac4ea85be458e7797e",
    },
};

module.exports = config;
