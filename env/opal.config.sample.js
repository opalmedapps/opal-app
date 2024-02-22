// The following example is well-suited for a development environment. Check each variable carefully before using in production.
const config = {
    // The name of your app
    name: "Opal Sample",
    // The name of your environment. Should match the parent folder name.
    env: "sample",
    // Environment-specific settings
    settings: {
        // Boolean: whether to kick out a user when another person logs into the same user account on another device.
        kickOutConcurrentUsers: false,
        // String: the key in the links file on DepDocs which contains a 'message of the day' URL for this environment. Leave empty if no message of the day URL has been set on DepDocs.
        messageOfTheDayKey: "",
        // Boolean: whether to show the app's version and build number on the front page.
        showVersionOnInit: true,
        // Boolean: whether to use a sourcemap when building the web code. Should be false in production.
        useSourceMap: true,
        // Boolean: allow the user to take the screenshots or not.
        screenshotsAllowed: true,
        // String: the mode to use when building with Webpack: [production, development].
        webpackMode: "development",
    },
    // Placeholder values that are replaced in config.xml when building the app
    configXml: {
        // String: app ID; must match the value used in Firebase App Distribution or in the app stores.
        "APP_ID": "com.hig.opalsample",
        // String: the display name of the app when installed on a device.
        "APP_NAME": "Opal Sample",
        // Integer: the build number shown in brackets after the app's version number. Prod requires a higher value for store uploads.
        "BUILD_NUMBER": 1,
        // Boolean: whether the Android app is debuggable (android:debuggable).
        "ANDROID_DEBUGGABLE": true,
    },
    // Block of Firebase web configurations, with contents pasted from the Firebase Console
    firebase: {
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
    },
};

module.exports = config;
