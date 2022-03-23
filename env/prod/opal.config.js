// Environment variables to be used by the app for Opal Prod
const config = {
    name: "Opal",
    env: "prod",
    settings: {
        useSourceMap: false,
        kickOutConcurrentUsers: true,
        messageOfTheDayKey: "prod_service",
        showVersionOnInit: false,
        webpackMode: 'production',
    },
    firebase: {
        apiKey: "AIzaSyCxV6VuVWtKg5wkeReqzQNfRULwkvVXkos",
        authDomain: "brilliant-inferno-7679.firebaseapp.com",
        databaseURL: "https://brilliant-inferno-7679.firebaseio.com",
        projectId: "firebase-brilliant-inferno-767",
        storageBucket: "firebase-brilliant-inferno-767.appspot.com",
        messagingSenderId: "810896751588",
        appId: "1:810896751588:web:bcc767f3a76382042425f1",
    },
};

module.exports = config;
