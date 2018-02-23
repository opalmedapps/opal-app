/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('NotificationsController', NotificationsController);

    NotificationsController.$inject = ['RequestToServer','Notifications', 'NavigatorParameters', 'Permissions', '$filter', '$timeout'];

    /* @ngInject */
    function NotificationsController(RequestToServer, Notifications, NavigatorParameters, Permissions, $filter, $timeout) {

        var vm = this;

        vm.showHeader = showHeader;
        vm.goToNotification = goToNotification;


        activate();

        ///////////////////////////

        function activate(){
            vm.isLoading = true;
            // TODO: OPTIMIZE THIS... THIS SHOULD BE A BACKGROUND UPDATE THAT SILENTLY UPDATES THE LIST INSTEAD OF DOING A COMPLETE REFRESH
            Notifications.requestNewNotifications()
                .then(function () {
                   displayNotifications();
                })
                .catch(function (error) {
                    console.log(error);
                    if(Notifications.getUserNotifications().length === 0){
                        // Display error message
                    } else {
                        displayNotifications()
                    }
                })
        }

        function displayNotifications(){
            var notifications = Notifications.getUserNotifications();

            if (notifications.length === 0)  {
                $timeout(function() {
                    vm.noNotifications = true;
                    vm.isLoading = false;
                });
                return
            }
            notifications = Notifications.setNotificationsLanguage(notifications);

            $timeout(function() {
                vm.noNotifications = false;
                vm.isLoading = false;
                vm.notifications = $filter('orderBy')(notifications,'notifications.DateAdded', true);
            });
        }

        function showHeader(index){
            if (index === 0){
                return true;
            }
            else {
                var previous = (new Date(vm.notifications[index-1].DateAdded)).setHours(0,0,0,0);
                var current = (new Date(vm.notifications[index].DateAdded)).setHours(0,0,0,0);
                return (current !== previous);
            }
        }

        function goToNotification(index,notification){
            if(notification.ReadStatus==='0'){
                //TODO: Move this read function in notifications service
                RequestToServer.sendRequest('Read',{"Id":notification.NotificationSerNum, "Field":"Notifications"});
                Notifications.readNotification(index,notification);
            }
            var post = (notification.hasOwnProperty('Post')) ? notification.Post : Notifications.getNotificationPost(notification);
            if(notification.hasOwnProperty('PageUrl'))
            {
                NavigatorParameters.setParameters({'Navigator':'personalNavigator', 'Post':post});
                personalNavigator.pushPage(notification.PageUrl);
            }else{
                var result = Notifications.goToPost(notification.NotificationType, post);
                if(result !== -1  )
                {
                    NavigatorParameters.setParameters({'Navigator':'personalNavigator', 'Post':post});
                    personalNavigator.pushPage(result.Url);
                }
            }
        }
    }
})();