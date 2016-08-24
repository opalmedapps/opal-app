//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
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
myApp.service('Announcements', ['RequestToServer','$filter','LocalStorage','UserPreferences',function(RequestToServer,$filter, LocalStorage,UserPreferences){
  
/**
  *@ngdoc property
  *@name  MUHCApp.service.#announcementsArray
  *@propertyOf MUHCApp.service:Announcements
  *@description Initializing array that represents all the information for Announcements, this array is passed to appropiate controllers.
  **/
  var announcementsArray=[];


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
    console.log(announcements);
    //If announcements are undefined simply return
    if(typeof announcements=='undefined') return;
    for (var i = 0; i < announcements.length; i++) {
      //Format the date to javascript
      announcements[i].DateAdded=$filter('formatDate')(announcements[i].DateAdded);
      //Add to my annoucements array
      announcementsArray.push(announcements[i]);
    }
    //Update local storage section
    LocalStorage.WriteToLocalStorage('Announcements',announcementsArray);
  }
  return {
     /**
      *@ngdoc method
      *@name setAnnouncements
      *@methodOf MUHCApp.service:Announcements
      *@param {Array} announcements announcements array that containts the new announcements
      *@description Setter method for announcements
      **/
    setAnnouncements:function(announcements)
    {
      //Cleaning the announcements array
      announcementsArray=[];
      //Adding annoucements
      addAnnouncements(announcements);
    },
    /**
      *@ngdoc method
      *@name updateAnnouncements
      *@methodOf MUHCApp.service:Announcements
      *@param {Array} announcements Finds announcements to update or adds new announcements if not found
      *@description Updates the announcementsArray with the new information contained in the announcement parameter
      **/
    updateAnnouncements:function(announcements)
    {
      //Find and delete to be added later
      findAndDeleteAnnouncements(announcements);
      //Call formatting function
      addAnnouncements(announcements);
    },
     /**
      *@ngdoc method
      *@name getAnnouncements
      *@methodOf MUHCApp.service:Announcements
      *@description Getter for the announcementsArray
      *@returns {Array} announcementsArray
      **/
    getAnnouncements:function()
    {
      return announcementsArray;
    },
    
    /**
    *@ngdoc method
    *@name getUnreadAnnouncements
    *@methodOf MUHCApp.service:Announcements
    *@description Gets unread announcements
    *@returns {Array} Returns all the unread annoucements
    **/
    getUnreadAnnouncements:function()
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
    },
    
    /**
    *@ngdoc method
    *@name getNumberUnreadAnnouncements
    *@methodOf MUHCApp.service:Announcements
    *@description Iterates through array object and returns the number of unread announcements
    *@returns {Number} Returns number of unread news
    **/
    getNumberUnreadAnnouncements:function()
    {
      var number = 0;
      for (var i = 0; i < announcementsArray.length; i++) {
        if(announcementsArray[i].ReadStatus == '0')
        {
          number++;
        }
      }
      return number;
    },
     /**
    *@ngdoc method
    *@name getAnnouncementBySerNum
    *@methodOf MUHCApp.service:Announcements
    *@param {String} serNum AnnouncementSerNum to be looked for
    *@description Iterates through the annoucements array and returns annoucement object matching the serNum
    *@returns {Object} Returns object containing annoucement
    **/
    getAnnouncementBySerNum:function(serNum)
    {
      for (var i = 0; i < announcementsArray.length; i++) {
        if(announcementsArray[i].AnnouncementSerNum==serNum)
        {
          return angular.copy(announcementsArray[i]);
        }
      }
    },
    /**
    *@ngdoc method
    *@name readAnnouncementBySerNum
    *@methodOf MUHCApp.service:Announcements
    *@param {String} serNum AnnouncementSerNum to be read
    *@description Sets ReadStatus in announcement to 1, sends request to backend, and syncs with device storage
    **/
    readAnnouncementBySerNum:function(serNum)
    {
      for (var i = 0; i < announcementsArray.length; i++) {
        if(announcementsArray[i].AnnouncementSerNum==serNum)
        {
          announcementsArray[i].ReadStatus = '1';
          LocalStorage.WriteToLocalStorage('Announcements',announcementsArray);
          RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Announcements'});
          break;
        }
      }
    },
     /**
    *@ngdoc method
    *@name readAnnouncement
    *@methodOf MUHCApp.service:Announcements
    *@param {String} index index in the annoucement array to be read
    *@param {String} serNum AnnouncementSerNum to be read
    *@description Faster method to read an announcement, no iteration required.
    **/
    readAnnouncement:function(index, serNum)
    {
      announcementsArray[index].ReadStatus = '1';
      LocalStorage.WriteToLocalStorage('Announcements',announcementsArray);
      RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Announcements'});
    },
     /**
    *@ngdoc method
    *@name getAnnouncementName
    *@methodOf MUHCApp.service:Announcements
    *@param {String} serNum AnnouncementSerNum to be read
    *@description Gets the PostName_EN, and PostName_FR for the notifications
    *@returns {Object} Returns object containing only the names for a particular announcement, used by the {@link MUHCApp.service:Notifications Notifications Service} 
    **/
    getAnnouncementName:function(serNum)
    {
      console.log(announcementsArray);
      for (var i = 0; i < announcementsArray.length; i++) {
        if(announcementsArray[i].AnnouncementSerNum==serNum)
        {
          console.log({ NameEN: announcementsArray[i].PostName_EN, NameFR:announcementsArray[i].PostName_FR});
          return { NameEN: announcementsArray[i].PostName_EN, NameFR:announcementsArray[i].PostName_FR};
        }
      }
    },
    /**
    *@ngdoc method
    *@name setLanguageAnnouncements
    *@methodOf MUHCApp.service:Announcements
    *@param {Array} array Array with annoucements
    *@description Translates the array parameter containing announcements to appropiate preferred language specified in {@link MUHCApp.service:UserPreferences UserPreferences}.
    *@returns {Array} Returns array with translated values
    **/
    setLanguageAnnouncements:function(array)
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
      console.log(array);
      return array;
    },
     /**
    *@ngdoc method
    *@name getAnnouncementUrl
    *@methodOf MUHCApp.service:Announcements
    *@description Returns announcements url to be used by the {@link MUHCApp.service:Notifications Notifications Service}.
    *@returns {String} Returns Url for individual annoucements
    **/
    getAnnouncementUrl:function()
    {
      return './views/general/announcements/individual-announcement.html';
    },
     /**
    *@ngdoc method
    *@name clearAnnouncements
    *@methodOf MUHCApp.service:Announcements
    *@description Clears the service of any saved state, function used by the {@link MUHCApp.controller:LogoutController LogoutController}
    **/
    clearAnnouncements:function()
    {
      announcementsArray=[];
    }
  };
  }]);
