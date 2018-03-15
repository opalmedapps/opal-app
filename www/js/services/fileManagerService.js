//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp = angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:FileManagerService
 *@requires MUHCApp.service:NewsBanner
 *@requires $cordovaFileOpener2
 *@requires $q
 *@requires $filter
 *@description Allows the app's controllers or services interact with the file storage of the device. For more information look at {@link https://github.com/apache/cordova-plugin-file Cordova File Plugin}, reference for social sharing plugin {@link https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin Cordova Sharing Plugin}
 **/
myApp.service('FileManagerService', function ($q, $cordovaFileOpener2, $filter, NewsBanner) {
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
    if (app) {
        if (ons.platform.isAndroid()) {
            urlDeviceDocuments = cordova.file.externalRootDirectory + '/Documents/';
            urlCDVPathDocuments = "cdvfile://localhost/sdcard/Documents/";
        } else {
            urlDeviceDocuments = cordova.file.documentsDirectory + '/Documents/';
            urlCDVPathDocuments = "cdvfile://localhost/persistent/Documents/";
        }

    }

    //Tell me whether a url is a pdf link
    function isPDFDocument(url) {
        var index = url.lastIndexOf('.');
        var substring = url.substring(index + 1, url.length);

        return (substring == 'pdf') ? true : false;
    }

    //Reads data from file an return base64 representation
    function readDataAsUrl(file) {
        var r = $q.defer();
        var reader = new FileReader();
        var img = '';
        reader.onloadend = function (evt) {

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
        getFileType: function (url) {
            var index = url.lastIndexOf('.');
            return url.substring(index + 1, url.length);
        },
        //Public function to determine whether a link is a PDF file
        /**
         *@ngdoc method
         *@name isPDFDocument
         *@methodOf MUHCApp.service:FileManagerService
         *@param {String} url url to check
         *@description Public function to determine whether the url is a pdf
         *@returns {Boolean} Value representing whether a given url is a pdf or not
         **/
        isPDFDocument: function (url) {
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
        downloadFileIntoStorage: function (url, targetPath) {
            var r = $q.defer();
            var fileTransfer = new FileTransfer();
            window.resolveLocalFileSystemURL(targetPath, function (fileEntry) {

                r.resolve(true);
            }, function () {
                fileTransfer.download(url, targetPath,
                    function (entry) {

                        r.resolve(entry);
                    },
                    function (err) {

                        r.reject(err);
                    });
            });
            return r.promise;

        },

        // Delete file. Remove it from local storage
        deleteFileFromStorage: function (path, filename) {
            var r = $q.defer();

            console.log('> > > > > > > > Inside 1 deleteFileFromStorage');

            window.resolveLocalFileSystemURL(path, function (fileEntry) {

                console.log('> > > > > > > > Inside 2 deleteFileFromStorage: ');

                r.resolve(true);
                console.log('> > > > > > > > Inside 2.1 deleteFileFromStorage');
            }, function () {
                console.log('> > > > > > > > Inside 2.2 deleteFileFromStorage: ');
                dir.getFile(filename, {create: false}, function (fileEntry) {

                    console.log('> > > > > > > > Inside 3 deleteFileFromStorage');

                    fileEntry.remove(function (entry) {
                        // The file has been removed succesfully
                        console.log('> > > > > > > > The file has been removed succesfully.');
                        r.resolve(entry);

                    }, function (err) {
                        // Error deleting the file
                        console.log('> > > > > > > > Error deleting the file: ' + filename + '  path: ' + path);
                        r.reject(err);

                    }, function (error) {
                        // The file doesn't exist
                        console.log('> > > > > > > > The file does not exist: ' + filename + '  path: ' + path);
                        r.reject(error);

                    });
                    console.log('> > > > > > > > Inside 4 deleteFileFromStorage');

                });
                console.log('> > > > > > > > Inside 5 deleteFileFromStorage');
            })
            console.log('> > > > > > > > Exiting deleteFileFromStorage');
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
        shareDocument: function (name, url, fileType) {
            //Check if its an app
            if (app) {

                //Set the subject for the document
                var options = {subject: name};
                options.files = [url];
                //Defines on success function
                var onSuccess = function (result) {


                };
                //Defines on error function
                var onError = function (msg) {
                    //Show alert banner with error
                    NewsBanner.showCustomBanner($filter('translate')("UNABLETOSHAREMATERIAL"), '#f2dede', null, 2000);

                };

                if (fileType === 'Video') {
                    window.plugins.socialsharing.share(name, name, '', url);
                } else {
                    //Plugin usage
                    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
                }
            } else {
                ons.notification.alert({message: $filter('translate')('AVAILABLEDEVICES')});
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
        getFileUrl: function (filePath) {
            var r = $q.defer();
            //Find the file path in stroage
            window.resolveLocalFileSystemURL(filePath, function (fileEntry) {
                //Get file entry and turn it into a base64 string
                fileEntry.file(function (file) {
                    r.resolve(readDataAsUrl(file));
                }, function (error) {
                    //Error transforming file into base64
                    r.reject(error);

                });
            }, function (error) {
                //Document not found

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
         *@description If its an android phone, it opens the pdf using a third party software.
         *             If its an iOS device or a browser, it simply opens it in a new browser window.
         *             In fact, this function should be named openFile() because it opens not only pdf, but many different file types with the following extensions:
         *             .doc, .docx, .xls, .xlsx, .rtf, .wav, .gif, .jpg, .jpeg, .png, .txt, .mpg, .mpeg, .mpe, .mp4, .avi, .ods, .odt, .ppt, .pptx, .apk
         *             It opens the file by passing as a parameter a URL of the location of the file (not .html, should be .pdf .doc etc...) OR a file path to the local storage
         *             URL example: https://www.opal.com/myDocument.pdf
         *             FileOpener.canOpenFile() will check if there is a default viewer for the requested file type
         *             FileOpener.openFile() will show the file using the default viewer "if" canOpenFile returned true
         **/
        openPDF: function (url) {


            var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
            if (app) {
                if (ons.platform.isAndroid()) {

                    window.cordova.plugins.FileOpener.canOpenFile(url, function (data2) {
                        // at this point it means data2.canBeOpen = true. A PDF Viewer "is" indeed available to show the document


                        var onSuccess = function (data) {
                            // file opened successfully by Default PDF Viewer on Android. Nothing else to do at this point
                        };

                        function onError(error) {
                            // Unexpected Error occurred. For some reason, file could not be opened and viewed, although canOpenFile function returned (data2.canBeOpen = true)
                            ons.notification.alert({message: $filter('translate')('UNABLETOOPEN')});
                        }

                        window.cordova.plugins.FileOpener.openFile(url, onSuccess, onError);


                    }, function (error) {   // at this point it means data2.canBeOpen = false. A PDF Viewer is NOT available to show the document
                        ons.notification.alert({message: $filter('translate')('UNABLETOOPEN')});
                        //ons.notification.alert({message: 'canOpen 3 Error status: ' + error.status + ' - Error message: ' + error.message + ' - url: ' + url});
                    });

                } else {
                    var ref = cordova.InAppBrowser.open(url, '_blank', 'EnableViewPortScale=yes');
                }
            } else {
                window.open(url);
            }

            /**
             openPDF: function (url) {

                 var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
                 if (app) {
                    if(ons.platform.isAndroid()){
                        window.cordova.plugins.FileOpener.canOpenFile(url, function(data){

                            if(data.canBeOpen)
                            {
                                window.cordova.plugins.FileOpener.openFile(url, function(data){

                                }, function(data){

                                    ons.notification.alert({ message:$filter('translate')('UNABLETOOPEN') });
                                });
                            }else{
                                ons.notification.alert({ message:$filter('translate')('UNABLETOOPEN') });
                            }
                        }, function(error){ons.notification.alert({ message:$filter('translate')('UNABLETOOPEN') });});
                    }else{
                        var ref = cordova.InAppBrowser.open(url, '_blank', 'EnableViewPortScale=yes');
                    }
                } else {
                    window.open(url);
                }
            }*/
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
        getDocumentUrls: function (document) {
            var documentName = 'docMUHC' + document.DocumentSerNum + "." + document.DocumentType;
            var urlCDV = urlCDVPathDocuments + documentName;
            var urlPathFile = urlDeviceDocuments + documentName;
            return {cdvUrl: urlCDV, urlPathFile: urlPathFile};
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
        getFilePathForDocument: function (document) {
            var documentName = 'docMUHC' + document.DocumentSerNum + "." + document.DocumentType;
            return urlDeviceDocuments + documentName;
        },
        generatePath: function (document) {
            var documentName = document.Title.replace(/ /g, "_") + document.ApprovedTimeStamp.toDateString().replace(/ /g, "-") + "." + document.DocumentType;
            return urlDeviceDocuments + documentName;
        },
        getPathToDocuments: function () {
            return urlDeviceDocuments;
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
        getCDVFilePathForDocument: function (document) {
            var documentName = 'docMUHC' + document.DocumentSerNum + "." + document.DocumentType;
            return urlCDVPathDocuments + documentName;
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
        setBase64Document: function (document) {
            if (document.DocumentType == 'pdf') {
                document.Content = 'data:application/pdf;base64,' + document.Content;
            } else {
                document.Content = 'data:image/' + document.DocumentType + ';base64,' + document.Content;
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
        findPatientDocumentInDevice: function (type, documentSerNum) {
            var r = $q.defer();
            var documentName = 'docMUHC' + documentSerNum + "." + type;
            var urlCDV = urlCDVPathDocuments + documentName;
            var urlPathFile = urlDeviceDocuments + documentName;
            window.resolveLocalFileSystemURL(urlCDV, function (fileEntry) {
                r.resolve({cdvUrl: urlCDV, urlPathFile: urlPathFile});
            }, function (error) {
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
        openUrl: function (url) {
            var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
            if (app) {
                var ref = cordova.InAppBrowser.open(url, '_blank', 'EnableViewPortScale=yes');
            } else {
                window.open(url);
            }
        },

        convertToUint8Array: function (base64) {
            var raw = window.atob(base64);
            var rawLength = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for (var i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }
            return array;
        }

    };
});