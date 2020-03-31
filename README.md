# MUHC Oncology Patient Application
Opal - the MUHC Oncology Patient Application for mobile phones and the web - is a product that has arisen from the winning project of the 2014 MUHC Q+ initiative. The project proposal was submitted by the Health Informatics Group (HIG, see below) and was entitled “Realistic knowledge-based waiting time estimates for radiation oncology patients - addressing the pain of waiting”. It had as its goal the provision of waiting time estimates to radiation oncology patients. The app has now extended its initiative to provide appointments, lab results, clinical documents, educational material and much more, making it a full-fledged, empowerment tool for those undergoing radiation treatment.
# Table of contents
- [MUHC Oncology Patient Application](#muhc-oncology-patient-application)
- [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [The Opal front-end codebase](#the-opal-front-end-codebase)
    - [Installing, building and serving web code](#installing-building-and-serving-web-code)
      - [Notes on the development of web code](#notes-on-the-development-of-web-code)
      - [Optional dev server](#optional-dev-server)
    - [Installing, building, and serving the mobile app code](#installing-building-and-serving-the-mobile-app-code)
    - [Opal App Scripts](#opal-app-scripts)
  - [Troubleshooting](#troubleshooting)
  - [Running the tests](#running-the-tests)
  - [Best Practices](#best-practices)
  - [Frameworks used](#frameworks-used)
  - [Authors](#authors)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)
## Getting Started

The first section of these instructions will get you a copy of the frontend Opal app up and running on your local machine for development and testing purposes. This front-end is built with [Cordova](https://cordova.apache.org/). Cordova allows a web app to be packaged as a mobile app allowing developers to use web technologies to build the mobile apps. Getting Started with Opal is therefore divided in two sections. [Installing, building and serving the web code](#installation-web-code) and [Installing, building, and serving the mobile app code](#installation-mobile-app-code), the former will allow developers to install, build and serve the web code which may be ran in a browser, this allows for easy development of the web app code without the overhead of building the mobile app. The latter, on the other hand, will allow developers to install, build and serve the app in a device as a mobile app. 

In terms of where the Opal app fits, this front-end will communicate with the back-end infrastructure (listener, database, etc.) already in place at the MUHC. Please note that you must have git installed to follow this guide. The second section (from "Running the tests" on) addresses testing, building and deployment on a live system. This section should be skipped for students or new developers who just want to get started with a frontend copy of Opal for development.

If you have a newer Mac (MacOS High Sierra or later), or are using a firewall or security plugins, you may want to skip directly to [Troubleshooting](#troubleshooting). This may save you some time dealing with installation errors later.
### The Opal front-end codebase
The following is the top level anatomy of the folders and their description. As you get familiar with code base, the following anatomy will make more sense. For now is sufficient to now that our web source code lives in `src`, the compiled, built web code lives in `www`, and the platform specific code generated by Cordova lives in the `platforms` directory.

```
.
├── CHANGES # Description of changes per version
├── README.md
├── .github # Contains templates for Github issues
├── deploy.sh # CI set of instructions for given a commit
├── env # Folder where the environment specific files live
    ├── preprod
    ├── prod
    └── staging
├── firebase.json # Configuration of redirect site
├── hooks # Cordova hooks for the application
├── platforms # Cordova platforms folder, where the actual mobile code lives
├── plugins # Cordova plugins folder, contains the Cordova plugins.
├── node_modules # App production and development depedencies
├── .gitignore
├── opal_env.setup.js # File contains functions to manage the Opal environment
├── package-lock.json
├── package.json 
├── redirect # Contains code for the password-reset site
├── res # Contains app splash and icon images
├── src # This is where your source code lives
├── www  # The build/distribution folder, source code gets compiled into this directory
├── versioning.md # Contains guidelines followed for versioning
└── webpack.config.js # Webpack configuration file
```

In Opal we have three main branches: `staging`, `preprod`, and `prod`. In terms of development, our main development branch is `staging`. This branch serves as base for developers to develop new code. Once a set of features is being merged and tested in `staging` by the developers, the `staging` code is merged into  `preprod`. The `preprod` version of the app evaluated by clinicians and medical staff. Once that version is ready, a new release of the app is made by merging into the `prod` branch. For more information about versioning please read [Opal versioning guidelines](./versioning.md)
### Installing, building and serving web code

1. Clone the repository to the desired folder in your computer (create a dedicated folder for this). **(NOTE: If you have a permission error, please ask to be added as a contributor to the Github project before being able to do this)**
    ```
    git clone https://github.com/Sable/qplus.git
    ```

2. Change to the qplus folder checkout the staging branch:
    ```
    cd qplus
    git fetch
    git checkout -b staging origin/staging 
    ```
    This pulls staging from remote and creates a local staging branch, the staging branch is the development branch in Opal and it will be the branch you will be working with. When you create or develop a new feature, you will create a branch based on staging to make your development. e.g. if I have a new feature I will run the command:
    ```
    git checkout staging && git checkout -b staging_new_branch_name
    ```
    This command will make sure we are in `staging` and it will create a new branch called `staging_new_branch_name` from the original `staging` branch.

3. Install the latest version of [NodeJS](https://nodejs.org/en/download/). Verify that Node is installed by running `node -v`. **(NOTE: You must have version 12+)**. A few notes:
   - If you see the current version of the Node runtime installed after running `node -v`, then all is good! Otherwise please consult Node's troubleshooting manual or Google the error that occurs.
   - This installation also installs the Node.js package manager [npm](https://docs.npmjs.com/getting-started/what-is-npm). This package manager is in charge of installing all the libraries and dependencies. 
   - The main/description file for a Node.js application is the [package.json](./package.json) file. This file states all the dependencies for the app and the versions for each of them. _npm_'s job is to manage these dependencies.

4. Install globally `webpack`, `webpack-dev-server`.
    ```
    npm install -g webpack webpack-dev-server cordova
    ```
    - [Webpack](https://webpack.js.org/) is a compiler & task manager which packages your app, some of the jobs it has are as follows
      1. Control the Opal environments, Opal uses different development environments,
      _webpack_ allows us to easily specify environment variables for each.
      1. Emit [uglify](https://webpack.js.org/plugins/terser-webpack-plugin/) version of your code in one file.
      2. Compile the code to an older version of JavaScript using [babel](https://babeljs.io/), this allows us to use the latest features from 
      JavaScript without worrying about JavaScript compatibility in patient devices.
      1. Optimize the code in different ways.
      For more information on _webpack_ see: https://survivejs.com/webpack/what-is-webpack/
    - [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) is an web server which to serve _webpack_'s bundles.

5. Install the app dependencies
  **Note:you may need to replace `npm` with `sudo npm` if you are running a Mac or Linux system without root access. If this is the case, use `sudo npm` for all the `npm` steps that follow.**
    ```
    npm install
    ```
6. Test the installation in a localhost.
    ```
    npm run start:web:staging
    ```
   This command should open a browser at the address `http://localhost:9000` and once the app compiles, it will launch the app. A few notes:
    - Make sure port 9000 isn't used by your machine, if it already in used, or if you'd like to spawn different Opal app applications under different ports use:
      ```
      npm run start:web:staging -- --port=<PORT-NUMBER>
      ```
      This will initialize the app in another port.
    - If the app looks normal (though stretched out), with the Opal logo and buttons, your installation was successful.If the app looks jumbled (a green screen, strange labels, no buttons, etc.), the app code is fine, but the package installations failed --> skip ahead to [Troubleshooting](#troubleshooting).
    - Note that for performance reasons the `webpack-dev-server`, server spawned when using `npm run start:web:staging` compiles and builds the code *in_memory*. This means that the code will not be compiled to the `www` folder which Cordova uses to build the app. If that's the desired outcome, to build and compile the app into the `www` folder use instead:
      ```
      npm run build:web:staging
      ```
    For more information on the `webpack-dev-server` follow: https://webpack.js.org/guides/development/ under the `webpack-dev-server` section.
7. Try loging in, navigate to login and enter the following credentials.
    ```
    email: muhc.app.mobile@gmail.com
    password: 12345opal
    security answer (depending on the question): red, guitar, superman, dog, bob, cuba
    ```
#### Notes on the development of web code
- We recommend the use of Chrome or Firefox as they have the best debug console, the Opal web code does not currently support Internet Explorer
- To debug the code use the [developer console](https://developer.chrome.com/devtools), switch to mobile view and [disable caching](http://nicholasbering.ca/tools/2016/10/09/devtools-disable-caching/). Sometimes the browser caches pages disallowing developers from seeing change to the code.
- If you followed all the steps in [Installing Building and Serving web code](#installing-building-and-serving-web-code) correctly, the only errors you should see in the debug console are a 404 error for cordova.js, a 404 error for favicon.ico, and many warnings for translations that don't exist. Otherwise, skip ahead to [Troubleshooting](#troubleshooting).
**NOTE: In the past, several students have had trouble installing dependencies due to strange permission issues that block the ability to write to certain directories. Don't worry if this happens to you! Please consult the [Troubleshooting](#troubleshooting) section below.**
#### Optional dev server
Install http-server
   ```
   npm install http-server -g
   ```
   This globally installs a simple, zero-configuration command line server that may be used to host the Opal app locally when developing in the browser.
   Sometimes it is useful to quickly have a server in order to
   test a particular page or app. For this http-server is a great package.
   For instance, an alternative to `npm run start:web:staging` which uses _webpack-dev-server_,
   is to build the web app using `npm run build:web:staging`, change directory to
   the `www` and run `http-server` inside this directory. In one command:
   ```
   $npm run build:web:staging && cd www && http-server --port 9000 --open # Build the app, and serve it in port 9000
   ```

### Installing, building, and serving the mobile app code
1. Make sure you have ran step #5 in the [Installing, building, and serving the mobile app code](#installing-building-and-serving-web-code) guide.
2. Install and set up Cordova for the desired target platforms by following the steps in the Android and iOS cordova environments: **Note: iOS may only be built by a machine with macOS as the operating sytem**
    - **Android**: https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html
    - **iOS**: https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html
3. Run the build command 
    ```
    npm run build:staging
    ```
  The command above builds the web app and then runs the `cordova build` command for both Android and iOS resulting in the compiled `platforms` folder. To build platform specific code run:
  ```
  npm run build:staging:ios
  npm run build:staging:android
  ```
  A few notes on this:
    - If building for iOS make sure the app is signed under a development profile, otherwise the build process will fail, follow this guide for help:
4. Finally run the Cordova app
```
npm run start:app:staging:ios # To run app in an for iOS emulator
npm run start:app:staging:android # To run app in an Android emulator.
```

### Opal App Scripts
We have added commands for developer convenience to the `package.json`. Take some
time to understand what they do, this wil help you manipulate the project better, here is a list of them.
```json
  "scripts": {
    "prepare:web": "npm run prepare:web:staging",
    "prepare:web:prod": "node -e \"require('./opal_env.setup.js').copyEnvironmentFiles('prod')\"",
    "prepare:web:preprod": "node -e \"require('./opal_env.setup.js').copyEnvironmentFiles('preprod')\"",
    "prepare:web:staging": "node -e \"require('./opal_env.setup.js').copyEnvironmentFiles('staging')\"",
    "prepare:app:prod": "npm run prepare:web:prod && cordova prepare",
    "prepare:app:preprod": "npm run prepare:web:preprod && cordova prepare",
    "prepare:app:staging": "npm run prepare:web:staging && cordova prepare",
    "build:web": "npm run build:web:staging",
    "build:web:prod": "npm run prepare:web:prod && webpack --env.opal_environment=prod",
    "build:web:preprod": "npm run prepare:web:preprod && webpack --env.opal_environment=preprod",
    "build:web:staging": "npm run prepare:web:staging && webpack --env.opal_environment=staging",
    "build:app": "npm run build:app:staging",
    "build:app:prod": "npm run prepare:app:prod && npm run build:web:prod && cordova build --release --verbose",
    "build:app:preprod": "npm run prepare:app:preprod && npm run build:web:preprod && cordova build --verbose",
    "build:app:preprod:ios": "npm run prepare:app:preprod && npm run build:web:preprod && cordova build android --verbose",
    "build:app:preprod:android": "npm run prepare:app:preprod && npm run build:web:preprod && cordova build ios --verbose",
    "build:app:preprod:package": "npm run prepare:app:preprod && npm run build:web:preprod && cordova build --device --verbose",
    "build:app:preprod:package:ios": "npm run prepare:app:preprod && npm run build:web:preprod && cordova build ios --device --verbose",
    "build:app:preprod:package:android": "npm run prepare:app:preprod && npm run build:web:preprod && cordova build android --device --verbose",
    "build:app:staging": "npm run prepare:app:staging && npm run build:web:staging && cordova build --verbose",
    "build:app:staging:ios": "npm run prepare:app:staging && npm run build:web:staging && cordova build ios --verbose",
    "build:app:staging:android": "npm run prepare:app:staging && npm run build:web:staging && cordova build android --verbose",
    "build:app:staging:package": "npm run prepare:app:staging && npm run build:web:staging && cordova build --device --verbose",
    "build:app:staging:package:ios": "npm run prepare:app:staging && npm run build:web:staging && cordova build ios  --device --verbose",
    "build:app:staging:package:android": "npm run prepare:app:staging && npm run build:web:staging && cordova build android --device --verbose",
    "start": "npm run start:web:staging",
    "start:web": "npm run start:web:staging",
    "start:web:prod": "webpack-dev-server --open --env.opal_environment=prod --watch --progress --colors",
    "start:web:preprod": "webpack-dev-server --open --env.opal_environment=preprod --watch --progress --colors",
    "start:web:staging": "webpack-dev-server --open --env.opal_environment=staging --watch --progress --colors",
    "start:app": "npm run build:app:staging && cordova run",
    "start:app:prod:ios": "npm run build:app:prod && cordova run ios",
    "start:app:prod:android": "npm run build:app:prod && cordova run android",
    "start:app:preprod:ios": "npm run build:app:preprod && cordova run ios",
    "start:app:preprod:android": "npm run build:app:preprod && cordova run android",
    "start:app:staging:ios": "npm run build:app:staging:ios && cordova run ios",
    "start:app:staging:android": "npm run build:app:staging:android && cordova run android",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
```
## Troubleshooting
If you are getting errors during your installation, here are some things you can try:
* If you got unexpected errors in the developer console, and the app looks jumbled, it is likely that one of the packages used by Opal was not properly installed.
* If one or many packages didn't install correctly, one of the reasons below may be preventing `npm install` from installing the packages correctly. [Note: if you want to try installing the packages again, you can navigate to your local qplus repository and delete the folder `www/lib/bower_components`. Then, in the root of the repository, run `npm install`. Npm will detect that you deleted the folder and install the packages again.] You may be having one of the following problems:
  - You don't have the required permissions to perform the installation. Make sure you are logged in as an administrator on your computer, and try re-installing the packages. If you have a Mac, precede your npm commands with `sudo` to run the command with administrator permissions.
  - You have an extra firewall or security plugin installed, which is preventing the packages from installing. For example, the browser extension Ghostery is known to interfere with installation. Try disabling firewalls and security plugins and re-installing the packages.
  - Your computer security is too strong. For example, newer Mac devices running MacOS High Sierra or newer have been known to prevent some packages from installing. For newer Macs, follow the instructions on [this website](https://www.imore.com/how-turn-system-integrity-protection-macos) to turn off System Integrity Protection. Then, try re-installing the packages using the instructions above. Don't forget to re-enable System Integrity Protection once you're done.
  - You have a too-recent version of npm installed. Try installing an older version of npm such as version 6 instead of 8 or 10, and re-install the packages.
* If you got an error from `npm install` like `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` or you are behind a firewall, you can try the following commands:
  - Go to `qplus/.bowerrc` and add the following `{"directory" : "www/lib/bower_components", "strict-ssl": false,  "https-proxy": "" }`
  - Run `npm config set strict-ssl false` and `set NODE_TLS_REJECT_UNAUTHORIZED=0` on the terminal. If this solution worked, you have to run these two commands again for the listener's installation. You also need to run `set NODE_TLS_REJECT_UNAUTHORIZED=0` everytime you restart the terminal.

If at this point you have been unable to install everything properly, reach out to an Opal team member for help.

This is the end of the section on installing the frontend Opal app. If you are a student or if you weren't explicitly asked to test, build or deploy the app, skip ahead to [Best Practices](#best-practices).

## Running the tests

Currently the Opal Development team has been making an effort to write tests for all new features. It's important to try
to maintain this effort to avoid any code regression.

**MORE TO COME...**


## Best Practices

1) When developing in the frontend, please follow [John Papa's Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
2) Any new features should be unit tested
3) Any new features should be documented using JSDoc format
4) Any new features should be added to the Wiki
5) Follow this [branching model](http://nvie.com/posts/a-successful-git-branching-model/)

## Frameworks used

* [AngularJS](https://angularjs.org/) - The web framework used
* [Webpack](https://webpack.js.org/) - A package bundler and task manager
* [OnsenUI](https://onsen.io/) - The mobile UI framework used
* [Cordova](https://cordova.apache.org/) - The mobile application framework used
* [Node.JS](https://nodejs.org/en/) - Runtime environment for our server-side code

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
