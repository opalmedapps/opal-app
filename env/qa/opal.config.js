// Environment variables to be used by the app for Opal QA
const config = {
    name: "Opal QA",
    env: "qa",
    settings: {
        constantsFileURL: "https://www.depdocs.com/opal/constants/constants.php",
        dynamicContentFileURL: "https://www.depdocs.com/opal/links/links_1.11.5.php",
        kickOutConcurrentUsers: true,
        messageOfTheDayKey: "qa_service",
        showVersionOnInit: true,
        useRealInstitutionNames: false,
        useSourceMap: true,
        screenshotsAllowed: true,
        webpackMode: "development",
    },
    configXml: {
        "APP_ID": "com.hig.opalqa",
        "APP_NAME": "Opal QA",
        "BUILD_NUMBER": 1,
        "ANDROID_DEBUGGABLE": true,
    },
    firebase: {
        apiKey: "AIzaSyAH6PNhdH4_tLleCiZlesBnV5iJIPICJi4",
        authDomain: "opal-1f8d2c.firebaseapp.com",
        databaseURL: "https://opal-1f8d2c-default-rtdb.firebaseio.com",
        projectId: "opal-1f8d2c",
        storageBucket: "opal-1f8d2c.appspot.com",
        messagingSenderId: "949936769977",
        appId: "1:949936769977:web:219620b090630ad4e68468"
    },
};

module.exports = config;
