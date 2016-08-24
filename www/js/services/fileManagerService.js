//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.service:FileManagerService
*@requires MUHCApp.service:NewsBanner
*@requires $cordovaFileOpener2
*@requires $q
*@requires $filter
*@description Allows the app's controllers or services interact with the file storage of the device. For more information look at {@link https://github.com/apache/cordova-plugin-file Cordova File Plugin}, reference for social sharing plugin {@link https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin Cordova Sharing Plugin}
**/
myApp.service('FileManagerService',function($q, $cordovaFileOpener2,$filter,NewsBanner ){
  //Determing whether is a device or the browser
  var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

  //Obtaining device paths for documents
  /**
  *@ngdoc property
  *@name  MUHCApp.service.#urlDeviceDocuments
  *@propertyOf MUHCApp.service:FileManagerService
  *@description String representing the path for documents in the device, for Android, the path used is cordova.file.externalRootDirectory, which is outside
  the sandbox for the app, and for IOS we use cordova.file.documentsDirectory which is inside the sandbox for the app. For more information refer to {@link https://github.com/apache/cordova-plugin-file Cordova File Plugin}.
  **/
  var urlDeviceDocuments = '';
  /**
  *@ngdoc property
  *@name  MUHCApp.service.#urlCDVPathDocuments
  *@propertyOf MUHCApp.service:FileManagerService
  *@description Same as above but the using th CDV protocol.
  **/
  var urlCDVPathDocuments = '';
  if(app)
  {
    if(ons.platform.isAndroid())
    {
      urlDeviceDocuments = cordova.file.externalRootDirectory+'/Documents/';
      urlCDVPathDocuments = "cdvfile://localhost/sdcard/Documents/";
    }else{
      urlDeviceDocuments = cordova.file.documentsDirectory+'/Documents/';
      urlCDVPathDocuments = "cdvfile://localhost/persistent/Documents/";
    } 
    console.log(urlDeviceDocuments, urlDeviceDocuments);
  } 
  //Tell me whether a url is a pdf link
  function isPDFDocument(url)
  {
    	var index = url.lastIndexOf('.');
      var substring = url.substring(index+1,url.length);
      console.log(substring);
      return (substring=='pdf')?true:false;
  }

  //Reads data from file an return base64 representation
  function readDataAsUrl(file)
  {
    var r=$q.defer();
      var reader = new FileReader();
      var img='';
      reader.onloadend = function(evt) {
          console.log("Read as data URL");
          r.resolve(evt.target.result);
      };
    reader.readAsDataURL(file);
    return r.promise;
  }
 
return {
  //Obtains file type
  /**
		*@ngdoc method
		*@name getFileType
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} url url to check and extract file type
		*@description Obtains file type
    *@returns {String} Returns type
		**/
  getFileType:function(url)
  {
    var index = url.lastIndexOf('.');
    var substring = url.substring(index+1,url.length);
    return substring;
  },
  //Public function to determine whether a link is a url
    /**
		*@ngdoc method
		*@name isPDFDocument
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} url url to check
		*@description Public function to determine whether the url is a pdf
    *@returns {Boolean} Value representing whether a given url is a pdf or not
		**/
  isPDFDocument:function(url)
  {
    return isPDFDocument(url);
  },
  //Downloads a document into the device storage
     /**
		*@ngdoc method
		*@name downloadFileIntoStorage
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} url url to check
    *@param {String} targetPath Path to download url into
		*@description Downloads the url into the targetPath specified for the device, Checks if the document has been downloaded if it has not, it proceeds
    *@returns {Promise} If the document has been downloaded before, or if it downloads successfully, it function resolves to the file entry representing that document, otherwise rejects the promise with the appropiate error.
		**/
  downloadFileIntoStorage:function(url,targetPath)
  {
    var r=$q.defer();
    var fileTransfer = new FileTransfer();
    window.resolveLocalFileSystemURL(targetPath,function(fileEntry)
    {
      console.log(fileEntry);
      r.resolve(true);
    },function()
    {
      fileTransfer.download(url, targetPath,
      function(entry) {
        console.log(entry);
        r.resolve(entry);
      },
      function(err) {
        console.log(err);
        r.reject(err);
      });
    });
    return r.promise;
    
  },
  //Shares a url using the social sharing options
  /**
		*@ngdoc method
		*@name shareDocument
		*@methodOf MUHCApp.service:FileManagerService
    *@param {String} name Name of document to be shared
		*@param {String} url url to check
		*@description Opens the native shared functionality and allows the user to share the url through different mediums, giving it the name specified in the parameters. Reference {@link https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin Cordova Sharing Plugin}
		**/
  shareDocument:function(name, url)
  {
    //Check if its an app
    if (app) {
      
      //Set the subject for the document
      var options = {subject: name};
      options.url = url;
      //Defines on success function
      var onSuccess = function(result) {
      console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
      console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      };
      //Defines on error function 
      var onError = function(msg) {
        //Show alert banner with error
      NewsBanner.showCustomBanner($filter('translate')("UNABLETOSHAREMATERIAL"),'#f2dede', null, 2000);
      console.log("Sharing failed with message: " + msg);
        };
        //Plugin usage
      window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
		} else {
			ons.notification.alert({ message: $filter('translate')('AVAILABLEDEVICES')});
		}
  },
  //Gets the base64 representation of a file in the cordova file storage
  /**
		*@ngdoc method
		*@name getFileUrl
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} filePath File path to look for in storage
		*@description Opens file from device storage and converts into base64 format, it returns the base64 representation via promises
    *@return {Promise} If fulfilled document base64 representation returned correctly, otherwise, rejects promise with appropiate error. 
		**/
  getFileUrl:function(filePath)
  {
    var r=$q.defer();
    //Find the file path in stroage
    window.resolveLocalFileSystemURL(filePath, function(fileEntry){
      //Get file entry and turn it into a base64 string
      fileEntry.file(function(file){
        r.resolve(readDataAsUrl(file));
      },function(error)
      {
        //Error transforming file into base64
        r.reject(error);
        console.log(error);
      });
    }, function(error){
      //Document not found
      console.log(error);
        r.reject(error.code);
    });
    return r.promise;
  },
  //Opens a pdf depending on the device or browser
  /**
		*@ngdoc method
		*@name openPDF
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} url File url to open
		*@description If its an android phone, the function uses {@link https://github.com/pwlin/cordova-plugin-file-opener2 Cordova File Opener2}, and opens the pdf using a third party software. If its an iOS device or a browser, it simply opens it in a new browser window.
		**/
    openPDF:function(url)
    {
      console.log(url);
      var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
      if (app) {
        if(ons.platform.isAndroid()){
            window.cordova.plugins.FileOpener.canOpenFile(url, function(data){
                console.log('extension: ' + data.extension + '\n' +'canBeOpen: ' + data.canBeOpen);
                if(data.canBeOpen)
                {
                  window.cordova.plugins.FileOpener.openFile(url, function(data){
                    console.log(data.message);
                  }, function(data){
                    console.log(data);
                      ons.notification.alert({ message:$filter('traslate')('UNABLETOOPEN') });
                  });
                }else{
                  	ons.notification.alert({ message:$filter('traslate')('UNABLETOOPEN') });
                }
            }, function(error){ons.notification.alert({ message:$filter('traslate')('UNABLETOOPEN') });});
          }else{
            var ref = cordova.InAppBrowser.open(url, '_blank', 'EnableViewPortScale=yes');
          }
      } else {
        window.open(url);
      }
    },
    //Gets document file storage url
    /**
		*@ngdoc method
		*@name getDocumentUrls
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} document Url to return
		*@description Gets the path representations of the document inside the device storage
    *@returns {Object} Object containing the two representations of file paths for the document in the device storage
		**/
    getDocumentUrls:function(document)
    {
      var documentName = 'docMUHC'+document.DocumentSerNum+"."+document.DocumentType;
      var urlCDV = urlCDVPathDocuments+documentName;
      var urlPathFile = urlDeviceDocuments+documentName;
      return {cdvUrl:urlCDV,urlPathFile:urlPathFile};
    },
    //Gets the absolute path for file storage
     /**
		*@ngdoc method
		*@name getFilePathForDocument
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} document Url to return
		*@description Gets the file path representation of the document inside the device storage
    *@returns {String} Returns the device path representation of file in stroage
		**/
    getFilePathForDocument:function(document)
    {
      var documentName = 'docMUHC'+document.DocumentSerNum+"."+document.DocumentType;
      return urlDeviceDocuments+documentName;
    },
    //Gets the CDVFile representation for the document
     /**
		*@ngdoc method
		*@name getCDVFilePathForDocument
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} document Url to return
		*@description Gets the CDV file path representation of the document inside the device storage
    *@returns {String} Returns the CDV file representation of file in stroage
		**/
    getCDVFilePathForDocument:function(document)
    {
      var documentName = 'docMUHC'+document.DocumentSerNum+"."+document.DocumentType;
      return urlCDVPathDocuments+documentName;
    },
    //Gets an incomplete base64 string and adds the specific string to it
     /**
		*@ngdoc method
		*@name setBase64Document
		*@methodOf MUHCApp.service:FileManagerService
		*@param {Object} document Document object
		*@description Concatanates appropiate base64 prefix to content according to document type.
    *@returns {Object} Returns document object with the Content set to a correct base64 url
		**/
    setBase64Document:function(document)
    {
      if(document.DocumentType=='pdf')
      {
        document.Content='data:application/pdf;base64,'+document.Content;
      }else{
        document.Content='data:image/'+document.DocumentType+';base64,'+document.Content;
      }
      return document;
    },
    //Determines whether a document has been saved the device
    /**
		*@ngdoc method
		*@name findDocumentInDevice
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} type Type for document
    *@param {String} documentSerNum DocumentSerNum
		*@description If it finds the document in storage, returns file path representations otherwise returns the error,
    *@returns {Promise} Promise resolves to document paths if document has been found, otherwise returns document not found error.
		**/
    findPatientDocumentInDevice:function(type, documentSerNum)
    {
      var r = $q.defer();
      var documentName = 'docMUHC'+documentSerNum+"."+type;
      var urlCDV = urlCDVPathDocuments+documentName;
      var urlPathFile = urlDeviceDocuments+documentName;
      window.resolveLocalFileSystemURL(urlCDV,function(fileEntry)
      {
        r.resolve({cdvUrl:urlCDV,urlPathFile:urlPathFile});
      },function(error){
        r.reject(error);
      });
      return r.promise;
    },
    //Opens the url for a document
     /**
		*@ngdoc method
		*@name openUrl
		*@methodOf MUHCApp.service:FileManagerService
		*@param {String} url Url to be opened
		*@description Opens url in another browser window.
		**/
    openUrl:function(url)
    {
      var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
      if (app) {
        var ref = cordova.InAppBrowser.open(url, '_blank', 'EnableViewPortScale=yes');
      } else {
        window.open(url);
      }
    }
  };
});