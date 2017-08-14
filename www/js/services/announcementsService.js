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
 *@requires $q
 *@requires MUHCApp.service:UserPreferences
 *@requires MUHCApp.service:LocalStorage
 *@description Service that deals with the announcement information for the patient
 **/
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Announcements', Announcements);

    Announcements.$inject = ['RequestToServer','$filter','LocalStorage','UserPreferences'];

    /* @ngInject */
    function Announcements(RequestToServer,$filter, LocalStorage,UserPreferences) {

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#announcementsArray
         *@propertyOf MUHCApp.service:Announcements
         *@description Initializing array that represents all the information for Announcements, this array is passed to
         *the appropriate controllers.
         **/
        var announcementsArray=[];
        var lastUpdated = 0;

        var service = {
            setAnnouncements: setAnnouncements,
            updateAnnouncements: updateAnnouncements,
            getAnnouncements: getAnnouncements,
            getUnreadAnnouncements: getUnreadAnnouncements,
            getNumberUnreadAnnouncements: getNumberUnreadAnnouncements,
            getAnnouncementBySerNum: getAnnouncementBySerNum,
            readAnnouncementBySerNum: readAnnouncementBySerNum,
            readAnnouncement: readAnnouncement,
            getAnnouncementName: getAnnouncementName,
            setLanguageAnnouncements: setLanguageAnnouncements,
            getAnnouncementUrl: getAnnouncementUrl,
            clearAnnouncements: clearAnnouncements,
            getLastUpdated: getLastUpdated
        };
        return service;

        ////////////////

        /**
         *@ngdoc method
         *@name setAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@param {Array} announcements announcements array that containts the new announcements
         *@description Setter method for announcements
         **/
        function setAnnouncements(announcements)
        {

            //Cleaning the announcements array
            announcementsArray=[];
            //Adding annoucements
            lastUpdated = Date.now();
            addAnnouncements(announcements);
        }

        /**
         *@ngdoc method
         *@name updateAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@param {Array} announcements new announcements array
         *@description Updates the announcementsArray with the new information contained in the announcement parameter.
         * Will replace out-of-date announcements.
         **/
        function updateAnnouncements(announcements)
        {
            //Find and delete to be added later
            findAndDeleteAnnouncements(announcements);
            //Call formatting function
            addAnnouncements(announcements);
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
            return announcementsArray;
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


            //Initializing array to return
            var array=[];
            //Iterating and finding annoucements that have not been read
            for (var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].ReadStatus=='0')
                {
                    array.push(announcementsArray[i]);
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
            for (var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].ReadStatus == '0')
                {
                    number++;
                }
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
        function getAnnouncementBySerNum(serNum)
        {
            for (var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].AnnouncementSerNum==serNum)
                {
                    return angular.copy(announcementsArray[i]);
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
            for (var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].AnnouncementSerNum==serNum)
                {
                    announcementsArray[i].ReadStatus = '1';
                    //LocalStorage.WriteToLocalStorage('Announcements',announcementsArray);
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
            announcementsArray[index].ReadStatus = '1';
            LocalStorage.WriteToLocalStorage('Announcements',announcementsArray);
            RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Announcements'});
        }

        /**
         *@ngdoc method
         *@name getAnnouncementName
         *@methodOf MUHCApp.service:Announcements
         *@param {String} serNum AnnouncementSerNum to be read
         *@description Gets the PostName_EN, and PostName_FR for the notifications
         *@returns {Object} Returns object containing only the names for a particular announcement, used by the {@link MUHCApp.service:Notifications Notifications Service}
         **/
        function getAnnouncementName(serNum)
        {

            for (var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].AnnouncementSerNum==serNum)
                {

                    return { NameEN: announcementsArray[i].PostName_EN, NameFR:announcementsArray[i].PostName_FR};
                }
            }
        }

        /**
         *@ngdoc method
         *@name setLanguageAnnouncements
         *@methodOf MUHCApp.service:Announcements
         *@param {Array} array Array with annoucements
         *@description Translates the array parameter containing announcements to appropiate preferred language specified in {@link MUHCApp.service:UserPreferences UserPreferences}.
         *@returns {Array} Returns array with translated values
         **/
        function setLanguageAnnouncements(array)
        {
            var language = UserPreferences.getLanguage();
            //Check if array
            if (Object.prototype.toString.call( array ) === '[object Array]') {
                for (var i = 0; i < array.length; i++) {
                    //set language
                    array[i].Title = (language=='EN')? array[i].PostName_EN : array[i].PostName_FR;
                    array[i].Body = (language == 'EN')? array[i].Body_EN : array[i].Body_FR;
                }
            }else{
                //set language if string
                array.Title = (language=='EN')? array.PostName_EN : array.PostName_FR;
                array.Body = (language == 'EN')? array.Body_EN: array.Body_FR;
            }

            return array;
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
            announcementsArray=[];
            lastUpdated = 0;
        }

        //When there is an update, find the matching message and delete it, its added later by findAndDeleteAnnouncements function
        function findAndDeleteAnnouncements(announcements)
        {
            for (var i = 0; i < announcements.length; i++) {
                for (var j = 0; j < announcementsArray.length; j++) {
                    if(announcementsArray[j].AnnouncementSerNum==announcements[i].AnnouncementSerNum)
                    {
                        announcementsArray.splice(j,1);
                    }
                }
            }
        }
        //Formats the input dates and gets it ready for controllers, updates announcementsArray
        function addAnnouncements(announcements)
        {

            //If announcements are undefined simply return
            if(typeof announcements=='undefined') return;
            for (var i = 0; i < announcements.length; i++) {
                //Format the date to javascript
                announcements[i].DateAdded=$filter('formatDate')(announcements[i].DateAdded);
                //Add to my annoucements array
                announcementsArray.push(announcements[i]);
            }
            //Update local storage section
            //LocalStorage.WriteToLocalStorage('Announcements',announcementsArray);
        }

        function getLastUpdated() {
            return lastUpdated;
        }

    }

})();
