//TODO: DELETE THIS AND COMBINE WITH CONTACTS PAGE ONCE DATABASE SUPPORT IS THERE}
(function() {
'use strict';

    angular
        .module('MUHCApp')
        .controller('PfpContactsController', PfpContactsController);

    PfpContactsController.$inject = ['DynamicContentService','NavigatorParameters','RequestToServer'];
    function PfpContactsController(DynamicContentService,NavigatorParameters,RequestToServer) {
        var vm = this;
       vm.title = 'PfpContactsController';
       vm.navigator = NavigatorParameters.getNavigator();
        activate();

        ////////////////

        function activate() { 
            RequestToServer.sendRequestWithResponse('PatientCommitteMembers')
            .then(function (response) {
                if (response.Code == '3') {
                    vm.contacts = response.Data;
                }
            })
            .catch(function (error) 
            {
                console.log(error);
            });
                
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