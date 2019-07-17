myApp.config(fireConfig);

fireConfig.$inject = [];

/* @ngInject */
function fireConfig() {

    let config = {
        //
        // PRODUCTION
        //
        // apiKey: "AIzaSyAGBV2Zwr0SYKy_J92jceof-OFeeFmm0Gw",
        // authDomain: "opal-prod.firebaseapp.com",
        // databaseURL: "https://opal-prod.firebaseio.com",
        // projectId: "opal-prod",
        // storageBucket: "opal-prod.appspot.com",
        // messagingSenderId: "476395494069"
	//
	// Local: Tessa
	//
	apiKey:"AIzaSyBiDTeH0aRPdpnhP8w9R7pUEIIkNFhwyio",
	authDomain: "opal-7e325.firebaseapp.com",
	databaseURL:"https://opal-7e325.firebaseio.com",
	projectID: "opal-7e325",
	storageBucket: "opal-7e325.appspot.com",
	MessagingSenderId: "430304582946",


        //
        // PreProd (Dev)
        //
       /* apiKey: 'AIzaSyDUxheeBz18Qu2WhXgYGIJ2b0gWBmEYAjM',
        authDomain: 'opal-dev-64f98.firebaseapp.com',
        databaseURL: 'https://opal-dev-64f98.firebaseio.com',
        projectId: 'opal-dev-64f98',
        storageBucket: '',
        messagingSenderId: '752651575903',*/
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
}
