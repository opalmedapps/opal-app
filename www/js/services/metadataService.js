/*
 * Filename     :   metadataService.js
 * Description  :   Service that is used only on the initial loading of the app after login. This is supposed to resolve the latency issue that happens with tab switching
 * Created by   :   James Brace
 * Date         :   22 May 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * License      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc Service
 *@name MUHCApp.service:MetaData
 *@description Service that handles the tab metadata. Right now it fetches the necessary data on first load
 *
 * TODO: implement background refresh feature
 **/

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('MetaData', MetaData);

    MetaData.$inject = ['Appointments','Documents','TxTeamMessages','Notifications', 'Questionnaires', 'Announcements'];

    function MetaData(Appointments, Documents, TxTeamMessages, Notifications, Questionnaires, Announcements) {

        //you only need to use this service the first time entering a tab
        var firstTimePersonal = true;
        var firstTimeGeneral = true;
        var firstTimeEducational = true;

        var personalTabData = {
            appointmentsUnreadNumber : null,
            documentsUnreadNumber: null,
            txTeamMessagesUnreadNumber: null,
            notificationsUnreadNumber: null,
            questionnairesUnreadNumber: null
        };

        var generalTabData = {
            announcementsUnreadNumber: null
        };

        var MetaData = {
            init: init,
            fetchPersonalMeta: fetchPersonalMeta,
            fetchGeneralMeta: fetchGeneralMeta,
            isFirstTimePersonal: isFirstTimePersonal,
            isFirstTimeGeneral: isFirstTimeGeneral,
            isFirstTimeEducational: isFirstTimeEducational,
            setFetchedPersonal: setFetchedPersonal,
            setFetchedGeneral: setFetchedGeneral
        };

        return MetaData;

        ////////////////////////

        //grab all the necessary meta data on load screen
        function init (){

            //load the personal tab data
            personalTabData.appointmentsUnreadNumber = Appointments.getNumberUnreadAppointments();
            personalTabData.documentsUnreadNumber = Documents.getNumberUnreadDocuments();
            personalTabData.txTeamMessagesUnreadNumber = TxTeamMessages.getUnreadTxTeamMessages();
            personalTabData.notificationsUnreadNumber = Notifications.getNumberUnreadNotifications();
            personalTabData.questionnairesUnreadNumber = Questionnaires.getNumberOfUnreadQuestionnaires();

            console.log("personal meta data initialized!");


            //load the general tab data
            generalTabData.announcementsUnreadNumber = Announcements.getNumberUnreadAnnouncements();

            console.log("meta data initialized!");
        }

        function fetchPersonalMeta(){
            return personalTabData;
        }

        function isFirstTimePersonal() {
            return firstTimePersonal;
        }

        function setFetchedPersonal() {
            firstTimePersonal = false;
        }

        function fetchGeneralMeta(){
            return generalTabData;
        }

        function setFetchedGeneral() {
            firstTimeGeneral = false;
        }

        function isFirstTimeGeneral() {
            return firstTimeGeneral;
        }

        function isFirstTimeEducational() {
            return firstTimeEducational;
        }

    }

})();