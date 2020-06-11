//TODO: DELETE THIS AND COMBINE WITH CONTACTS PAGE ONCE DATABASE SUPPORT IS THERE}
(function() {
'use strict';

    angular
        .module('MUHCApp')
        .controller('PfpContactsController', PfpContactsController);

    PfpContactsController.$inject = ['NavigatorParameters', '$timeout','Pfp'];
    function PfpContactsController(NavigatorParameters, $timeout, Pfp) {
        var vm = this;
        var navigator;
        activate();

        ////////////////

        function activate() {
            vm.loading = true;
            navigator = NavigatorParameters.getNavigator();
            Pfp.getContacts()
                .then(function(contacts){
                    $timeout(function(){
                        vm.loading  = false;
                        vm.contacts = contacts;
                        vm.no_contacts = vm.contacts.length === 0
                    });
                })
                .catch(function(){
                    vm.loading = false;
                    vm.contacts = [];
                    vm.no_contacts = true;
                });
        }
    }
})();

