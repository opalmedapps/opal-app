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
            // Create the popover menu
            ons.createPopover('./views/personal/notifications/notifications-popover.html', {parentScope: $scope}).then(function (popover) {
                $scope.notificationsPopover = popover;
            });

            bindEvents();
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
                });
                return
            }
            notifications = Notifications.setNotificationsLanguage(notifications);

            $timeout(function() {
                vm.noNotifications = false;
                vm.notifications = $filter('orderBy')(notifications,'notifications.DateAdded', true);
            });
        }

        function goToNotification(index,notification){
            try {
                if(notification.ReadStatus==='0'){
                    //TODO: Move this read function in notifications service
                    RequestToServer.sendRequest('Read',{"Id":notification.NotificationSerNum, "Field":"Notifications"});
                    Notifications.readNotification(index,notification);
                }
                var post = (notification.hasOwnProperty('Post')) ? notification.Post : Notifications.getNotificationPost(notification);
                if (!post) throw new Error(`No post found for notification with NotificationSerNum = ${notification.NotificationSerNum}`);
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
            catch(error) {
                console.error(error);
                homeNavigator.pushPage('views/error/error-details.html', { message: "NOTIFICATION_OPEN_ERROR" });
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
