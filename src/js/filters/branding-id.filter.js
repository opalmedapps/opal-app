(function () {
    'use strict';

    angular
        .module('OpalApp')
        .filter('brandingId', BrandingId);

    BrandingId.$inject = ['Branding'];

    function BrandingId(Branding) {
        return (keyword) => {
            let id = Branding[keyword]?.id;
            if (!id) throw `Branding id not configured for resource '${keyword}'`;
            return id;
        }
    }
})();
