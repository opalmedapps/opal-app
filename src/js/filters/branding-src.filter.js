(function () {
    'use strict';

    angular
        .module('OpalApp')
        .filter('brandingSrc', BrandingSrc);

    BrandingSrc.$inject = ['Branding'];

    function BrandingSrc(Branding) {
        return (keyword) => {
            let src = Branding[keyword]?.src;
            if (!src) throw `Branding source not configured for resource '${keyword}'`;
            return src;
        }
    }
})();
