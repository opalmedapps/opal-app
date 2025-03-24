// Environment variables to be used by the app for Opal Dev
const config = {
    name: "Opal Dev",
    env: "dev",
    settings: {
        kickOutConcurrentUsers: false,
        messageOfTheDayKey: "dev_service",
        showVersionOnInit: true,
        useSourceMap: true,
        screenshotsAllowed: true,
        webpackMode: "development",
    },
    configXml: {
        "APP_ID": "com.hig.opaldev2",
        "APP_NAME": "Opal Dev",
        "BUILD_NUMBER": 1,
        "ANDROID_DEBUGGABLE": true,
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
