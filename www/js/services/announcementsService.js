var myApp=angular.module('MUHCApp');
//Service that deals with the announcement information for the patient
myApp.service('Announcements', ['RequestToServer','$filter','LocalStorage','UserPreferences',function(RequestToServer,$filter, LocalStorage,UserPreferences){
  //Initializing array that represents all the informations for Announcements
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
    //Setter the announcements from 0
    setAnnouncements:function(announcements)
    {
      announcementsArray=[];
      addAnnouncements(announcements)
    },
    //Update the announcements
    updateAnnouncements:function(announcements)
    {
      //Find and delete to be added later
      findAndDeleteAnnouncements(announcements);
      //Call formatting function
      addAnnouncements(announcements);
    },
    //Getter for the main array
    getAnnouncements:function()
    {
      return announcementsArray;
    },
    //Gets Last Announcement to display on main tab pages
    getLastAnnouncements:function()
    {
      if(announcementsArray.length==0) return null;
      return announcementsArray[0];
    },
    //Gets unread announcements
    getUnreadAnnouncements:function()
    {
      var array=[];
      for (var i = 0; i < announcementsArray.length; i++) {
        if(announcementsArray[i].ReadStatus=='0')
        {
          array.push(announcementsArray[i]);
        }
      }
      return array;
    },
    //Get number of unread news
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
    getAnnouncementBySerNum:function(serNum)
    {
      for (var i = 0; i < announcementsArray.length; i++) {
        if(announcementsArray[i].AnnouncementSerNum==serNum)
        {
          return angular.copy(announcementsArray[i]);
        }
      }
    },
    //Reads announcement and sends request to backend
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
    //Read announcement by index of announcement array and ser num
    readAnnouncement:function(index, serNum)
    {
      announcementsArray[index].ReadStatus = '1';
      LocalStorage.WriteToLocalStorage('Announcements',announcementsArray);
      RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Announcements'});
    },
    //Get names for notifications
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
    getAnnouncementUrl:function(serNum)
    {
      return './views/general/announcements/individual-announcement.html';
    }
  };
  }]);
