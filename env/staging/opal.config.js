// Environment variables to be used by the app for Opal Staging
const config = {
    name: "Opal Staging",
    env: "staging",
    settings: {
        useSourceMap: false,
        kickOutConcurrentUsers: false,
        messageOfTheDayKey: "staging_service",
        showVersionOnInit: true,
        webpackMode: 'development',
    },
    firebase: {
        apiKey: "AIzaSyAMIDdcQR8EiY9gjj4cgxp6Vu3xwa78Ww8",
        authDomain: "opal-dev.firebaseapp.com",
        databaseURL: "https://opal-dev.firebaseio.com",
        projectId: "opal-dev",
        storageBucket: "opal-dev.appspot.com",
        messagingSenderId: "652464215237",
        appId: "1:652464215237:web:0254157de7cc10f8f94cac",
    },
};

module.exports = config;
