// Environment variables to be used by the app for Opal DevOps
const config = {
    name: "Opal DevOps",
    env: "devops",
    settings: {
        constantsFileURL: "https://www.depdocs.com/opal/constants/constants.php",
        dynamicContentFileURL: "https://www.depdocs.com/opal/links/links_1.11.5.php",
        kickOutConcurrentUsers: false,
        messageOfTheDayKey: "devops_service",
        showVersionOnInit: true,
        useRealInstitutionNames: false,
        useSourceMap: true,
        screenshotsAllowed: true,
        webpackMode: "development",
    },
    configXml: {
        "APP_ID": "com.hig.opaldevops",
        "APP_NAME": "Opal DevOps",
        "BUILD_NUMBER": 1,
        "ANDROID_DEBUGGABLE": true,
    },
    firebase: {
        apiKey: "AIzaSyByrNj-KIObJ4nsDaSE2FodRr2FTct1Zs8",
        authDomain: "opal-4b64ac.firebaseapp.com",
        databaseURL: "https://opal-4b64ac-default-rtdb.firebaseio.com",
        projectId: "opal-4b64ac",
        storageBucket: "opal-4b64ac.appspot.com",
        messagingSenderId: "879923913514",
        appId: "1:879923913514:web:c39dbd88bdbe91e2d53453"
    },
};

module.exports = config;
