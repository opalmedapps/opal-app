//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp = angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:FileManagerService
 *@description Allows the app's controllers or services interact with the file storage of the device. For more information look at {@link https://github.com/apache/cordova-plugin-file Cordova File Plugin}, reference for social sharing plugin {@link https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin Cordova Sharing Plugin}
 **/
myApp.service('FileManagerService', ['$injector', 'Constants', 'Browser', 'RequestToServer',
function ($injector, Constants, Browser, RequestToServer) {

    /**
     *@ngdoc property
     *@name MUHCApp.service.#urlDeviceDocuments
     *@propertyOf MUHCApp.service:FileManagerService
     *@description String representing the path to which documents are downloaded on the device.
     *             Documents containing medical data should not be stored permanently (see Documents.deleteDocumentsDownloaded).
     *             For more information refer to {@link https://github.com/apache/cordova-plugin-file Cordova File Plugin}.
     **/
    let urlDeviceDocuments = '';

    /*
     * The dataDirectory path can be used for both iOS and Android.
     * Important: on iOS, dataDirectory is NOT synced to the cloud; a no-sync folder must be used to prevent cloud sync of medical data.
     */
    if (Constants.app) urlDeviceDocuments = cordova.file.dataDirectory + 'Documents/';

    /**
     * @ngdoc method
     * @name downloadFileIntoStorage
     * @author Stacey Beard
     * @date 2021-08-20
     * @methodOf MUHCApp.service:FileManagerService
     * @description Downloads the file from the url (via the listener) to the targetPath on the device.
     *              Checks if the document has been downloaded already; if so, it is not downloaded again.
     *              Code for intermediate functions based on: https://cordova.apache.org/blog/2017/10/18/from-filetransfer-to-xhr2.html
     *                and: https://cordova.apache.org/docs/en/10.x/reference/cordova-plugin-file/
     * @param {String} url The url of the file to download from the web, or in base64 format.
     * @param {String} targetPath The path where the downloaded file will be saved on the device
     *                            (does not include its file name).
     * @param {String} fileName The name to give the saved file.
     * @returns {Promise} Resolves if the document has been downloaded before, or if it downloads successfully.
     *                    Otherwise, rejects with an error.
     **/
    async function downloadFileIntoStorage(url, targetPath, fileName) {
        console.log("downloadFileIntoStorage: url = "+url+", targetPath = "+targetPath+", fileName = "+fileName);

        // Check whether the file already exists on the device (if it exists, don't download again)
        const fileExists = await checkFileExists(targetPath + fileName);
        if (fileExists) { console.log("File already exists, skipping download"); return; }

        // Check whether the file to download is already available in the url as base64 data
        let base64 = urlIsBase64(url);
        if (base64 && !base64IsValid(url)) throw "Document to download is in base64 format but its content is invalid.";

        // Depending on the format, get the file contents
        let fileContents;
        if (base64) {
            // If the url is base64, get the file contents from the url
            console.log("Extracting base64 content from the download url");
            fileContents = {
                contentType: extractContentType(url),
                base64Data: extractBase64(url),
            };
        }
        else {
            // Otherwise, get the file contents from the listener
            console.log("Starting file download process from the listener");
            fileContents = await getFileContents(url);
        }

        // Decode the data from base64
        console.log("Decoding base64 data");
        const fileData = base64toBlob(fileContents.base64Data, fileContents.contentType);

        // Open the local file system directory and create an empty file
        console.log("Creating local file");
        const dirEntry = await openDirectory(targetPath);
        const fileEntry = await createNewFile(fileName, dirEntry);

        // Write the file contents to the new file entry
        console.log("Writing data to file");
        await writeBlobToFile(fileData, fileEntry);

        console.log("File download successful");
    }

    /**
     * @description Checks whether a url is formatted in such a way that it contains base64 data
     *              (e.g. data:application/pdf;base64,JVBERi0xLjUK...).
     * @param {string} url The url to check.
     * @returns {boolean} True if the url is in the base64 format; false otherwise.
     */
    function urlIsBase64(url) {
        let regex = /^data:[^;]+;base64,.*$/;
        return url.search(regex) !== -1;
    }

    /**
     * @description Checks whether the base64 content in a URL is valid.
     * @param url The url to check.
     * @returns {boolean} False if the url isn't in base64 format, if its base64 data is blank, or if it fails atob
     *                    decoding; true otherwise.
     */
    function base64IsValid(url) {
        try {
            if (!urlIsBase64(url)) return false;
            const b64Data = extractBase64(url);
            if (!b64Data || b64Data === "") return false;
            atob(b64Data);
            return true;
        }
        catch(error) {
            return false; // Data isn't valid if it fails atob decoding
        }
    }

    /**
     * @description Extracts the base64 data out of a base64 url
     *              (e.g. "JVBERi0xLjUK..." from a url "data:application/pdf;base64,JVBERi0xLjUK...").
     * @param {string} url The url from which to extract the data.
     * @returns {string} The base64 data from the url, or the url as-is if it isn't in base64 format.
     */
    function extractBase64(url) {
        if (!urlIsBase64(url)) return url;
        else if (url.slice(-1) === ',') return ""; // If the url ends in a comma, the data is empty
        else return url.split(',').pop();
    }

    /**
     * @description Extracts the content type out of a base64 url.
     *              (e.g. "application/pdf" from a url "data:application/pdf;base64,JVBERi0xLjUK...").
     * @param {string} url The url from which to extract the content type.
     * @returns {string} The content type from the url, or an empty string if the url isn't in base64 format.
     */
    function extractContentType(url) {
        if (!urlIsBase64(url)) return "";
        else return url.split(':')[1].split(';')[0];
    }

    /**
     * @description Converts a base64 string to a Blob object.
     *              Source: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
     * @param {string} b64Data The base64 string to convert.
     * @param {string} contentType The content type for the base64 data (usually found at the beginning of a base64 URL).
     *                 e.g. "application/pdf", as seen in "data:application/pdf;base64,JVBERi0xLjUK..."
     * @param {number} sliceSize Slice size used in the conversion process (see source link for details).
     * @returns {Blob} A blob of data converted from the base64 string.
     */
    function base64toBlob(b64Data, contentType='', sliceSize=512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    }

    /**
     * @description Checks whether the given file already exists on the file system at the target path
     * @param pathToFile The path to check, including the name of the file at the end.
     * @returns {Promise<boolean>} Resolves to true if the file exists, or false otherwise.
     */
    function checkFileExists(pathToFile) {
        return new Promise(resolve => {
            window.resolveLocalFileSystemURL(pathToFile, () => {
                // If the success callback is reached, the file exists
                resolve(true);
            }, () => {
                // If the error callback is reached, the file wasn't found at the specified path
                resolve(false);
            });
        });
    }

    /**
     * @description Fetches the contents of an online file at a given url from the server.
     * @param url The url of the source file to download.
     * @returns {Promise<{contentType: string, base64Data: string}>} Resolves to an object containing the base64
     *          file contents and the file type.
     */
    async function getFileContents(url) {
        const response = await RequestToServer.sendRequestWithResponse("RequestFile", {url: url});
        return response.data;
    }

    /**
     * @description Opens a directory on the local filesystem.
     * @param targetPath The path to open.
     * @returns {Promise<unknown>} Resolves to a directory object or rejects with an error.
     */
    function openDirectory(targetPath) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(targetPath, resolve, reject);
        });
    }

    /**
     * @description Creates a new file in the given directory.
     * @param fileName The name of the file to create.
     * @param directoryEntry The directory object pointing to the directory in which to create the file.
     * @returns {Promise<unknown>} Resolves to a file object or rejects with an error.
     */
    function createNewFile(fileName, directoryEntry) {
        return new Promise((resolve, reject) => {
            directoryEntry.getFile(fileName, { create: true, exclusive: true }, resolve, reject);
        });
    }

    /**
     * @description Writes a blob of data to a file.
     * @param blob The blob object to write.
     * @param fileEntry The file entry object in which to write the data.
     * @returns {Promise<unknown>} Resolves if the write is successful, or rejects with an error.
     */
    function writeBlobToFile(blob, fileEntry) {
        return new Promise((resolve, reject) => {
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = () => {
                    console.log("Write completed");
                    resolve(true);
                };

                fileWriter.onerror = function(event) {
                    console.log("Write failed: " + event.toString());
                    reject(event);
                };

                fileWriter.write(blob);

            }, function (err) {
                console.error("Error creating file writer: " + JSON.stringify(err));
                reject(err);
            });
        });
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
        let extension = getFileExtension(url);

        // Check whether the file name contains a French character (would cause the plugin to fail if shared by attachment)
        // This check can be removed if cordova-plugin-x-socialsharing is fixed to handle French characters in file names
        let frenchChars = ['â', 'à', 'ä', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ì', 'ï', 'ô', 'ò', 'ù', 'û', 'ü', 'œ', 'ÿ'];
        let hasFrenchChars = frenchChars.some(c => { return filename.toLowerCase().includes(c); });

        // Return whether the extension is in the accepted list (case insensitive), and doesn't contain French characters
        // In this case, the file should be shared by attachment
        return !hasFrenchChars && attachmentExtensions.includes(extension.toLowerCase());
    }

    /**
     * @description Extracts the file extension at the end of a url.
     * @param {string} url The url from which to get the extension.
     * @returns {string} The file extension found after the last forward slash in the url, or an empty string
     *                   if the url doesn't end in an extension.
     */
    function getFileExtension(url) {
        // Extract the last part of the url (this will be the file name, if the url points to a file)
        let filename = url.split('/').pop();

        // Check whether the file name has an extension (this will return the empty string if there is no extension)
        // Formula: https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/12900504#12900504
        let extension = filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1);

        return extension;
    }

    /**
     * @description Adds a file to a list of files which will be deleted regularly, such as when the user logs out.
     * @param {string} path - The path to the folder containing the file on the device, not including the name of the file.
     * @param {string} name - The name of the file.
     */
    function markFileForDeletion(path, name) {
        // Adds the filename to an array to be deleted on exit of the app (by CleanUp.Clear())
        let Documents = $injector.get('Documents');
        Documents.addToDocumentsDownloaded(path, name);
    }

    /**
     * @description Uses the file-opener2 plugin to open the target file.
     * @param targetPath The path to the file to open.
     * @param mimeType The file's MIME type (e.g. 'application/pdf').
     * @returns {Promise<unknown>} Resolves if the write is successful, or rejects with an error.
     */
    function openWithFileOpener(targetPath, mimeType) {
        return new Promise((resolve, reject) => {
            cordova.plugins.fileOpener2.open(targetPath, mimeType, {
                error : reject,
                success : resolve,
            });
        });
    }

    /**
     * @description Promise wrapper for the shareWithOptions() function of cordova's social sharing plugin.
     * @param {Object} options - The options to pass to the plugin's share function.
     * @returns {Promise<unknown>}
     */
    function shareWithPlugin(options) {
        return new Promise((resolve, reject) => {
            window.plugins.socialsharing.shareWithOptions(options, resolve, reject);
        });
    }

    /**
     * @description Shares a file using cordova's social sharing plugin.
     *              If the url to the file is in base64 format, the file will first be saved to the device.
     * @param {string} name - The name of the file to share.
     * @param {string} url - The url to the file, either in base64 format or on the web.
     * @returns {Promise<void>} Resolves when the plugin success callback is triggered, or rejects with an error.
     */
    async function shareDocument(name, url) {
        if (!Constants.app) throw "Sharing is only available on mobile devices.";

        // If the url is in base64, download it first
        let fileWasDownloaded = false;
        if (urlIsBase64(url)) {
            let path = urlDeviceDocuments;
            await downloadFileIntoStorage(url, path, name);
            markFileForDeletion(path, name);
            url = joinPathName(path, name);
            fileWasDownloaded = true; // This will enforce that the file should be shared by attachment
        }

        // Set the plugin options
        let options = {
            subject: name,
            message: name,
        };

        // Determine whether to share the file by link or by attachment
        fileWasDownloaded || toShareByAttachment(url)
            ? options.files = [url] // Share by attachment (the file itself is shared)
            : options.url = url;    // Share by link (a link to the file is shared)

        // Share the file using a cordova plugin
        let shareResult = await shareWithPlugin(options);

        console.log(`Share plugin result: ${JSON.stringify(shareResult)}`);
    }

    /**
     * @description Shares a document by calling shareDocument(). This function handles sensitive data by deleting the
     *              file immediately after sharing, if it needed to be saved to the device first.
     * @param {string} name - The name of the file to share.
     * @param {string} url - The url to the file in base64 format.
     *                       Note: if the url points instead to a web file, this function behaves no differently than
     *                       shareDocument(), since the file doesn't need to be downloaded first.
     * @returns {Promise<void>} Resolves when the plugin success callback is triggered, or rejects with an error.
     */
    async function shareSensitiveDocument(name, url) {
        await shareDocument(name, url);

        // If the document is in base64 and had to be downloaded, delete it now
        if (urlIsBase64(url)) {
            let Documents = $injector.get('Documents');
            Documents.deleteDocumentDownloaded(joinPathName(urlDeviceDocuments, name));
        }
    }

    /**
     *@ngdoc method
     *@name openPDF
     *@methodOf MUHCApp.service:FileManagerService
     *@param {String} url The URL of the file to open from the web, or in base64 format.
     *@param {String} newDocName New name to give the file if it needs to be downloaded.
     *@description If on an Android device, it opens the pdf using a third party software.
     *             If on an iOS device or a browser, it simply opens it in a new browser window.
     *             In fact, this function should be named openFile() because it could open not only pdf, but many different file types with the following extensions:
     *             .doc, .docx, .xls, .xlsx, .rtf, .wav, .gif, .jpg, .jpeg, .png, .txt, .mpg, .mpeg, .mpe, .mp4, .avi, .ods, .odt, .ppt, .pptx, .apk
     *             (note: to support the above file types, this function should detect the right MIME type instead of assuming 'application/pdf').
     *
     *             It opens the file by passing as a parameter a URL of the location of the file (not .html, should be .pdf .doc etc...) OR a file path to the local storage
     *             URL example: https://www.opal.com/myDocument.pdf
     * @returns {Promise<void>} Resolves on success or rejects with an error.
     */
    async function openPDF(url, newDocName) {
        if (Constants.app && ons.platform.isAndroid()) {
            let path = urlDeviceDocuments;
            let targetPath = joinPathName(path, newDocName);

            await downloadFileIntoStorage(url, path, newDocName);
            markFileForDeletion(path, newDocName);
            await openWithFileOpener(targetPath, 'application/pdf');

            console.log('File opened successfully with file opener');
        }
        else Browser.openInternal(url);
    }

    /**
     * @description Appends a document name at the end of a path, making sure the path and name are separated by a single forward slash.
     * @param {string} path - A path that does not end in a file name.
     * @param {string} fileName - The name of the file to append to the path.
     * @returns {string} The combined path to the file.
     */
    function joinPathName(path, fileName) {
        let formattedPath = path.replace(/\/+$/, ''); // Remove trailing forward slashes
        let formattedFileName = fileName.replace(/^\/+/, ''); // Remove leading forward slashes
        return formattedPath + '/' + formattedFileName;
    }

    /**
     * @description Takes a path to a file and separates in into two parts: the path to the folder containing the file,
     *              and the file name.
     *              Note: the first returned element (path to the folder containing the file) will not end in a trailing slash.
     * @param {string} fullPath - The full path to split into path and file name.
     * @returns {string[]} An array of two elements: [path to the folder containing the file, file name].
     */
    function separatePathName(fullPath) {
        let pieces = fullPath.split('/');
        let fileName = pieces.length === 1 ? "" : pieces.pop();
        return [pieces.join('/'), fileName];
    }

    return {
        getFileExtension: getFileExtension,

        shareDocument: shareDocument,

        shareSensitiveDocument: shareSensitiveDocument,

        openPDF: openPDF,

        generateDocumentName: function (document) {
            const title = document.Title.replace(/ /g, "_");
            const date =  document.ApprovedTimeStamp.toDateString().replace(/ /g, "-");
            return `${title}_${date}.${document.DocumentType}`;
        },

        joinPathName: joinPathName,

        separatePathName: separatePathName,

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
