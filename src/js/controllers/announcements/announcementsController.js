/*
 * Filename     :   announcementsController.js
 * Description  :   This file controls the announcements view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *  @ngdoc controller
 *  @name MUHCApp.controllers: AnnouncementsController
 *  @description
 *
 *  Manages the announcements list view. It simply guides the user to the correct individual announcement for a more detailed view of the announcement
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('AnnouncementsController', AnnouncementsController);

    AnnouncementsController.$inject = [
        'Announcements',
        'NavigatorParameters',
        '$scope',
        '$filter'
    ];

    /* @ngInject */
    function AnnouncementsController(
        Announcements,
        NavigatorParameters,
        $scope,
        $filter
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
         * @methodOf MUHCApp.controllers.AnnouncementsController
         * @param announcement Announcement Object
         * @description
         * Takes the user to the specified announcement to be viewed in more detail
         */
        function goToAnnouncement(announcement) {
            if(announcement.ReadStatus === '0')
            {
                announcement.ReadStatus = '1';
                Announcements.readAnnouncementBySerNum(announcement.AnnouncementSerNum);
            }
            NavigatorParameters.setParameters({Navigator:'generalNavigator', Post: announcement});
            $scope.generalNavigator.pushPage('./views/general/announcements/individual-announcement.html');
        }
    }
})();


