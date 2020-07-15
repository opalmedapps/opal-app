(function() {
    'use strict';
    angular
        .module('MUHCApp')
        .controller('ReferenceMaterialController', ReferenceMaterialController);

    ReferenceMaterialController.$inject = ['NavigatorParameters', 'UserPreferences'];

    /* @ngInject */
    function ReferenceMaterialController(NavigatorParameters, UserPreferences)
    {
        var vm = this;
        let navigator = null;
        let navigatorName = '';

        // Variable containing the search string entered into the search bar
        vm.searchString = "";

        // Variable to toggle visibility of the 'no materials' text. Default is false to avoid errors.
        vm.noMaterials = false;


        // TODO: Add search functionality (see src/js/directives/search-bar.firective.js)
        
        activate();

        ///////////////////////////////////////////////////////////////////////////////////
        function activate() {
            // Initialize the navigator for push and pop of pages.
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
        }

        // TODO: Add functionality
    }

})();
