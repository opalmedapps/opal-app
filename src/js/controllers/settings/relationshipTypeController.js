(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('RelationshipTypeController', RelationshipTypeController);

        RelationshipTypeController.$inject = ['$timeout', 'RequestToServer', 'Params'];

    /* @ngInject */
    function RelationshipTypeController($timeout, RequestToServer, Params) {
        let vm = this;
        vm.error = null;
        vm.message = null;
        vm.apiData;
        vm.relationshipTypes;

        getRelationshipTypesList();

        /**
         * @description - Get list of relationship types.
        */
        async function getRelationshipTypesList() {
            try {
                const requestParams = Params.API.ROUTES.RELATIONSHIP_TYPES;
                const result = await RequestToServer.apiRequest(requestParams);
                vm.apiData = result.data;
            } catch (error) {
                vm.error = true;
                console.error("Error fetching relationship types:", error);
            }
            handleDisplay();
        }

        
        /**
         * @description Handle display of data, not found or error message.
        */
        function handleDisplay() {
            $timeout(() => {
                if (vm.error || vm.apiData.length === 0) return vm.message = 'RELATIONSHIP_TYPES_ERROR';
                vm.relationshipTypes = vm.apiData;
            });
        }
    }

})();
