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
6) If you followed all the steps correctly there should not be any errors in the debug console other than a missing cordova.js file. Otherwise please use Google or StackOverflow to solve any issues that arise, or try repeating all the steps again.
7) If all is well you can login to the app with the following credentials:

```
email: muhc.app.mobile@gmail.com
password: 12345opal
security answer (depending on question): red, guitar, superman
```
## Running the tests

Currently the Opal Development team has been making an effort to write tests for all new features. It's important to try
to maintain this effort to avoid any code regression.

**MORE TO COME...**

### Emulating

Before deploying and after you have ran your unit tests, developers should still test the application either on a device or an emulator.

It is quite simple to do either:

1) Follow the build steps listed below.

Once you have built the app you have two options...

1) Use Cordova to load APK onto phone using

```
cordova run
```

in your Cordova project directory

2) Using [XCode](https://developer.apple.com/library/content/documentation/IDEs/Conceptual/iOS_Simulator_Guide/Introduction/Introduction.html) or [Android Studio](https://developer.android.com/studio/run/emulator.html) to run emulator or load APK onto phone. 

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

The build script is very simple and detailed instructions can be found by running the script without any arguments.

1) Make sure you are on the correct branch (either PreProd or Prod)
2) Update the version number in the config.xml file found in your qplus project parent directory (**This will soon be a deprecated step as it will be handled by the script itself**)
3) Run the script with the target as first argument and version as the second argument

```
./buildOpal.sh prod 1.10.1
```

4) The script will catch and display ALL errors and will stop the build process if any occur.

## Best Practices

1) When developing in the frontend, please follow [John Papa's Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
2) Any new features should be unit tested
3) Any new features should be documented using JSDoc format
4) Any new features should be added to the Wiki

## Built With

* [AngularJS](https://angularjs.org/) - The web framework used
* [OnsenUI](https://onsen.io/) - The mobile UI framework used
* [Cordova](https://cordova.apache.org/) - The mobile application framework used
* [Node.JS](https://nodejs.org/en/) - Runtime environment for our server-side code


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **David Herrera** - *Initial work*
* **James Brace** - *Initial work*
* **Yick Mo** - *Initial work*

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Medical Physics department at the MUHC for providing a space to work in
* Cedar's Cancer Centre
* Laurie Hendren, John Kildea, and Tarek Hijal for founding the initiative
* All the McGill students who have graciously contributed to the development

