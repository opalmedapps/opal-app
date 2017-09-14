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

(function() {
'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualContactsController', IndividualContactsController);

    IndividualContactsController.$inject = ['NavigatorParameters','UserPreferences','$timeout'];
    function IndividualContactsController(NavigatorParameters,UserPreferences,$timeout) {
        var vm = this;
        vm.contacts;
        vm.currentIndex;
        vm.contact;
        vm.language;
        vm.carousel;
        vm.goNext = goNext;
        vm.goBack = goBack;
        activate();

        ////////////////

        function activate() {
            var nav = NavigatorParameters.getNavigator();
            vm.contacts = nav.getCurrentPage().options.contacts;
            vm.currentIndex = nav.getCurrentPage().options.index;
            vm.language = UserPreferences.getLanguage();
            document.addEventListener('ons-carousel:init',initCarouselEvent);
         }
         
          function initCarouselEvent(e) {
              $timeout(function()
              {
                vm.carousel = e.component;
                vm.carousel.setActiveCarouselItemIndex(vm.currentIndex);
                vm.carousel.on('postchange',postChangeCarouseIndex);
              });
            
            
          }
          /**
         * Function handlers for advancing with the carousel
         */
        function goNext() {
            if (vm.currentIndex < vm.contacts.length - 1) {
                vm.currentIndex++;
                vm.carousel.setActiveCarouselItemIndex(vm.currentIndex);
            }
        }
        function goBack() {
            if (vm.currentIndex > 0) {
                vm.currentIndex--;
                vm.carousel.setActiveCarouselItemIndex(vm.currentIndex);
            }

        }
        function postChangeCarouseIndex(event)
        {
            $timeout(function()
            {
            vm.currentIndex = event.activeIndex;
            });
        }
        vm.$onDestroy = function () {
            document.removeEventListener('ons-carousel:init',initCarouselEvent);
            vm.carousel.off('postchange');
        };
    }
})();