# MUHC Oncology Patient Application
Opal - the MUHC Oncology Patient Application for mobile phones and the web - is a product that has arisen from the winning project of the 2014 MUHC Q+ initiative. The project proposal was submitted by the Health Informatics Group (HIG, see below) and was entitled “Realistic knowledge-based waiting time estimates for radiation oncology patients - addressing the pain of waiting”. It had as its goal the provision of waiting time estimates to radiation oncology patients. The app has now extended its initiative to provide appointments, lab results, clinical documents, educational material and much more, making it a full-fledged, empowerment tool for those undergoing radiation treatment.

## Getting Started

The first section of these instructions will get you a copy of the frontend Opal app up and running on your local machine for development and testing purposes. This frontend copy will communicate with the backend infrastructure (listener, database, etc.) already in place at the MUHC. Please note that you must have git installed to follow this guide. The second section (from "Running the tests" on) addresses testing, building and deployment on a live system. This section should be skipped for students or new developers who just want to get started with a frontend copy of Opal for development.

If you have a newer Mac (MacOS High Sierra or later), or are using a firewall or security plugins, you may want to skip directly to [Troubleshooting](#troubleshooting). This may save you some time dealing with installation errors later.

### Prerequisites

#### Front-End

In order to run the app in your browser for development and basic testing purposes, there are a few steps you must take:

* Clone the repository to the desired folder in your computer (create an empty folder for this). **(NOTE: You need to be added as a contributer to the project before being able to do this!)**

```
git clone https://github.com/Sable/qplus.git
```

**Note:** to follow best practices, especially if you intend to also install the listener and database (a "full local copy" of Opal), your folder structure should look like this:
```
<root folder> (wherever you want to keep your documents; this can be an existing folder or a new "Opal" folder)
|_
  Opal Installation (you can change the name if you want; this folder will contain all your installation files)
  |_
    qplus (this is the frontend repository)
```
Never put any new documents in qplus (except for new code files).
You can keep documents in Opal Installation, or in the root folder, whichever you prefer. Just keep everything organized.

* Checkout the `opal_student` branch for installation. You will be able to switch to a different branch when your installation is complete, but you must install using the `opal_student` branch to ensure that your installation will run correctly. Depending on the file structure that was created when cloning, you may need to enter `cd qplus` first to go into the folder containing the repository.

```
git fetch    [Optional: only do this step if you cloned the repository several hours or days ago.]
git checkout -b opal_student origin/opal_student
```

* Install the latest version of [NodeJS](https://nodejs.org/en/download/) globally. If you have already done this, skip this step, but follow the instruction for verifying that Node is installed globally. **(NOTE: For proper access to the backend you must have version 6+)**

Verify that Node is installed globally by running `node -v`.

If you see the current version of the Node runtime installed after running `node -v`, then all is good! Otherwise please consult Node's troubleshooting manual or Google the error that occurs.

This installation also installs the Node.js package manager ([npm](https://docs.npmjs.com/getting-started/what-is-npm)).
This package manager is in charge of installing all the libraries and dependencies
for development. The main file is the
[package.json](./package.json) file. This file states all the depedencies
and the versions for each of them.


* Open a command prompt and navigate to the folder in which you have cloned the repository.

* Install [Bower](https://bower.io/) globally. If you have already done this, skip this step, but follow the instruction for verifying that Bower is installed globally.

**Note:** you may need to replace `npm` with `sudo npm` if you are running a Mac or Linux system without root access. If this is the case, use `sudo npm` for all the `npm` steps that follow.

```
npm install -g bower
```

Verify that Bower is installed globally by running `bower -v`.

Bower is our front-end libraries package manager. This allows all of our libraries to stay in sync and updated across all developing platforms.
The main file for this dependencies is [bower.json](./bower.json), this file
contains all the dependencies that are required to run the front-end.

* Install [Gulp](https://gulpjs.com/) globally. If you have already done this, skip this step, but follow the instruction for verifying that Gulp is installed globally.

```
npm install gulp-cli -g
```

Verify that Gulp is installed globally by running `gulp -v`.

Gulp is a task manager that allows to have readily available and useful tasks,
some examples include, instantiating a server, running tests, generating
 documentation or simply packaging the app
for production.

* Install all the front-end and back-end dependencies.

```
npm install
```

This will install the npm and bower dependencies (using the packages specified in `bower.json` and `package.json`).

* Run the app

```
gulp serve
```

After these steps, the app should automatically launch in a Chrome browser window. If you get an error message because gulp can't launch Chrome, open a browser window yourself and navigate to `http://localhost:9000`.

If the app looks normal (though stretched out), with the Opal logo and buttons, your installation was successful.
If the app looks jumbled (a green screen, strange labels, no buttons), the app code is fine, but the packages installation failed --> skip ahead to [Troubleshooting](#troubleshooting).

### Optional Alternative to Gulp Serve (skip this if gulp serve works well for you)
* Install http-server

```
npm install -g http-server
```
This globally installs a simple, zero-configuration command line server that may be used to host the Opal app locally when developing in the browser.
Sometimes it is useful to quickly have a server in order to
test a particular page or app. For this http-server is a great package.
For instance, an alternative to `gulp serve` is to run from the root of the repository
run:
```
http-server ./www -p 9000 -o
```

Similar to `gulp serve`, this opens automatically the app at address
`http://localhost:9000`.

### Running Development Environment

A step by step series of examples that tell you how to get a development environment running.

#### Front-End

1) Run the following command:

```
gulp serve
```

and you should see something similar appear in your console:

```
[22:08:53] Server started http://localhost:9000
[22:08:53] LiveReload started on port 35729
[22:08:53] Running server
```
2) In Chrome or Firefox (they have the best debug console) navigate to one of the addresses provided from the previous step.
3) Open the [developer console](https://developer.chrome.com/devtools) and switch to mobile view and [disable caching](http://nicholasbering.ca/tools/2016/10/09/devtools-disable-caching/).
4) If you followed all the steps correctly, the only errors you should see in the debug console are a 404 error for cordova.js, a 404 error for favicon.ico, and many warnings for translations that don't exist. Otherwise, skip ahead to [Troubleshooting](#troubleshooting).
5) If all is well you can log in to the app with the following credentials:

```
email: muhc.app.mobile@gmail.com
password: 12345opal
security answer (depending on the question): red, guitar, superman, dog, bob, cuba
```

**NOTE: In the past, several students have had trouble installing dependencies due to strange permission issues that block the ability to write to certain directories. Don't worry if this happens to you! Please consult the [Troubleshooting](#troubleshooting) section below.**

## Troubleshooting
If you are getting errors during your installation, here are some things you can try:
* If you got unexpected errors in the developer console, and the app looks jumbled, it is likely that one of the packages used by Opal was not properly installed.
* If one or many packages didn't install correctly, one of the reasons below may be preventing `npm install` from installing the packages correctly. [Note: if you want to try installing the packages again, you can navigate to your local qplus repository and delete the folder `www/lib/bower_components`. Then, in the root of the repository, run `npm install`. Npm will detect that you deleted the folder and install the packages again.] You may be having one of the following problems:
  - You don't have the required permissions to perform the installation. Make sure you are logged in as an administrator on your computer, and try re-installing the packages. If you have a Mac, preceed your npm commands with `sudo` to run the command with administrator permissions.
  - You have an extra firewall or security plugin installed, which is preventing the packages from installing. For example, the browser extension Ghostery is known to interfere with installation. Try disabling firewalls and security plugins and re-installing the packages.
  - Your computer security is too strong. For example, newer Mac devices running MacOS High Sierra or newer have been known to prevent some packages from installing. For newer Macs, follow the instructions on [this website](https://www.imore.com/how-turn-system-integrity-protection-macos) to turn off System Integrity Protection. Then, try re-installing the packages using the instructions above. Don't forget to re-enable System Integrity Protection once you're done.
  - You have a too-recent version of npm installed. Try installing an older version of npm such as version 6 instead of 8 or 10, and re-install the packages.
  
If at this point you have been unable to install everything properly, reach out to an Opal team member for help.

This is the end of the section on installing the frontend Opal app. If you are a student or if you weren't explicitly asked to test, build or deploy the app, skip ahead to [Best Practices](#best-practices).

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
cordova run
```

in your Cordova project directory

3) Using [XCode](https://developer.apple.com/library/content/documentation/IDEs/Conceptual/iOS_Simulator_Guide/Introduction/Introduction.html) or [Android Studio](https://developer.android.com/studio/run/emulator.html) to run emulator or load APK onto phone. 

## Building

Building is a rather rigorous process due to the nature of producing software that runs on various platforms. However, James Brace
has written a simple, yet practical build script that avoids a lot of the headaches in building the app. It is planned to extend the build script
in order to make deployment automated as well...

### Prerequisites

Before being able to run build script there are a few steps one has to take that involves configuring the build script and cordova project.

**NOTE: You will need to follow these steps for both PreProd and Prod since they both have unique app distributions, configurations, and build processes!**

**IMPORTANT: In order to build iOS versions of the app you must have XCode installed which requires an Apple Computer. If you have
Linux or Windows you can only build Android distribution**

1) Follow the the instructions in the Installation section.
2) Install [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and update your OS's JAVA_HOME variable (you'll need to Google how to do this depending on your OS). **NOTE: Cordova has an issue with JDK 9 so you need to make sure you have JDK 8 installed and referenced as an environment variable or Cordova will not be able to build**
3) Install [Android Studio](https://developer.android.com/studio/index.html) and [Xcode](https://developer.apple.com/xcode/) (if using macOS)
4) **(macOS Only)** Install and setup [CocoaPods](https://stackoverflow.com/questions/20755044/how-to-install-cocoa-pods) 
5) Install [Cordova](https://cordova.apache.org/) globally with the following command:

```
npm install -g cordova
```

6) Create a Cordova project in any desired directory that's **NOT** the in qplus directory:

```
cordova create <NameOfProject>
```

7) Navigate to this newly created directory.

8) Replace the current config.xml, 'www' directory and 'res' directory with the ones in the qplus directory

**NOTE: Both Prod and PreProd branches have their own config.xml. Carefully make sure you are copying over the correct one!**

9) Add Android and iOS (if on macOS) platforms to cordova project:

**If using Cordova version >= 7.0.0**
```
cordova plugin add cordova-plugin-ios-base64 --nofetch
```

```
cordova platform add ios
cordova platform add android
```

Now you should have a properly configured Cordova project that can be compiled into both Android and iOS native code. However there
are still some dependencies needed for the build script to run properly...

8) Install [Gulp](https://gulpjs.com/) globally

```
npm install gulp-cli -g
```

Gulp is in charge of automating a lot of the build process such as minifying html/css/javascript, compressing images,
and removing debug statements.

9) (**WINDOWS AND LINUX ONLY**) Change build script to only build Android distribution

10) Change working (qplus project parent) and target (Cordova project parents) directories in build script to match your computer's destinations. The variables you need to change in the build script are titled: 
    * WORKING_DIR - this is the complete path from root to your working directory , i.e. the cloned qplus repo. You need to point this to the root of the cloned repo i.e should end in '/qplus' 
    * PREPROD_DIR - this is the complete path to your PreProd cordova project. It should point to the root of the project directory. 
    * PROD_DIR - this is the complete path to your Prod cordova project. It should point to the root of the project directory. 

Voila! You are now ready to run build script. If you didn't follow any of these properly the build script will catch and report it you.


### Building

The build script is very simple and detailed instructions can be found by running the script without any arguments.

1) Follow the instructions in the prerequisites if you haven't already
2) Make sure you are on the correct branch (either PreProd or Prod)
3) Update the version number in the config.xml file found in your qplus project parent directory (**This will soon be a deprecated step as it will be handled by the script itself**)
4) Run the script with the target as first argument and version as the second argument

```
./buildOpal.sh prod 1.10.1
```

5) The script will catch and display ALL errors and will stop the build process if any occur.

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
* **Stacey Beard**

<!-- See also the list of [contributors](https://github.com/Sable/dh/contributors) who participated in this project. -->

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Medical Physics department at the MUHC for providing a space to work in
* Cedar's Cancer Centre
* Laurie Hendren, John Kildea, and Tarek Hijal for founding the initiative
* All the McGill students who have graciously contributed to the project development
