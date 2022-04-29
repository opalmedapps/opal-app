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

    NotificationsController.$inject = ['RequestToServer','Notifications', 'NavigatorParameters', 'Permissions',
        '$filter', '$timeout', '$scope'];

    /* @ngInject */
    function NotificationsController(RequestToServer, Notifications, NavigatorParameters, Permissions, $filter,
                                     $timeout, $scope) {
        var vm = this;

        vm.goToNotification = goToNotification;

        // Popover variables
        $scope.notificationsPopover = undefined;
        $scope.markAllRead = markAllRead;

        // Used by patient-data-handler
        vm.displayNotifications = displayNotifications;

        activate();

        ///////////////////////////

        function activate(){
            vm.isLoading = true;

            // Create the popover menu
            ons.createPopover('./views/personal/notifications/notifications-popover.html', {parentScope: $scope}).then(function (popover) {
                $scope.notificationsPopover = popover;
            });

            bindEvents();

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

        function bindEvents() {
            $scope.$on('$destroy', function () {
                $scope.notificationsPopover.destroy();
            });
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

        function goToNotification(index,notification){
            if(notification.ReadStatus==='0'){
                //TODO: Move this read function in notifications service
                RequestToServer.sendRequest('Read',{"Id":notification.NotificationSerNum, "Field":"Notifications"});
                Notifications.readNotification(index,notification);
            }
            var post = (notification.hasOwnProperty('Post')) ? notification.Post : Notifications.getNotificationPost(notification);
            if(notification.hasOwnProperty('PageUrl'))
            {
                NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':post});
                homeNavigator.pushPage(notification.PageUrl);
            }else{
                var result = Notifications.goToPost(notification.NotificationType, post);
                if(result !== -1  )
                {
                    NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':post});
                    homeNavigator.pushPage(result.Url);
                }
            }
        }

        /**
         * @description Marks all unread notifications as read.
         */
        function markAllRead() {
            Notifications.markAllRead();
            $scope.notificationsPopover.hide();
            displayNotifications();
        }
    }
})();
