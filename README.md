# MUHC Oncology Patient Application
Opal - the MUHC Oncology Patient Application for mobile phones and the web - is a product that has arisen from the winning project of the 2014 MUHC Q+ initiative. The project proposal was submitted by the Health Informatics Group (HIG, see below) and was entitled “Realistic knowledge-based waiting time estimates for radiation oncology patients - addressing the pain of waiting”. It had as its goal the provision of waiting time estimates to radiation oncology patients. 

To download the codebase and get the Opal Mobile App running in your browser or on a device, follow the instructions below.

### Installation
[Install NodeJS](https://nodejs.org/en/download/) 
**NOTE: For proper access to the backend you must have version 6+**

Install http-server
```
npm install -g http-server
```
Install bower
```
npm install -g bower
```
Clone from github 
```
git clone https://github.com/Sable/qplus.git
```
Navigate to qplus folder and install missing librairies
```
bower install -force
```

### Browser View Only
Opal can be viewed and tested in the browser without having to deploy to any device. However, this is not a substitute for actual device testing. To view Opal in the browser do the following:

1. Follow instructions in the [Installation](#installation) section
2. Navigate to /{path_to_qplus}/www and type the command `http-server`;
3. Navigate to the localhost path that the terminal tells you it's hosting on in your browser, a webview version of the app should be shown.
4. In order to view the app in a mobile view, right click the page and the select "inspect" in the menu options. Your developer console will open and you will see a tablet/mobile icon in top left corner of console. Clicking this will change the view to the corresponding mobile device aspect-ratio.

Most browsers come with Javascript developer consoles built in. I personally enjoy using Google Chrome, but I know Firefox has a powerful debugging console as well. These can be used to debug the application.

### Mobile Device View
[Cordova](https://cordova.apache.org/) enables software programmers to build applications for mobile devices using JavaScript, HTML5, and CSS3, instead of relying on platform-specific APIs like those in Android, iOS, or Windows Phone. It enables wrapping up of CSS, HTML, and JavaScript code depending upon the platform of the device. It extends the features of HTML and JavaScript to work with the device. The resulting applications are a hybrid between web and native.

Cordova has the ability to build applications for iOS, Android and browsers using one code base.

Instructions are based on [Cordova get started page!](https://cordova.apache.org/#getstarted)

1. Follow instructions in the [Installation](#installation) section
2. Install Cordova via `npm install -g cordova`.
3. Create a Cordova Project `cordova create <NameOfProject>`.
4. Change directory to your newly created cordova project `cd <NameOfProject>`.
5. Copy the res folder to the cordova folder project, and replace the config.xml file in the cordova project with the config.xml file in this repository.
6. Add the contents of the www folder to the www folder in your cordova project.
7. Add platforms to your project:
  * `cordova platform add ios`
  * `cordova platform add android`
8. Build your app via: `cordova build`. For an specific platform build use:
 ``` 
cordova build <platform>
```
9. Connect your phone via USB to your computer and run your project:
 ```
cordova run <platform>
```

### When you're ready to start coding

## AngularJS
Please refer to the following guideline if you aren't familiar Papa John's style guide for angularJS: https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md
### Technologies
Opal utilizes the following technologies:
* [Cordova](https://cordova.apache.org/)
* [AngularJS](https://angularjs.org/)
* [OnsenUI](https://onsen.io/)
* [NodeJS](https://nodejs.org/)

New developers working on the project should familairize themselves with AngularJS, OnsenUI and Cordova.

### Browser View Only
Opal can be viewed and tested in the browser without having to deploy to any device. However, this is not a substitute for actual device testing. To view Opal in the browser do the following:

1. Follow instructions in the [Installation](#installation) section
2. Navigate to /{path_to_qplus}/www and type the command `http-server`;
3. Navigate to localhost:8080 in your browser, a webview version of the app should be shown.

Most broswers come with Javascript developer consoles built in. These can be used to debug the application.

### Browser/Mobile View
[Cordova](https://cordova.apache.org/) enables software programmers to build applications for mobile devices using JavaScript, HTML5, and CSS3, instead of relying on platform-specific APIs like those in Android, iOS, or Windows Phone. It enables wrapping up of CSS, HTML, and JavaScript code depending upon the platform of the device. It extends the features of HTML and JavaScript to work with the device. The resulting applications are a hybrid between web and native.

Cordova has the ability to build applications for iOS, Android and browsers using one code base.

Instructions are based on [Cordova get started page!](https://cordova.apache.org/#getstarted)

1. Follow instructions in the [Installation](#installation) section
2. Install Cordova via `npm install -g cordova`.
3. Create a Cordova Project `cordova create <NameOfProject>`.
4. Change directory to your newly created cordova project `cd <NameOfProject>`.
5. Copy the res folder to the cordova folder project, and replace the config.xml file in the cordova project with the config.xml file in this repository.
6. Add the contents of the www folder to the www folder in your cordova project.
7. Add platforms to your project:
  * `cordova platform add ios`
  * `cordova platform add android`
  * `cordova platform add browser`
8. Build your app via: `cordova build`. For an specific platform build use:
 ``` 
cordova build <platform>
```
9. Connect your phone via USB to your computer and run your project:
 ```
cordova run <platform>
```

#### Plugins:

You should not need to worry about plugins, but in case something goes wrong, you will need to add them manually using
 ```
cordova plugin add <nameOfPlugin>
```

* phonegap-plugin-push --variable SENDER_ID="810896751588"
* com-badrit-printplugin
* nativesettingsopener
* cordova-plugin-app-version
* cordova-plugin-calendar
* cordova-plugin-compat
* cordova-plugin-device
* cordova-plugin-dialogs
* cordova-plugin-email
* cordova-plugin-file
* cordova-plugin-file-opener2
* cordova-plugin-file-transfer
* cordova-plugin-fileopener
* cordova-plugin-geolocation
* cordova-plugin-globalization
* cordova-plugin-inappbrowser
* cordova-plugin-media
* cordova-plugin-network-information
* cordova-plugin-print-pdf
* cordova-plugin-splashscreen
* cordova-plugin-whitelist
* cordova-plugin-x-socialsharing
* cordova-plugin-x-toast
* cordova-plugin-exitapp
* de.appplant.cordova.plugin.printer
* cordova-plugin-progressindicator
* phonegap-plugin-barcodescanner
* cordova-plugin-android-permissions

#### Credentials
 * email:muhc.app.mobile@gmail.com
 * password:12345
 * securityAnswer: guitar

#### Problems

##### IOS
* If you are not running from an Apple computer a build and run for ios is not possible as it requires XCode to compile

##### Android
* You have to have installed the AndroidSDK with the most updated version, follow instructions given by [Android developer!](http://developer.android.com/sdk/installing/index.html)
* Once the SDK is installed you have to tell cordova where to find the SDK, via the bash_profile folder, for instructions on this:
[Cordova and Android!](https://cordova.apache.org/docs/en/2.5.0/guide/getting-started/android/). 

### Quirks
The body tag on the index.html file contains the ng-app attribute to initialize the AngularJS code. It turns out that if you don't bootstrap AngularJS manually when the device is ready the AngularJS code will run and crash before the device is ready because is trying to use some of the plugins that are not yet made available by the device. Therefore, whenever you run the code in a browser, keep the ng-app="MUHCApp" attribute, but if you want to run it on your device, delete the attribute from the body element.  

## Adding to the repo
If you would like add your code to the repository, create a new branch and submit a pull request. One of our team will review your code before merging.

