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
 *@name MUHCApp.service:Announcements
 *@requires $filter
 *@requires MUHCApp.service:RequestToServer
 *@requires MUHCApp.service:UserPreferences
 *@description Service that handles the adding and updating of a User's announcements and provides API for controllers to grab the necessary information
 **/
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Announcements', Announcements);

    Announcements.$inject = ['RequestToServer','$filter', 'UserPreferences'];

    /* @ngInject */
    function Announcements(RequestToServer,$filter, UserPreferences) {

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#announcements
         *@propertyOf MUHCApp.service:Announcements
         *@description Initializing array that represents all the information for Announcements, this array is passed to
         *the appropriate controllers.
         **/
        var announcements=[];

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#lastUpdated
         *@propertyOf MUHCApp.service:Announcements
         *@description Represents the last time the announcements array was updated
         **/
        var lastUpdated = 0;

        return {
            setAnnouncements: setAnnouncements,
            updateAnnouncements: updateAnnouncements,
            getAnnouncements: getAnnouncements,
            getUnreadAnnouncements: getUnreadAnnouncements,
            getNumberUnreadAnnouncements: getNumberUnreadAnnouncements,
            getAnnouncementBySerNum: getAnnouncementBySerNum,
            readAnnouncementBySerNum: readAnnouncementBySerNum,
            readAnnouncement: readAnnouncement,
            setLanguage: setLanguage,
            getAnnouncementUrl: getAnnouncementUrl,
            clearAnnouncements: clearAnnouncements,
            getLastUpdated: getLastUpdated
        };

        ////////////////////////////////////////////////////////////////////
        /******************************
         *  PRIVATE FUNCTIONS
         ******************************/

        /**
         *@ngdoc function
         *@name  MUHCApp.service.#findAndDeleteAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@description When there is an update, find the matching message and delete it to avoid repeated announcements
         **/
        function findAndDeleteAnnouncements(array)
        {
            for (var i = 0; i <array.length; i++) {
                for (var j = 0; j < announcements.length; j++) {
                    if (array.length > 0) {    // array.length shrinks everytime it is "spliced" in the line below.
                        if (announcements[j].AnnouncementSerNum === array[i].AnnouncementSerNum) {
                            array.splice(i, 1);
                        }
                    }
                }
            }
        }

        /**
         *@ngdoc function
         *@name  MUHCApp.service.#addAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@description Push new announcements to currently existing announcements array
         **/
        function addAnnouncements(array)
        {
            if(!array) return;
            if (array[0] === "undefined") {
                // console.log ('array undefined');
                return;
            }

            for (var i = 0; i < array.length; i++) {
                array[i].DateAdded=$filter('formatDate')(array[i].DateAdded);
                announcements.push(array[i]);
            }
        }

        /**
         * @description Filter out duplicate announcements using 'PostControlSerNum' to only display announcement one time for multiple patients
         * @param {object} originalArray - Array containing duplicate values
         * @returns 
         */
        function filterOutDuplicateValue(originalArray) {
            let filteredArray = [];
            originalArray.forEach((originalItem) => {
                if (filteredArray.length === 0) {
                    filteredArray.push(originalItem);
                } else {
                    let exist = filteredArray.find((filteredItem) => {
                        return originalItem.PostControlSerNum === filteredItem.PostControlSerNum;
                    });
                    if (!exist) filteredArray.push(originalItem);
                }
            });

            return filteredArray;
        }


        /******************************
         *  PUBLIC FUNCTIONS
         ******************************/

        /**
         *@ngdoc method
         *@name setAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@param {Array} array announcements array that containts the new announcements
         *@description Setter method for announcements
         **/
        function setAnnouncements(array)
        {
            announcements=[];
            lastUpdated = Date.now();
            let filteredDuplicate = filterOutDuplicateValue(array);
            addAnnouncements(filteredDuplicate);
        }

        /**
         *@ngdoc method
         *@name updateAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@param {Array} array new announcements array
         *@description Updates the announcementsArray with the new information contained in the announcement parameter.
         * Will replace out-of-date announcements.
         **/
        function updateAnnouncements(array)
        {
            let filteredDuplicate = filterOutDuplicateValue(array);
            addAnnouncements(findAndDeleteAnnouncements(filteredDuplicate));
        }

        /**
         *@ngdoc method
         *@name getAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@description Getter for the announcementsArray
         *@returns {Array} announcementsArray
         **/
        function getAnnouncements()
        {
            return announcements;
        }

        /**
         *@ngdoc method
         *@name getUnreadAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@description Gets unread announcements
         *@returns {Array} Returns all the unread annoucements
         **/
        function getUnreadAnnouncements()
        {
            var array=[];
            for (var i = 0; i < announcements.length; i++) {
                if(announcements[i].ReadStatus === '0')
                {
                    array.push(announcements[i]);
                }
            }
            return array;
        }

        /**
         *@ngdoc method
         *@name getNumberUnreadAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@description Iterates through array object and returns the number of unread announcements
         *@returns {Number} Returns number of unread news
         **/
        function getNumberUnreadAnnouncements()
        {
            var number = 0;
            for (var i = 0; i < announcements.length; i++) {
                if(announcements[i].ReadStatus === '0') number++;
            }
            return number;
        }

        /**
         *@ngdoc method
         *@name getAnnouncementBySerNum
         *@methodOf MUHCApp.service:Announcements
         *@param {String} serNum AnnouncementSerNum to be looked for
         *@description Iterates through the annoucements array and returns annoucement object matching the serNum
         *@returns {Object} Returns object containing annoucement
         **/
        function getAnnouncementBySerNum(serNum) {
            // console.log(announcements);

            for (var i = 0; i < announcements.length; i++) {
                if(announcements[i].AnnouncementSerNum===serNum) {
                    return angular.copy(announcements[i]);
                }
            }
        }

        /**
         *@ngdoc method
         *@name readAnnouncementBySerNum
         *@methodOf MUHCApp.service:Announcements
         *@param {String} serNum AnnouncementSerNum to be read
         *@description Sets ReadStatus in announcement to 1, sends request to backend
         **/
        function readAnnouncementBySerNum(serNum)
        {
            for (var i = 0; i < announcements.length; i++) {
                if(announcements[i].AnnouncementSerNum===serNum)
                {
                    announcements[i].ReadStatus = '1';
                    RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Announcements'});
                    break;
                }
            }
        }

        /**
         *@ngdoc method
         *@name readAnnouncement
         *@methodOf MUHCApp.service:Announcements
         *@param {String} index index in the annoucement array to be read
         *@param {String} serNum AnnouncementSerNum to be read
         *@description Faster method to read an announcement, no iteration required.
         **/
        function readAnnouncement(index, serNum)
        {
            announcements[index].ReadStatus = '1';
            RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Announcements'});
        }

        /**
         *@ngdoc method
         *@name setLanguage
         *@methodOf MUHCApp.service:Announcements
         *@param {Array} item Array or object with announcements
         *@description Translates the array parameter containing announcements to appropiate preferred language specified in {@link MUHCApp.service:UserPreferences UserPreferences}.
         *@returns {Array} Returns array with translated values
         **/
        function setLanguage(item)
        {
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
         *@name getAnnouncementUrl
         *@methodOf MUHCApp.service:Announcements
         *@description Returns announcements url to be used by the {@link MUHCApp.service:Notifications Notifications Service}.
         *@returns {String} Returns Url for individual annoucements
         **/
        function getAnnouncementUrl()
        {
            return './views/general/announcements/individual-announcement.html';
        }

        /**
         *@ngdoc method
         *@name clearAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@description Clears the service of any saved state, function used by the {@link MUHCApp.controller:LogoutController LogoutController}
         **/
        function clearAnnouncements()
        {
            announcements=[];
            lastUpdated = 0;
        }

        /**
         *@ngdoc method
         *@name getLastUpdated
         *@methodOf MUHCApp.service:Announcements
         *@description Returns the date of when the announcements array was last updated
         **/
        function getLastUpdated() {
            return lastUpdated;
        }
    }
})();
