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

    NotificationsController.$inject = ['RequestToServer','Notifications', 'NavigatorParameters', 'Permissions', '$filter'];

    /* @ngInject */
    function NotificationsController(RequestToServer, Notifications, NavigatorParameters, Permissions, $filter) {

        var vm = this;

        vm.showHeader = showHeader;
        vm.goToNotification = goToNotification;

        activate();

        ///////////////////////////

        function activate(){
            Notifications.requestAllNotifications()
                .then(function () {
                    vm.noNotifications = true;
                    var notifications = Notifications.getUserNotifications();
                    if (notifications.length > 0)  vm.noNotifications = false;
                    notifications = Notifications.setNotificationsLanguage(notifications);
                    vm.notifications = $filter('orderBy')(notifications,'notifications.DateAdded', true);
                    Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'Storage access disabled. Unable to write documents.');
                })
                .catch(function () {
                    vm.noNotifications = true;
                })
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