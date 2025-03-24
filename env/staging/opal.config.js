// Environment variables to be used by the app for Opal Staging
const config = {
    name: "Opal Staging",
    env: "staging",
    settings: {
        kickOutConcurrentUsers: true,
        messageOfTheDayKey: "staging_service",
        showVersionOnInit: true,
        useSourceMap: true,
        screenshotsAllowed: false,
        webpackMode: "development",
    },
    configXml: {
        "APP_ID": "com.hig.opalstaging",
        "APP_NAME": "Opal Staging",
        "BUILD_NUMBER": 1,
        "ANDROID_DEBUGGABLE": true,
    },
    firebase: {
        apiKey: "AIzaSyAr_Lrr4xQyF-zmSEf3c2iHkYN87eISV-8",
        authDomain: "opal-5c4f26.firebaseapp.com",
        databaseURL: "https://opal-5c4f26-default-rtdb.firebaseio.com",
        projectId: "opal-5c4f26",
        storageBucket: "opal-5c4f26.appspot.com",
        messagingSenderId: "908828898055",
        appId: "1:908828898055:web:6333f319543349c1a10ba2"
    },
};

module.exports = config;
