// Environment variables to be used by the app for Opal Demo
const config = {
    name: "Opal Demo",
    env: "demo",
    settings: {
        constantsFileURL: "https://www.depdocs.com/opal/constants/constants.php",
        dynamicContentFileURL: "https://www.depdocs.com/opal/links/links_1.11.5.php",
        kickOutConcurrentUsers: false,
        messageOfTheDayKey: "demo_service",
        showVersionOnInit: true,
        useRealInstitutionNames: false,
        useSourceMap: true,
        screenshotsAllowed: true,
        webpackMode: "development",
    },
    configXml: {
        "APP_ID": "com.hig.opaldemo",
        "APP_NAME": "Opal Demo",
        "BUILD_NUMBER": 1,
        "ANDROID_DEBUGGABLE": true,
    },
    firebase: {
        apiKey: "AIzaSyDuG5sAQ2tmiVanDnBg9ff3FRATI9Eis8U",
        authDomain: "opal-3a1a23.firebaseapp.com",
        databaseURL: "https://opal-3a1a23-default-rtdb.firebaseio.com",
        projectId: "opal-3a1a23",
        storageBucket: "opal-3a1a23.appspot.com",
        messagingSenderId: "391932120299",
        appId: "1:391932120299:web:f8ae1af68008b44fd682ae"
    },
};

module.exports = config;
