// Environment variables to be used by the app for Opal Pre Prod
const config = {
    name: "Opal Pre Prod",
    env: "preprod",
    settings: {
        constantsFileURL: "https://www.depdocs.com/opal/constants/constants.php",
        dynamicContentFileURL: "https://www.depdocs.com/opal/links/links_1.11.5.php",
        kickOutConcurrentUsers: true,
        messageOfTheDayKey: "preprod_service",
        showVersionOnInit: true,
        useRealInstitutionNames: true,
        useSourceMap: false,
        screenshotsAllowed: false,
        webpackMode: "production",
    },
    configXml: {
        "APP_ID": "com.hig.opalpreprod",
        "APP_NAME": "Opal Pre Prod",
        "BUILD_NUMBER": 1,
        "ANDROID_DEBUGGABLE": false,
    },
    firebase: {
        apiKey: "AIzaSyAGBV2Zwr0SYKy_J92jceof-OFeeFmm0Gw",
        authDomain: "opal-prod.firebaseapp.com",
        databaseURL: "https://opal-prod.firebaseio.com",
        projectId: "opal-prod",
        storageBucket: "opal-prod.appspot.com",
        messagingSenderId: "476395494069",
        appId: "1:476395494069:web:fe7854c0038a34663afcfc",
    },
};

module.exports = config;
