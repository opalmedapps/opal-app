# MUHC Oncology Patient Application
Opal - the MUHC Oncology Patient Application for mobile phones and the web - is a product that has arisen from the winning project of the 2014 MUHC Q+ initiative. The project proposal was submitted by the Health Informatics Group (HIG, see below) and was entitled “Realistic knowledge-based waiting time estimates for radiation oncology patients - addressing the pain of waiting”. It had as its goal the provision of waiting time estimates to radiation oncology patients. The app has now extended its initiative to provide appointments, lab results, clinical documents, educational material and much more, making it a full-fledged, empowerment tool for those undergoing radiation treatment.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

#### Front-End

In order to run the app in your browsing for development and basic testing purposes, there are a few steps you must take:

* Clone the repository to the desired folder in your computer **(NOTE: You need to be added as a contributer to the project before being able to do this!)**

```
git clone https://github.com/Sable/qplus.git
```

* [Install latest version of NodeJS](https://nodejs.org/en/download/) 
**(NOTE: For proper access to the backend you must have version 6+)**

Once this is done, verify that you installed Node globally but running the command.

```
node -v
```

If you see the current version of the Node runtime installed, then all is good! Otherwise please consult Node's troubleshooting manual or Google the error that occurs.

* Install http-server

```
npm install -g http-server
```

This globally installs a simple, zero-configuration command line server that will be used to host the Opal app locally when developing in the browser.

* Install [Bower](https://bower.io/)

```
npm install -g bower
```

Bower is our application's package manager. This allows all of our libraries to stay in sync and updated across all developing platforms.

* Download App's dependencies via Bower

In order to do this you need to navigate to the parent directory of the project (qplus/) and then run the following command:

```
bower install -force
```

The force flag is used because sometimes you might have global dependencies installed and bower install will skip over those dependencies even though they are needed locally.

**NOTE: In the past there have been multiple students who have had trouble install dependencies due to strange permission issues that would block the ability to write to certain directories... so don't worry if this happens to you! If this occurs, the problem is easily fixable by some simple Google searching. There seemed to have been various solutions for different people so I can't really provide a troubleshooting manual for every case.**



### Running Development Environment

A step by step series of examples that tell you have to get a development env running

#### Front-End

1) Follow the installation steps previously stated. At this point it is assumed that you have all the global and local dependencies needed installed. If you don't the following steps may not work, or you will get console errors in your browser.
2) In your command-line, navigate to '/path/to/qplus/www/'. 
3) Run the following command:

```
http-server
```

and you should see something similar appear in your console:

```
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://10.37.89.13:8080
Hit CTRL-C to stop the server
```

4) In Chrome or Firefox (they have the best debug console) navigate to one of the addresses provided from the previous step.
5) Open the [developer console](https://developer.chrome.com/devtools) and switch to mobile view.
6) If you followed all the steps correctly there should be errors in the debug console other than a missing cordova.js file. Otherwise please use Google or StackOverflow to solve any issues that arise, or try repeating all the steps again.
7) If all is well you can login to the app with the following credentials:

```
email: muhc.app.mobile@gmail.com
password: 12345opal
```
## Running the tests

Currently the Opal Development team has been making an effort to write tests for all new features. It's important to try
to maintain this effort to avoid any code regression.

**MORE TO COME...**

## Deployment

Deployment is a rather rigorous process due to the nature of producing software that runs on various platforms. However, James
has written a simple, yet practical build script that avoids a lot of the headaches in building the app. It is planned to extend the build script
in order to make deployment automated as well...

### Prerequisites

Before being able to run build script there are a few steps one has to take that involves configuring the build script and cordova project.

**NOTE: You will need to follow these steps for both PreProd and Prod since they both have unique app distributions, configurations, and build processes!**

**IMPORTANT: In order to build iOS versions of the app you must have XCode installed which requires an Apple Computer. If you have
Linux or Windows you can only build Android distribution**

1) Follow the the instructions in the Installation section.
2) Install [Cordova](https://cordova.apache.org/) globally with the following command:

```
npm install -g cordova
```

3) Create a Cordova project in any desired directory that's **NOT** the in qplus directory:

```
cordova create <NameOfProject>
```

4) Navigate to this newly created directory.

5) Replace the current config.xml with the one in the qplus parent directory

**NOTE: Both Prod and PreProd branches have their own config.xml. Carefully make sure you are copying over the correct one!**

6) Add Android and iOS (if on macOS) platforms to cordova project:

```
cordova platform add ios
cordova platform add android
```

Now you will a properly configured Cordova project that can be compiled into both Android and iOS native code. However there
are still some dependencies needed for the build script to run properly...

7) Install [Gulp](https://gulpjs.com/) globally

```
npm install -g gulp
```

Gulp is in charging of automating a lot of the build process such as minifying html/css/javascript, compressing images,
and removing debug statements.

8) (**WINDOWS AND LINUX ONLY**) Change build script to only build Android distribution

9) Change working (qplus project parent) and target (Cordova project parents) directories in build script to match your computer's destinations

Voila! You are now ready to run build script. If you didn't follow any of these properly the build script will catch and report it you.


### Building



## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc





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
 * password:12345opal
 * securityAnswer: guitar

Sometimes this account work due to backend changes or various other reasons due to development..
No fret.. we have a backup account in case the first login doesn't work (it normally should though).

 * email: muhca.pp.mobile@gmail.com
 * password: 12345opal
 * security answer (depending on question): red, guitar, superman
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

