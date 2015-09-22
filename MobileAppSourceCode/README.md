# Installing the App for MacOS

1. Install cordova following:

```
$ sudo npm install -g cordova
```
2. To create a project run:

```
cordova create hello com.example.hello HelloWorld
```
hello is the name of your folder, com.example.hello is the unique identifier for the app and company used in IOS, and HelloWord is the name of 
the app

3. Install the platforms

```
$cordova platform add android
$cordova platform add ios
```
>If you already have it use, you may have to do it anyways.
```
    $ sudo npm update -g cordova
    $ cordova platform update android
    $ cordova platform update ios
```
4. Add plugins:

The command to add plugins is:
```
$ cordova plugin add org.apache.cordova.device
```
The plugins are:

- cordova-plugin-inappbrowser 1.0.1 "InAppBrowser"
- cordova-plugin-whitelist 1.0.0 "Whitelist"
- io.github.pwlin.cordova.plugins.fileopener2 1.0.11 "File Opener2"
- org.apache.cordova.battery-status 0.2.12 "Battery"
- org.apache.cordova.device 0.3.0 "Device"
- org.apache.cordova.dialogs 0.3.0 "Notification"
- org.apache.cordova.file 1.3.3 "File"
- org.apache.cordova.file-transfer 0.5.0 "File Transfer"
- org.apache.cordova.geolocation 0.3.12 "Geolocation"
- org.apache.cordova.network-information 0.2.15 "Network Information"
- org.apache.cordova.vibration 0.3.13 "Vibration"

>You probably will not need fileOpener, vibration and Notification for now until we register the app for push notifications.

5. Grab code from Github and replace the files in the www folder.
6. To run your project on either device emulator:
```
$cordova run android
$cordova run ios
```
If an android device is plugged in, running on android will cause to run the app on the device.

##Quirks:

- Every device has a device ready event, just like a browser has a document.ready event, in the index.html file line 112, if you are going
to run the code in a device remove the attribute ng-app="MUHCApp", right above it we are manually bootstrapping Angular only 
when the device plugins and everything is ready. If you are on the other hand developing and running on a server on the web,
keep the tag as Angular only runs when the document is ready anyways. 

- You may also have to tell it where the Android SDK is, [Cordova](https://cordova.apache.org/docs/en/2.5.0/guide_getting-started_android_index.md.html)

##References:
- [Cordova Docs] (https://cordova.apache.org/docs/en/4.0.0/) Cordova docs page
- [AngularJS] (https://angularjs.org/) AngularJS main page
- [NgCordova] (http://ngcordova.com/) Plugins for cordova working as Angular dependecies
- [BootstrapUI] (https://angular-ui.github.io/bootstrap/) Some components were used like the calendar although its use is limited
- [OnsenUI] (http://onsen.io/) - Styling and native like feeling used also for its javascript
- [Bootstrap] (http://getbootstrap.com/) -Used the css mostly.

>Check under the lib folder all the other plugins if interested, above are just the main ones.

##Documentation

Use ngdocs




