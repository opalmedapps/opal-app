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
        // String: the mode to use when building with Webpack: [production, development].
        webpackMode: 'development',
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
