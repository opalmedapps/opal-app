/*
 * Filename     :   announcementController.js
 * Description  :   Manages the individual announcement view
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *  @ngdoc controller
 *  @name MUHCApp.controllers: IndividualAnnouncementController
 *  @description
 *
 *  Manages the individual announcement view. No public functions exist on this controller, it simply activate and renders the necessary announcement object
 */
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
            vm.announcement = Announcements.setLanguage(parameters.Post);
            Logger.sendLog('Announcement', message.AnnouncementSerNum);
        }
    }
})();