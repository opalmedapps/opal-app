// The following example is well-suited for a development environment. Check each variable carefully before using in production.
const config = {
    // The name of your app
    name: "Opal Local",
    // The name of your environment. Should match the parent folder name.
    env: "local",
    // Environment-specific settings
    settings: {
        // String: URL to the external content file that is hosted on an external server.
        // E.g., https://<YOUR-EXTERNAL-HOST>/<PATH-TO-THE-EXTERNAL-CONTENT-FILE>
        // For testing purposes (e.g., if no external server is setup), it's possible to provide a path to
        // a local configuration file (e.g., `./content/content.config.json`).
        externalContentFileURL: "./content/content.config.json",
        // Boolean: whether to kick out a user when another person logs into the same user account on another device.
        kickOutConcurrentUsers: false,
        // String: the service status URL is used to display a 'service status message' to the user when they log in.
        // Leave empty if no service status URL has been set on the external server.
        // E.g., https://<YOUR-EXTERNAL-HOST>/<PATH-TO-THE-SERVICE-STATUS>
        // For testing purposes (e.g., if no external server is setup), it's possible to provide a path to
        // a local configuration file (e.g., `./content/service-status.json`).
        serviceStatusURL: "./content/service-status.json",
        // Boolean: whether to show the app's version and build number on the front page.
        showVersionOnInit: true,
        // Boolean: whether to use real (production-ready) institution names and acronyms (such as "RI-MUHC"). If false, generic names are used.
        useRealInstitutionNames: false,
        // Boolean: whether to use a sourcemap when building the web code. Should be false in production.
        useSourceMap: true,
        // Boolean: whether screenshots can be taken in the app. Should be false in production.
        screenshotsAllowed: true,
        // String: the mode to use when building with Webpack: [production, development].
        webpackMode: "development",
    },
    // Placeholders that are inserted into config.xml when building the app
    configXml: {
        // String: app ID (usually starts with `com.`); must match the value used in Firebase App Distribution or in the app stores.
        "APP_ID": "",
        // String: the display name of the app when installed on a device.
        "APP_NAME": "Opal Local",
        // Integer: the build number shown in brackets after the app's version number. Must always increase for consecutive store uploads.
        "BUILD_NUMBER": 1,
        // Boolean: whether the Android app is debuggable (android:debuggable). Should be false in production.
        "ANDROID_DEBUGGABLE": true,
    },
    // Firebase web configurations, with contents pasted from the Firebase Console
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
