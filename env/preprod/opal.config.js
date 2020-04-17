// Environment variables to be used by the app for Opal Pre Prod
const config = {
    name: "Opal Pre Prod",
    stage: "preprod",
    firebase:{
        apiKey: "AIzaSyAGBV2Zwr0SYKy_J92jceof-OFeeFmm0Gw",
        authDomain: "opal-prod.firebaseapp.com",
        databaseURL: "https://opal-prod.firebaseio.com",
        projectId: "opal-prod",
        storageBucket: "opal-prod.appspot.com",
        messagingSenderId: "476395494069",
        appId: "1:476395494069:web:fe7854c0038a34663afcfc",
    },
    version: "1.8.7-rc",
    buildNumber: 0,
    opalProtocolURI: "opal-preprod://",
};

module.exports = config;