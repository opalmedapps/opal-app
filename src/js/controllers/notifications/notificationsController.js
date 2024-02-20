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

    NotificationsController.$inject = ['$filter','$scope','$timeout','NativeNotification','NavigatorParameters',
        'Notifications','Permissions','ProfileSelector', 'RequestToServer', 'UpdateUI', 'Utility'];

    /* @ngInject */
    function NotificationsController($filter, $scope, $timeout, NativeNotification, NavigatorParameters,
                                     Notifications, Permissions, ProfileSelector, RequestToServer, UpdateUI, Utility) {
        let vm = this;
        let navigator;

        /**
         * @desc Variable used to show a loading wheel while the target of a notification is loading.
         * @type {boolean}
         */
        vm.loading = false;

        vm.goToNotification = goToNotification;

        // Popover variables
        $scope.notificationsPopover = undefined;
        $scope.markAllRead = markAllRead;

        // Used by patient-data-handler
        vm.displayNotifications = displayNotifications;

        activate();

        ///////////////////////////

        function activate(){
            navigator = NavigatorParameters.getNavigator();

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

        /**
         * @desc Upon clicking on a notification, navigates to the display page for the notification's target item.
         *       For example, upon clicking on an appointment notification, displays the page for that appointment.
         *       If it's not available yet, the target item for the notification is downloaded from the listener.
         * @param {number} index The index of the notification.
         * @param {Object} notification The notification that was clicked on.
         * @returns {Promise<void>} Resolves when the notification is done opening, or rejects with an error.
         *                          If the target item needs to be downloaded, vm.loading is set to true for the duration.
         */
        async function goToNotification(index, notification) {
            try {
                let params = { 'Navigator': 'homeNavigator' };
                // By clicking on the notification for a patient in care should switch the profile behind the scenes
                if (ProfileSelector.getActiveProfile().patient_legacy_id !== notification.PatientSerNum) {
                    params['isCareReceiver'] = true;
                    params['currentProfile'] = ProfileSelector.getActiveProfile().patient_legacy_id;
                    ProfileSelector.loadPatientProfile(notification.PatientSerNum);

                    // Special case for the lab results notifications: reload labs in case they were already loaded.
                    // It's necessary because the notification redirects to the "Lab Results" page that lists all labs,
                    // and it's possible that they were already loaded and cached.
                    if (notification.NotificationType === "NewLabResult")
                        UpdateUI.updateTimestamps(notification.refreshType, 0);
                }

                if (!notification.hasOwnProperty('PageUrl')) throw new Error("Notification does not have property 'PageUrl'; unable to open");
                let post = (notification.hasOwnProperty('Post')) ? notification.Post : Notifications.getNotificationPost(notification);

                // If the notification target (post) is not available, download it from the listener
                if (!post) {
                    $timeout(() => vm.loading = true);
                    // Set a half-second delay to make sure the loading wheel doesn't flash by too fast
                    post = await Utility.promiseMinDelay(Notifications.downloadNotificationTarget(notification), 500);
                }

                // Mark notification as read
                if (notification.ReadStatus === '0') Notifications.readNotification(index, notification);

                // Navigate to the notification target's display page
                params['Post'] = post;
                NavigatorParameters.updateParameters(params);
                navigator.pushPage(notification.PageUrl);
            }
            catch(error) {
                console.error(error);
                NativeNotification.showNotificationAlert($filter('translate')("NOTIFICATION_OPEN_ERROR"));
            }
            finally {
                $timeout(() => vm.loading = false);
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
