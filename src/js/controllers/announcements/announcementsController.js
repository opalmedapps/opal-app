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
        '$filter',
        'Announcements',
        'NavigatorParameters',
        '$scope'
    ];

    /* @ngInject */
    function AnnouncementsController(
        $filter,
        Announcements,
        NavigatorParameters,
        $scope
    ) {
        var vm = this;

        /**
         * @ngdoc property
         * @name noAnnouncements
         * @propertyOf AnnouncementController
         * @returns boolean
         * @description used by the view to display no announcement message to user if no announcements exist
         */
        vm.noAnnouncements = true;

        /**
         * @ngdoc property
         * @name announcements
         * @propertyOf AnnouncementController
         * @returns array
         * @description used by the view to display the list of existing announcements
         */
        vm.announcements = [];

        vm.goToAnnouncement = goToAnnouncement;
        vm.showHeader = showHeader;

        // Used by patient-data-initializer
        vm.setAnnouncementsView = setAnnouncementsView;

        activate();

        ////////////////

        function activate() {

        }

        /**
         * @description Filters and displays the announcements from the Announcements service.
         */
        function setAnnouncementsView() {
            var announcements = Announcements.getAnnouncements();
            announcements = Announcements.setLanguage(announcements);
            if (announcements.length>0) {
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

        /**
         * @ngdoc method
         * @name showHeader
         * @methodOf MUHCApp.controllers.AboutController
         * @param index integer representing the index of the announcement in vm.announcements
         * @return boolean
         * @description
         * Determines whether or not to show the date header in the view. Announcements are grouped by day.
         */
        function showHeader(index) {
            if (index === 0) return true;

            var current = (new Date(vm.announcements[index].DateAdded)).setHours(0,0,0,0);
            var previous =(new Date(vm.announcements[index-1].DateAdded)).setHours(0,0,0,0);

            return current !== previous;
        }
    }
})();


