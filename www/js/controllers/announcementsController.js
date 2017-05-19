/*
 * Filename     :   announcementsController.js
 * Description  :   This file controls the announcements view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('AnnouncementsController', AnnouncementsController);

    AnnouncementsController.$inject = [
        'Announcements',
        'NavigatorParameters',
        'Logger'
    ];

    /* @ngInject */
    function AnnouncementsController(
        Announcements,
        NavigatorParameters,
        Logger
    ) {
        var vm = this;
        vm.title = 'AnnouncementsController';
        vm.noAnnouncements = true;
        vm.announcements = [];

        vm.goToAnnouncement = goToAnnouncement;
        vm.showHeader = showHeader;

        activate();

        ////////////////

        function activate() {
            var announcements = Announcements.getAnnouncements();
            announcements = Announcements.setLanguageAnnouncements(announcements);
            if (announcements.length>0) vm.noAnnouncements = false;
            else{
                announcements.sort(function(a, b) {
                    return new Date(a.DateAdded) - new Date(b.DateAdded);
                });
            }

            vm.announcements=announcements;

            Logger.sendLog('Announcement', 'all');
        }

        function goToAnnouncement(announcement) {
            if(announcement.ReadStatus === '0')
            {
                announcement.ReadStatus = '1';
                Announcements.readAnnouncementBySerNum(announcement.AnnouncementSerNum);
            }
            NavigatorParameters.setParameters({Navigator:'generalNavigator', Post: announcement});
            generalNavigator.pushPage('./views/general/announcements/individual-announcement.html');
        }

        // Determines whether or not to show the date header in the view. Announcements are grouped by day.
        function showHeader(index) {
            if (index === 0) return true;

            var current = (new Date(vm.announcements[index].DateAdded)).setHours(0,0,0,0);
            var previous =(new Date(vm.announcements[index-1].DateAdded)).setHours(0,0,0,0);

            return current !== previous;
        }

    }

})();

// Manages the individual announcement view
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualAnnouncementController', IndividualAnnouncementController);

    IndividualAnnouncementController.$inject = [
        'NavigatorParameters',
        'Announcements',
        'Logger'
    ];

    /* @ngInject */
    function IndividualAnnouncementController(
        NavigatorParameters,
        Announcements,
        Logger
    ) {
        var vm = this;
        vm.title = 'IndividualAnnouncementController';
        vm.announcement = '';

        activate();

        ////////////////

        function activate() {
            var parameters=NavigatorParameters.getParameters();
            var message = Announcements.setLanguageAnnouncements(parameters.Post);
            vm.announcement=message;
            Logger.sendLog('Announcement', message.AnnouncementSerNum);
        }
    }

})();
