// SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('RelationshipTypeController', RelationshipTypeController);

        RelationshipTypeController.$inject = ['$timeout', 'RequestToServer', 'Params'];

    /* @ngInject */
    function RelationshipTypeController($timeout, RequestToServer, Params) {
        let vm = this;
        vm.error = null;
        vm.message = null;
        vm.errorAlertType = Params.alertTypeDanger;
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
