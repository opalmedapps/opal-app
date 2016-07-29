#MUHC Oncology Patient Application
![MUHC](/www/img/Opal_Logo_Full_2.png)
Opal - the MUHC Oncology Patient Application for mobile phones and the web - is a product that has arisen from the winning project of the 2014 MUHC Q+ initiative. The project proposal was submitted by the Health Informatics Group (HIG, see below) and was entitled “Realistic knowledge-based waiting time estimates for radiation oncology patients - addressing the pain of waiting”. It had as its goal the provision of waiting time estimates to radiation oncology patients. 

###Quick app deployment, Simple App displayed in browser
####Steps:
1. Download the app code from the www folder in the repository.
2. Download NodeJS following the instructions in this manual [Install Node!](https://nodejs.org/en/download/).
3. Install the node package http-server to create a localhost for the app, via ` npm install http-server -g`
4. Go to the folder where the mobile app code was donwloaded and simply type the command `http-server`;
5. Navigate to localhost:8080 in your browser, a webview version of the app should be shown.


###Cordova Projects
Apache Cordova enables software programmers to build applications for mobile devices using JavaScript, HTML5, and CSS3, instead of relying on platform-specific APIs like those in Android, iOS, or Windows Phone. It enables wrapping up of CSS, HTML, and JavaScript code depending upon the platform of the device. It extends the features of HTML and JavaScript to work with the device. The resulting applications are hybrid.
[Main Site!](https://cordova.apache.org/)
####Steps:
Instructions are based from [Cordova get started page!](https://cordova.apache.org/#getstarted)

1. In the command line, go to the folder location where you would like your cordova project to take place.
2. Install NodeJS and NPM as per the instructions above.
3. Install Cordova via `$ npm install -g cordova`.
4.  Create a Cordova Project `$ cordova create <NameOfProject>`.
5. Change directory to your newly created cordova project ` $ cd <NameOfProject>`.
6. Add platforms to your project:
  * `$ cordova platform add ios`
  * `$ cordova platform add android`
  * `$ cordova platform add browser`

7. Build your basic app via: `$ cordova build`.
  * For an specific platform build use:
  ``` 
$ cordova build <nameOfPlatform>
```

8. Add all the app plugins from the list below under plugins to be downloaded.
9. Add the contents of the www folder to the www folder in your cordova project.
10. To run your project run:
  ```
$cordova run <platform>
```
  * For webview `$cordova run browser`
  * For IOS `$cordova run ios`(See below for problems)
  * For Android `$cordova run android` (See below for problems)

###List of plugins to be downloaded:
##### NOTE: Try downloading the latest version of these plugins, keep in mind that some of them have been updated since, as a consequence the README.md file may not be up to date, in other words, install the latest version of these plugins, if you have a problem with them, install the version stated on this file if you still have a problem, report the problem.
####Command:
```
$cordova plugin add <nameOfPlugin>
```
####Plugin:
 * cordova-plugin-calendar 4.4.7 "Calendar"
 * cordova-plugin-device 1.1.1 "Device"
 * cordova-plugin-dialogs 1.2.0 "Notification"
 * cordova-plugin-email 1.1.0 "EmailComposer"
 * cordova-plugin-file 4.1.0 "File"
 * cordova-plugin-file-opener2 2.0.2 "File Opener2"
 * cordova-plugin-file-transfer 1.5.0 "File Transfer"
 * cordova-plugin-geolocation 2.1.0 "Geolocation"
 * cordova-plugin-inappbrowser 1.2.0 "InAppBrowser"
 * cordova-plugin-network-information 1.2.0 "Network Information"
 * cordova-plugin-whitelist 1.2.1 "Whitelist"

####Credentials
 * email:muhc.app.mobile@gmail.com
 * password:12345

####Problems

#####IOS
* If you are not running from an Apple computer a build and run for ios is not possible as it requires XCode to compile

#####Android
* You have to have installed the AndroidSDK with the most updated version, follow instructions given by [Android developer!](http://developer.android.com/sdk/installing/index.html)
* Once the SDK is installed you have to tell cordova where to find the SDK, via the bash_profile folder, for instructions on this:
[Cordova and Android!](https://cordova.apache.org/docs/en/2.5.0/guide/getting-started/android/). 

###Quirks
The body tag on the index.html file contains the ng-app attribute to initialize the AngularJS code. It turns out that if you don't bootstrap AngularJS manually when the device is ready the AngularJS code will run and crash before the device is ready because is trying to use some of the plugins that are not yet made available by the device. Therefore, whenever you run the code in a browser, keep the ng-app="MUHCApp" attribute, but if you want to run it on your device, delete the attribute from the body element.  



