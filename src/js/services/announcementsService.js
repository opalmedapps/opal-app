/*
 * Filename     :   announcementsService.js
 * Description  :   angular service that controls announcements
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 *@requires $filter
 *@description Service that handles the adding and updating of a User's announcements and provides API for controllers to grab the necessary information
 **/
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Announcements', Announcements);

    Announcements.$inject = ['RequestToServer','$filter', 'UserPreferences'];

    /* @ngInject */
    function Announcements(RequestToServer,$filter, UserPreferences) {

        /**
         *@ngdoc property
         *@description Initializing array that represents all the information for Announcements, this array is passed to
         *the appropriate controllers.
         **/
        var announcements=[];

        /**
         *@ngdoc property
         *@description Represents the last time the announcements array was updated
         **/
        var lastUpdated = 0;

        return {
            setAnnouncements: setAnnouncements,
            updateAnnouncements: (array) => addAnnouncements(array),
            getAnnouncements: () => announcements,
            getAnnouncementBySerNum: getAnnouncementBySerNum,
            readAnnouncementBySerNum: readAnnouncementBySerNum,
            readAnnouncement: readAnnouncement,
            setLanguage: setLanguage,
            getAnnouncementUrl: () => './views/general/announcements/individual-announcement.html',
            clearAnnouncements: clearAnnouncements,
            getLastUpdated: () => lastUpdated,
        };

        ////////////////////////////////////////////////////////////////////
        /******************************
         *  PRIVATE FUNCTIONS
         ******************************/

        /**
         *@ngdoc function
         *@description Push new announcements to currently existing announcements array filter out duplicate for multiple patient.
         **/
        function addAnnouncements(newAnnouncements) {
            if(!newAnnouncements || newAnnouncements[0] === "undefined") return;

            newAnnouncements.forEach(announcementToInsert => {
                let existingElementIndex = announcements.findIndex(item => {
                    return item.AnnouncementSerNum === announcementToInsert.AnnouncementSerNum
                });
                announcementToInsert.DateAdded=$filter('formatDate')(announcementToInsert.DateAdded);
                existingElementIndex === -1 ? announcements.push(announcementToInsert) : announcements[existingElementIndex] = announcementToInsert;
            });
        }

        /******************************
         *  PUBLIC FUNCTIONS
         ******************************/

        /**
         *@ngdoc method
         *@name setAnnouncements
         *@param {Array} array announcements array that containts the new announcements
         *@description Setter method for announcements
         **/
        function setAnnouncements(array) {
            announcements=[];
            lastUpdated = Date.now();
            addAnnouncements(array);
        }

        /**
         *@ngdoc method
         *@name getAnnouncementBySerNum
         *@param {String} serNum AnnouncementSerNum to be looked for
         *@description Iterates through the annoucements array and returns annoucement object matching the serNum
         *@returns {Object} Returns object containing annoucement
         **/
        function getAnnouncementBySerNum(serNum) {
            for (var i = 0; i < announcements.length; i++) {
                if (announcements[i].AnnouncementSerNum===serNum) return angular.copy(announcements[i]);
            }
        }

        /**
         *@ngdoc method
         *@name readAnnouncementBySerNum
         *@param {String} serNum AnnouncementSerNum to be read
         *@description Sets ReadStatus in announcement to 1, sends request to backend
         **/
        function readAnnouncementBySerNum(serNum) {
            for (var i = 0; i < announcements.length; i++) {
                if (announcements[i].AnnouncementSerNum === serNum) {
                    announcements[i].ReadStatus = '1';
                    RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Announcements'});
                    break;
                }
            }
        }

        /**
         *@ngdoc method
         *@name readAnnouncement
         *@param {String} index index in the annoucement array to be read
         *@param {String} serNum AnnouncementSerNum to be read
         *@description Faster method to read an announcement, no iteration required.
         **/
        function readAnnouncement(index, serNum) {
            announcements[index].ReadStatus = '1';
            RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Announcements'});
        }

        /**
         *@ngdoc method
         *@name setLanguage
         *@param {Array} item Array or object with announcements
         *@description Translates the array parameter containing announcements to appropriate preferred language specified in {@link OpalApp.service:UserPreferences UserPreferences}.
         *@returns {Array} Returns array with translated values
         **/
        function setLanguage(item) {
            var language = UserPreferences.getLanguage();
            if (Array.isArray( item )) {
                for (var i = 0; i < item.length; i++) {
                    //set language
                    item[i].Title = (language === 'EN')? item[i].PostName_EN : item[i].PostName_FR;
                    item[i].Body = (language === 'EN')? item[i].Body_EN : item[i].Body_FR;
                }
            }else{
                //set language if string
                item.Title = (language ==='EN')? item.PostName_EN : item.PostName_FR;
                item.Body = (language === 'EN')? item.Body_EN: item.Body_FR;
            }

            return item;
        }

        /**
         *@ngdoc method
         *@name clearAnnouncements
         *@description Clears the service of any saved state, function used by the {@link OpalApp.controller:LogoutController LogoutController}
         **/
        function clearAnnouncements()
        {
            announcements=[];
            lastUpdated = 0;
        }
    }
})();
