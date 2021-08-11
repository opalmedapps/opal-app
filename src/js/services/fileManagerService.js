//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp = angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:FileManagerService
 *@requires MUHCApp.service:NewsBanner
 *@requires $q
 *@requires $filter
 *@description Allows the app's controllers or services interact with the file storage of the device. For more information look at {@link https://github.com/apache/cordova-plugin-file Cordova File Plugin}, reference for social sharing plugin {@link https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin Cordova Sharing Plugin}
 **/
myApp.service('FileManagerService', ['$q', '$filter', 'NewsBanner', '$injector', 'Params',
    'Constants', 'Browser',

    function ($q, $filter, NewsBanner, $injector, Params, Constants, Browser) {

    /**
     *@ngdoc property
     *@name MUHCApp.service.#urlDeviceDocuments
     *@propertyOf MUHCApp.service:FileManagerService
     *@description String representing the path for documents in the device.
     *             For Android, the path used is cordova.file.externalRootDirectory, which is outside the sandbox for
     *             the app, and for IOS we use cordova.file.documentsDirectory which is inside the sandbox for the app.
     *             For more information refer to {@link https://github.com/apache/cordova-plugin-file Cordova File Plugin}.
     **/
    let urlDeviceDocuments = '';

    if (Constants.app) {
        if (ons.platform.isAndroid()) {
            urlDeviceDocuments = cordova.file.externalRootDirectory + '/Documents/';
        } else {
            urlDeviceDocuments = cordova.file.documentsDirectory;
        }
    }

    //Tell me whether a url is a pdf link
    function isPDFDocument(url) {
        var index = url.lastIndexOf('.');
        var substring = url.substring(index + 1, url.length);

        return (substring == 'pdf');
    }

    /**
     * @ngdoc method
     * @name downloadFileIntoStorage
     * @author Stacey Beard
     * @date 2021-05-31
     * @methodOf MUHCApp.service:FileManagerService
     * @description Downloads the file from the url to the targetPath on the device.
     *              Checks if the document has been downloaded already; if so, it is not downloaded again.
     *              Code based on: https://cordova.apache.org/blog/2017/10/18/from-filetransfer-to-xhr2.html
     *                        and: https://cordova.apache.org/docs/en/10.x/reference/cordova-plugin-file/
     * @param {String} url The url of the file to download from the web.
     * @param {String} targetPath The path where the downloaded file will be saved on the device
     *                            (does not include its file name).
     * @param {String} fileName The name to give the saved file.
     * @returns {Promise} Resolves to true if the document has been downloaded before, or if it downloads successfully.
     *                    Otherwise, rejects with an error.
     **/
    function downloadFileIntoStorage(url, targetPath, fileName) {
        let r = $q.defer();
        console.log("downloadFileIntoStorage: url = "+url+", targetPath = "+targetPath+", fileName = "+fileName);

        // Check whether the file already exists on the device
        window.resolveLocalFileSystemURL(targetPath + fileName, () => {
            // File has already been downloaded
            console.log("File already exists, skipping download");
            r.resolve(true);
        }, () => {
            // File doesn't exist; download it
            console.log("Starting file download process");
            window.resolveLocalFileSystemURL(targetPath, function (dirEntry) {
                console.log("File system open: " + dirEntry.name);

                dirEntry.getFile(fileName, { create: true, exclusive: true }, function (fileEntry) {
                    console.log("Created fileEntry: " + fileEntry.name);
                    console.log("FileEntry is file? " + fileEntry.isFile.toString());

                    var oReq = new XMLHttpRequest();
                    oReq.open("GET", url, true);
                    // Define how you want the XHR data to come back
                    oReq.responseType = "blob";

                    oReq.onload = function (oEvent) {
                        var blob = oReq.response; // Note: not oReq.responseText
                        if (blob) {
                            // Create a FileWriter object to write the blob to the local fileEntry
                            fileEntry.createWriter(function(fileWriter) {
                                fileWriter.onwriteend = function(e) {
                                    console.log("Write completed.");
                                    r.resolve(true);
                                };

                                fileWriter.onerror = function(e) {
                                    console.log("Write failed: " + e.toString());
                                    r.reject(e);
                                };

                                fileWriter.write(blob);
                            }, function (err) {
                                console.error("Error creating file writer: " + JSON.stringify(err));
                                r.reject(err);
                            });
                        } else {
                            let msg = "Didn't receive an XHR response";
                            console.error(msg);
                            r.reject({status: "error", message: msg});
                        }
                    };
                    oReq.send(null);
                }, function (err) {
                    console.error("Error getting file: " + JSON.stringify(err));
                    r.reject(err);
                });
            }, function (err) {
                console.error("Error opening directory at targetPath = " + targetPath +", " + JSON.stringify(err));
                r.reject(err);
            });
        });
        return r.promise;
    }

    /**
     * @description Determines whether a given file or website should be shared by attachment or by link.
     *              For example, a pdf or jpg file should be shared by attachment, while a YouTube video or web page
     *              should be shared by link.
     *              Note: If the file name contains a French character, this function will return false (share by link).
     *                    This is due to a bug in cordova-plugin-x-socialsharing where French file names cannot be
     *                    shared by attachment.
     * @author Stacey Beard
     * @date 2021-06-30
     * @param url The url of the file or website to share.
     * @returns {boolean} True if the url points to a file with an accepted extension for sharing by attachment; false otherwise.
     */
    function toShareByAttachment(url) {
        // List of extension types to share by attachment, from: https://www.computerhope.com/issues/ch001789.htm
        let attachmentExtensions = ['aif', 'cda', 'mid', 'midi', 'mp3', 'mpa', 'ogg', 'wav', 'wma', 'wpl', // Audio
            'ai', 'bmp', 'gif', 'ico', 'jpeg', 'jpg', 'png', 'ps', 'psd', 'raw', 'svg', 'tif', 'tiff', 'webp', // Image
            '3g2', '3gp', 'avi', 'flv', 'h264', 'm4v', 'mkv', 'mov', 'mp4', 'mpe', 'mpeg', 'mpg', 'rm', 'swf', 'vob', 'wmv', // Video
            'csv', 'doc', 'docx', 'key', 'odp', 'ods', 'odt', 'pdf', 'pps', 'ppt', 'pptx', 'rtf', 'tex', 'txt', 'wpd', 'xls', 'xlsm', 'xlsx', 'zip' // Other documents
            ];

        // Extract the last part of the url (this will be the file name, if the url points to a file)
        let filename = url.split('/').pop();

        // Check whether the file name has an extension (this will return the empty string if there is no extension)
        // Formula: https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/12900504#12900504
        let extension = filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1);

        // Check whether the file name contains a French character (would cause the plugin to fail if shared by attachment)
        // This check can be removed if cordova-plugin-x-socialsharing is fixed to handle French characters in file names
        let frenchChars = ['â', 'à', 'ä', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ì', 'ï', 'ô', 'ò', 'ù', 'û', 'ü', 'œ', 'ÿ'];
        let hasFrenchChars = frenchChars.some(c => { return filename.toLowerCase().includes(c); });

        // Return whether the extension is in the accepted list (case insensitive), and doesn't contain French characters
        // In this case, the file should be shared by attachment
        return !hasFrenchChars && attachmentExtensions.includes(extension.toLowerCase());
    }

    return {
        /**
         * @ngdoc method
         * @name downloadFileIntoStorage
         * @author Stacey Beard
         * @date 2021-05-31
         * @methodOf MUHCApp.service:FileManagerService
         **/
        downloadFileIntoStorage: function (url, targetPath, fileName) {
            return downloadFileIntoStorage(url, targetPath, fileName);
        },

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

        /**
         *@ngdoc method
         *@name shareDocument
         *@methodOf MUHCApp.service:FileManagerService
         *@param {String} name Name of document to be shared
         *@param {String} url url to check
         *@description Opens the native shared functionality and allows the user to share the url through different mediums, giving it the name specified in the parameters. Reference {@link https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin Cordova Sharing Plugin}
         **/
        shareDocument: function (name, url) {
            if (Constants.app) {

                // Set the plugin options
                let options = {
                    subject: name,
                    message: name,
                };
                toShareByAttachment(url)    // Check how to share the document
                    ? options.files = [url] // Share by attachment (the file itself is shared)
                    : options.url = url;    // Share by link (a link to the file is shared)

                let onSuccess = function (result) {
                    console.log(`Successfully shared "${name}" via ${url}: ${JSON.stringify(result)}`);
                };

                let onError = function (err) {
                    //Show alert banner with error
                    NewsBanner.showCustomBanner($filter('translate')("UNABLETOSHAREMATERIAL"), '#333333', '#F0F3F4',
                         13, 'top', null, 2000);
                    console.error(`Failed to share "${name}" via ${url}: ${JSON.stringify(err)}`);
                };

                window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
            }
            else {
                ons.notification.alert({message: $filter('translate')('AVAILABLEDEVICES')});
            }
        },

        /**
         *@ngdoc method
         *@name openPDF
         *@methodOf MUHCApp.service:FileManagerService
         *@param {String} url URL of the file to open from the web.
         *@param {String} newDocName New name to give the file if it needs to be downloaded.
         *@description If its an android phone, it opens the pdf using a third party software.
         *             If its an iOS device or a browser, it simply opens it in a new browser window.
         *             In fact, this function should be named openFile() because it opens not only pdf, but many different file types with the following extensions:
         *             .doc, .docx, .xls, .xlsx, .rtf, .wav, .gif, .jpg, .jpeg, .png, .txt, .mpg, .mpeg, .mpe, .mp4, .avi, .ods, .odt, .ppt, .pptx, .apk
         *             It opens the file by passing as a parameter a URL of the location of the file (not .html, should be .pdf .doc etc...) OR a file path to the local storage
         *             URL example: https://www.opal.com/myDocument.pdf
         **/
        openPDF: function (url, newDocName) {
            if (Constants.app && ons.platform.isAndroid()) {
                let path = urlDeviceDocuments;
                let targetPath = path + newDocName;

                downloadFileIntoStorage(url, path, newDocName).then(function () {

                    cordova.plugins.fileOpener2.open(targetPath, 'application/pdf', {
                        error : function(e) {
                            console.log('Error status in (fileOpener2): ' + e.status + ' - Error message: ' + e.message);
                        },
                        success : function () {
                            // file opened successfully by Default PDF Viewer on Android.
                            // Nothing else to do at this point
                            console.log('File opened successfully with fileOpener2');

                            var Documents = $injector.get('Documents');
                            // Now add the filename to an array to be deleted OnExit of the app (CleanUp.Clear())
                            Documents.addToDocumentsDownloaded(path, newDocName);    // add file info to the array
                        }
                    });
                }).catch(function (error) {
                    //Unable to download/save document on device
                    console.log('Error downloading document from Server downloadFileIntoStorage: ' + error.status + ' - Error message: ' + error.message);
                });
            }
            else Browser.openInternal(url);
        },

        generatePath: function (document) {
            var documentName = document.Title.replace(/ /g, "_") + "_" + document.ApprovedTimeStamp.toDateString().replace(/ /g, "-") + "." + document.DocumentType;
            return urlDeviceDocuments + documentName;
        },
        generateDocumentName: function (document) {
            var documentName = document.Title.replace(/ /g, "_") + "_" + document.ApprovedTimeStamp.toDateString().replace(/ /g, "-") + "." + document.DocumentType;
            return documentName;
        },
        getPathToDocuments: function () {
            return urlDeviceDocuments;
        },

        /**
         *@ngdoc method
         *@name openUrl
         *@methodOf MUHCApp.service:FileManagerService
         *@param {String} url Url to be opened
         *@description Opens a url in the in-app browser, or in another browser window if not on a device.
         **/
        openUrl: function (url) {
            Browser.openInternal(url);
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
}]);
