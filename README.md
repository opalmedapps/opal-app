#MUHC Oncology Patient Application
![MUHC](/mobile/img/muhc-logo-text.png)

[OPAL](/mobile/img/opal.png)
Opal - the MUHC Oncology Patient Application for mobile phones and the web - is a product that has arisen from the winning project of the 2014 MUHC Q+ initiative. The project proposal was submitted by the Health Informatics Group (HIG, see below) and was entitled “Realistic knowledge-based waiting time estimates for radiation oncology patients - addressing the pain of waiting”. It had as its goal the provision of waiting time estimates to radiation oncology patients. 

###Quick app deployment, Simple App displayed in browser
####Steps:
1. Download the mobile app code from the mobile folder in the repository.
2. Download NodeJS following the instructions in this manual [Install Node!](https://nodejs.org/en/download/).
3. Install the node package http-server to create a localhost for the app, via ` npm install http-server -g`
4. Go to the folder where the mobile app code was donwloaded and simply type the command `http-server`;
5. Go to localhost:8080 in your browser and the app should display.

###Cordova Projects
Mobile apps with HTML, CSS & JS
Target multiple platforms with one code base
Free and open source
[Main Site!](https://cordova.apache.org/)
####Steps:
Instructions are based from [Cordova get started page!](https://cordova.apache.org/#getstarted)

1. In the command line, go to the folder location where you would like your cordova project to take place.
2. Install NodeJS and NPM as per the instructions above.
3. Install Cordova via `$ npm install -g cordova`.
4.  Create a Cordova Project `$ cordova create <NameOfProject>`.
5. Change directory to your newly created cordova project ` $ cd <NameOfProject>`.
6. Add platforms to your project:
```
 $ cordova add platform ios
 $ cordova add platform android
 $ cordova add platform browser
```
7.Build your basic app via: `$ cordova build`.
  * For an specific platform build use:
``` 
$ cordova build <nameOfPlatform>
```
8.Add all the app plugins using the command:
```
$cordova plugin add <nameOfPlugin>
```
List of plugins to be downloaded:
* cordova-plugin-battery-status 1.1.1 "Battery"
* cordova-plugin-calendar 4.4.4 "Calendar"
* cordova-plugin-device 1.1.0 "Device"
* cordova-plugin-dialogs 1.2.0 "Notification"
* cordova-plugin-file 3.0.0 "File"
* cordova-plugin-file-transfer 1.4.0 "File Transfer"
* cordova-plugin-geolocation 2.0.0 "Geolocation"
* cordova-plugin-inappbrowser 1.1.0 "InAppBrowser"
* cordova-plugin-network-information 1.1.0 "Network Information"
* cordova-plugin-whitelist 1.0.0 "Whitelist"
* de.appplant.cordova.plugin.email-composer 0.8.3dev "EmailComposer"
9. Add the contents of the mobile folder to the www folder in your cordova project.
10. To run your project run:
```
$cordova run <platform>
```
  * For webview `$cordova run browser`
  * For IOS `$cordova run ios`(See below for problems)
  * For Android `$cordova run android` (See below for problems)
####Problems
In this section problems that might be encountered will be discussed 
#####IOS
* If you are not running from an Apple computer a build and run for ios is not possible as it requires XCode to compile
#####Android
* You have to have install the AndroidSDK with the most updated version, follow instructions given by [Android developer!](http://developer.android.com/sdk/installing/index.html)
* Once the SDK is install you have to tell cordova where to find the SDK, via the bash_profile folder, for instructions on this:
[Cordova and Android!](https://cordova.apache.org/docs/en/2.5.0/guide/getting-started/android/). 



