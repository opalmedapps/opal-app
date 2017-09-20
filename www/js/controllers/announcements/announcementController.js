/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-08-09
 * Time: 10:40 AM
 */

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