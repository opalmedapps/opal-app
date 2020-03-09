# MUHC Oncology Patient Application
Opal - the MUHC Oncology Patient Application for mobile phones and the web - is a product that has arisen from the winning project of the 2014 MUHC Q+ initiative. The project proposal was submitted by the Health Informatics Group (HIG, see below) and was entitled “Realistic knowledge-based waiting time estimates for radiation oncology patients - addressing the pain of waiting”. It had as its goal the provision of waiting time estimates to radiation oncology patients. The app has now extended its initiative to provide appointments, lab results, clinical documents, educational material and much more, making it a full-fledged, empowerment tool for those undergoing radiation treatment.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

#### Front-End

In order to run the app in your browsing for development and basic testing purposes, there are a few steps you must take:

* Clone the repository to the desired folder in your computer (create an empty folder for this). **(NOTE: You need to be added as a contributer to the project before being able to do this!)**

```
git clone https://github.com/Sable/qplus.git
```

* Checkout the branch you wish to install. Normally the development branch is the `staging` branch. Here we branch off 
and add the require logic. 

```
git fetch
git checkout -b staging origin/staging # This pull staging from remove creates a local staging branch
git checkout -b staging_new_branch # This creates the new branch of the `staging` branch
```

* Install the latest version of [NodeJS](https://nodejs.org/en/download/). If you have already done this, skip this step. **(NOTE: For proper access to the backend you must have version 12+)**

Once this is done, verify that you installed Node globally by running
running `$node -v`

If you see the current version of the Node runtime installed, then all is good! Otherwise please consult Node's troubleshooting manual or Google the error that occurs.

This installation also installs the Node.js package manager [npm](https://docs.npmjs.com/getting-started/what-is-npm).
The main/description file for a Node.js application is the 
[package.json](./package.json) file. This file states all the dependencies for the app
and the versions for each of them. _npm_'s job is to manage these dependencies.
* Install globally `webpack`, `webpack-dev-server`, `cordova`.
```
    npm install -g webpack webpack-dev-server cordova
```
[Webpack](https://webpack.js.org/) is a compiler & task manager which packages your app, some of the jobs it has are as follows
1. Control the Opal environments, Opal uses different development environments,
_webpack_ allows us to easily specify environment variables for each.
2. Emit [uglify](https://webpack.js.org/plugins/terser-webpack-plugin/) version of your code in one file.
3. Compile the code to an older version of JavaScript using [babel](https://babeljs.io/), this allows us to use the latest features from 
JavaScript without worrying about JavaScript compatibility in patient devices.
4. Optimize the code in different ways.
For more information on _webpack_ see: https://survivejs.com/webpack/what-is-webpack/

[webpack-dev-server](https://webpack.js.org/configuration/dev-server/) is an web server which to serve _webpack_'s bundles.

[Cordova](https://cordova.apache.org/) is the build tool to build the web application for both Android and iOS.

* Install the app dependencies
```
 npm install
```  
* Prepare environment and Cordova code regarding platforms (iOS, Android), and cordova plugin dependencies
```
npm run prepare:staging
```
* To test your app build in a browser run: (Make sure port 9000 isn't used up by your computer, otherwise modify the `webpack.config.js` file)
```
npm run start:web:staging
```
This command should open a browser in the address `http://localhost:9000` and once the app compiles,
open the app. 
### Building the app in a mobile device
The following steps will allow you to set up the app with Cordova. For more information and troubleshooting:
https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html, https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html
1) Install [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and update your OS's JAVA_HOME variable (you'll need to Google how to do this depending on your OS). **NOTE: Cordova has an issue with JDK 9 so you need to make sure you have JDK 8 installed and referenced as an environment variable or Cordova will not be able to build**
2) Install [Android Studio](https://developer.android.com/studio/index.html) and [Xcode](https://developer.apple.com/xcode/) (if using macOS)
3) **(macOS Only)** Install and setup [CocoaPods](https://stackoverflow.com/questions/20755044/how-to-install-cocoa-pods) 
4) Install [Cordova](https://cordova.apache.org/) globally with the following command:
 
 
* Run the build command 
```
npm run build:staging
```
The command above builds the app for both Android and iOS to build platform specific code use:
```
npm run build:staging:ios
npm run build:staging:android
```

* Finally run the Cordova app
```
npm run start:staging:ios
npm run start:staging:android
```
Lastly, we have added commands for developer convenience to the `package.json`. Take some
time to understand what they do, here is a list of them.
```
  "scripts": {
    "prepare:prod": "node -e \"require('./opal_env.setup.js').copyEnvironmentFiles('prod')\" && cordova prepare",
    "prepare:preprod": "node -e \"require('./opal_env.setup.js').copyEnvironmentFiles('preprod')\" && cordova prepare",
    "prepare:staging": "node -e \"require('./opal_env.setup.js').copyEnvironmentFiles('staging')\" && cordova prepare",
    "build:web": "webpack",
    "build:web:prod": "npm run prepare:prod && webpack --env.opal_environment=prod",
    "build:web:preprod": "npm run prepare:preprod && webpack --env.opal_environment=preprod",
    "build:web:staging": "npm run prepare:staging && webpack --env.opal_environment=staging",
    "build": "npm run build:web && cordova build --device --verbose",
    "build:prod": "npm run build:web:prod && cordova build --release  --verbose",
    "build:preprod": "npm run build:web:preprod && cordova build --device --verbose",
    "build:staging": "npm run build:web:staging && cordova build --verbose",
    "build:staging:ios": "npm run build:web:staging && cordova build ios --verbose",
    "build:staging:android": "npm run build:web:staging && cordova build android --verbose",
    "start": "webpack-dev-server --open",
    "start:web:prod": "webpack-dev-server --open --env.opal_environment=prod",
    "start:web:preprod": "webpack-dev-server --open --env.opal_environment=preprod",
    "start:web:staging": "webpack-dev-server --open --env.opal_environment=staging",
    "start:staging": "npm run build:staging && cordova run",
    "start:staging:ios": "npm run build:staging:ios && cordova run ios",
    "start:staging:android": "npm run build:staging:android && cordova run android",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
```

### Optional
* Install http-server

```
npm install http-server -g
```
This globally installs a simple, zero-configuration command line server that may be used to host the Opal app locally when developing in the browser.
Sometimes it is useful to quickly have a server in order to
test a particular page or app. For this http-server is a great package.
For instance, an alternative to `npm run start:web:staging` which uses _webpack-dev-server_,
is to build the web app using `npm run build:web:staging`, change directory to
the `www` and run `http-server` inside this directory. In one command
```
$npm run build:web:staging && cd www && http-server -p 9000 -o # Build the app, and serve it in port 9000
```

### Running Development Environment

A step by step series of examples that tell you have to get a development env running

#### Front-End

1) Run the following command:
```
npm run start:web:staging
```
2) In Chrome or Firefox (they have the best debug console) navigate to one of the addresses provided from the previous step.
3) Open the [developer console](https://developer.chrome.com/devtools) and switch to mobile view and [disable caching](http://nicholasbering.ca/tools/2016/10/09/devtools-disable-caching/).
4) If you followed all the steps correctly there should not be any errors in the debug console other than a missing cordova.js file. Otherwise please use Google or StackOverflow to solve any issues that arise, or try repeating all the steps again.
5) If all is well you can login to the app with the following credentials:

```
email: muhc.app.mobile@gmail.com
password: 12345opal
security answer (depending on question): red, guitar, superman, dog, bob, cuba
```
## Running the tests

Currently the Opal Development team has been making an effort to write tests for all new features. It's important to try
to maintain this effort to avoid any code regression.

**MORE TO COME...**

### Emulating

Before deploying and after you have ran your unit tests, developers should still test the application either on a device or an emulator.

It is quite simple to do either:

1) Follow the build steps listed below in the Deployment section (you will need to follow both the PreRequisites and Build subsections for the next steps to work). 

Once you have built the app you have two options...

2) Use Cordova to load APK onto phone using

```
npm run start:staging[:ios|:android]
```

3) Using [XCode](https://developer.apple.com/library/content/documentation/IDEs/Conceptual/iOS_Simulator_Guide/Introduction/Introduction.html) or [Android Studio](https://developer.android.com/studio/run/emulator.html) to run emulator or load APK onto phone. 

## Building

Building is a rather rigorous process due to the nature of producing software that runs on various platforms. However, James Brace
has written a simple, yet practical build script that avoids a lot of the headaches in building the app. It is planned to extend the build script
in order to make deployment automated as well...


## Deployment

Just like building, deployment is rather tedious and has a bit of overheard when performing for the first time. Currently there is no deployment script, however James Brace plans on developing one to expedite and automate the process.

### Prerequisites
1) Follow the Prerequisites for Building
2) Install [Fabric](https://fabric.io/kits?show_signup=true) and create an account. Here's [how to install the plugin for Android Studio.](https://docs.fabric.io/android/fabric/overview.html)
3) Have an existing team member add you to the Opal Health Fabric project
4) Open up Android Studio and/or Xcode (if using macOS) and open the projects that exist underneath the Cordova project platform directories. For example for Android Studio point the existing project to /path/to/cordova/project/platforms/android
5) (**macOS ONLY**) Create an Apple Developer Account. You will need an existing team member to help you with this. Once you have an Apple Developer Account to use, you will need to configure the Xcode project with that account in order to provision and build.
6) Make sure the Fabric app for Xcode and Android studio is properly configured.
7) Follow Crashlytics installation in the Fabric apps (will need to do this for both Android and iOS). You may need an existing team member's help to set this up.

### Deploying
1) Follow the instructions for Building
2) Open and login to Fabric
3) Open Android Studio and/or Xcode
4) In Fabric application/plugin go to builds section of your desired app
5) Upload the built application to Fabric
    * If on Android Studio, simply drag the APK from /build/outputs/apk
    * If on Xcode, Archive the project and if you are logged into Fabric, the app will automatically detect the Archive and ask you to distribute.
    * For more information on how to distribute builds via Fabric and Beta [visit their documentation](https://docs.fabric.io/apple/beta/overview.html)


## Best Practices

1) When developing in the frontend, please follow [John Papa's Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
2) Any new features should be unit tested
3) Any new features should be documented using JSDoc format
4) Any new features should be added to the Wiki
5) Follow this [branching model](http://nvie.com/posts/a-successful-git-branching-model/)

## Built With

* [AngularJS](https://angularjs.org/) - The web framework used
* [OnsenUI](https://onsen.io/) - The mobile UI framework used
* [Cordova](https://cordova.apache.org/) - The mobile application framework used
* [Node.JS](https://nodejs.org/en/) - Runtime environment for our server-side code


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **David Herrera**
* **Robert Maglieri**
* **James Brace**
* **Yick Mo**

<!-- See also the list of [contributors](https://github.com/Sable/dh/contributors) who participated in this project. -->

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Medical Physics department at the MUHC for providing a space to work in
* Cedar's Cancer Centre
* Laurie Hendren, John Kildea, and Tarek Hijal for founding the initiative
* All the McGill students who have graciously contributed to the development

