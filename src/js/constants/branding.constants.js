(function () {
    'use strict';

    angular
        .module('OpalApp')
        .constant('Branding', {
            // INIT PAGE
            'init-background': {
                id: 'init-background',
                src: 'branding/opal/init-background.jpg',
            },
            'init-logo': {
                id: 'init-logo',
                src: 'branding/opal/Opal_Name_Logo_Transparent.png',
            },
        });
})();
