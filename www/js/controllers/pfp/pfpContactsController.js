//TODO: DELETE THIS AND COMBINE WITH CONTACTS PAGE ONCE DATABASE SUPPORT IS THERE}
(function() {
'use strict';

    angular
        .module('MUHCApp')
        .controller('PfpContactsController', PfpContactsController);

    PfpContactsController.$inject = ['DynamicContentService','NavigatorParameters','RequestToServer','NativeNotification','$filter','Pfp'];
    function PfpContactsController(DynamicContentService,NavigatorParameters,RequestToServer,NativeNotification,$filter,Pfp) {
        var vm = this;
       vm.title = 'PfpContactsController';
       vm.navigator = NavigatorParameters.getNavigator();
       vm.loading = true;
        activate();

        ////////////////

        function activate() {
            if(Pfp.areContactsEmpty())
            {
                RequestToServer.sendRequestWithResponse('PatientCommitteMembers')
                .then(function (response) {

                    if (response.Code == '3') {
                        vm.loading  = false;
                        Pfp.setContacts(response.Data);
                        vm.contacts = response.Data;
                    }
                })
                .catch(function (error) 
                {
                    if(error.Code=='2')
                    {
                        NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
                    }
                });
            }else{
                vm.loading = false;
                vm.contacts = Pfp.getContacts();
            }
            
                
        }

    }
})();

