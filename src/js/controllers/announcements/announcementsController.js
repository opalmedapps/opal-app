// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   announcementsController.js
 * Description  :   This file controls the announcements view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 */

/**
 *  @ngdoc controller
 *  @description
 *
 *  Manages the announcements list view. It simply guides the user to the correct individual announcement for a more detailed view of the announcement
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('AnnouncementsController', AnnouncementsController);

    AnnouncementsController.$inject = [
        'Announcements',
        'Navigator',
        '$scope',
        '$filter',
        'Notifications',
        'Params'
    ];

    /* @ngInject */
    function AnnouncementsController(
        Announcements,
        Navigator,
        $scope,
        $filter,
        Notifications,
        Params
    ) {
        var vm = this;
        vm.noAnnouncements = true;
        vm.announcements = [];
        vm.goToAnnouncement = goToAnnouncement;
        // Used by patient-data-handler
        vm.setAnnouncementsView = setAnnouncementsView;

        /**
         * @description Filters and displays the announcements from the Announcements service.
         */
        function setAnnouncementsView() {
            var announcements = Announcements.getAnnouncements();
            announcements = Announcements.setLanguage(announcements);
            if (announcements.length > 0) {
                vm.noAnnouncements = false;
                vm.announcements = $filter('orderBy')(announcements, '-DateAdded');
            }
        }

        /**
         * @ngdoc method
         * @name goToAnnouncement
         * @param announcement Announcement Object
         * @description
         * Takes the user to the specified announcement to be viewed in more detail
         */
        function goToAnnouncement(announcement) {
            if(announcement.ReadStatus === '0')
            {
                Announcements.readAnnouncementBySerNum(announcement.AnnouncementSerNum);
                // Mark corresponding notifications as read
                Notifications.implicitlyMarkCachedNotificationAsRead(
                    announcement.AnnouncementSerNum,
                    [Params.NOTIFICATION_TYPES.Announcement],
                );
            }
            $scope.generalNavigator.pushPage('./views/general/announcements/individual-announcement.html', {Post: announcement});
        }
    }
})();
