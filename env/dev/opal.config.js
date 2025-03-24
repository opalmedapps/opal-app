// Environment variables to be used by the app for Opal Dev
const config = {
    name: "Opal Dev",
    env: "dev",
    settings: {
        constantsFileURL: "https://www.depdocs.com/opal/constants/constants.php",
        dynamicContentFileURL: "https://www.depdocs.com/opal/links/links_1.11.5.php",
        kickOutConcurrentUsers: false,
        messageOfTheDayKey: "dev_service",
        showVersionOnInit: true,
        useRealInstitutionNames: false,
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
        apiKey: "AIzaSyAMIDdcQR8EiY9gjj4cgxp6Vu3xwa78Ww8",
        authDomain: "opal-dev.firebaseapp.com",
        databaseURL: "https://opal-dev.firebaseio.com",
        projectId: "opal-dev",
        storageBucket: "opal-dev.appspot.com",
        messagingSenderId: "652464215237",
        appId: "1:652464215237:web:0254157de7cc10f8f94cac"
    },
};

module.exports = config;
