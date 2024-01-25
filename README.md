# Opal Patient Portal Application

Opal is a patient portal application for mobile devices and the web which originated from the winning project of
the 2014 MUHC Q+ initiative. The project proposal was submitted by the Health Informatics Group (HIG, now known as O-HIG) and was entitled
“Realistic knowledge-based waiting time estimates for radiation oncology patients - addressing the pain of waiting”.
It had as its goal the provision of waiting time estimates to radiation oncology patients.
The app has now extended past its original scope to provide appointments, lab results, clinical reports,
educational material and much more to patients, making it a full-fledged empowerment tool for those undergoing medical treatment.

## Table of contents

[[_TOC_]]

## Getting Started

The first section of these instructions will get you a copy of the Opal frontend app running on your local machine
for development and testing purposes. The frontend is built with [Cordova](https://cordova.apache.org/), which is a
mobile development framework that packages web code into mobile applications for iOS and Android.
"Getting Started" is therefore divided into two main sections:
[Installing, building and serving the web code](#installing-building-and-serving-the-web-code) and
[Installing, building, and serving the mobile app code](#installing-building-and-serving-the-mobile-app-code).
The first section will instruct you on installing, building and serving Opal as web code that can be run in a browser.
This allows for easy development of the web code without the overhead of building the mobile app.
The second section will guide you on installing, building and serving the app on a device, as is done to build the app
for its end users.

In terms of the overall architecture, the frontend installed via this guide will communicate
with the back-end infrastructure (listener, database, etc.) already in place at the MUHC. Instructions are
also provided for connecting the frontend to a local backend installed on your personal development machine.

Please note that you must have git installed to follow this guide.
In addition, if you have a newer Mac (MacOS High Sierra or later), or are using a firewall or security plugins,
you may want to skip directly to [Troubleshooting](#troubleshooting).
This may save you some time dealing with installation errors later.

### The Opal front-end codebase

The following is the top level anatomy of the folders and their description. As you get familiar with code base, the following anatomy will make more sense. For now it is sufficient to know that our web source code lives in `src`, the compiled built web code lives in `www`, and the platform specific code generated by Cordova for the iOS and Android apps lives in the `platforms` directory.

```plain
.
├── CHANGELOG.md # Description of changes per version
├── README.md
├── .gitlab # Contains templates used in GitLab
├── .gitlab-ci.yml # GitLab CI/CD pipeline description file
├── docs # Project-specific documentation
├── env # Folder where the environment specific files live
    ├── demo
    ├── dev
    ├── devops
    ├── local
    ├── preprod
    ├── prod
    ├── qa
    └── staging
├── firebase.json # Configuration of redirect site
├── hooks # Cordova hooks for the application
├── platforms # Cordova platforms folder, where the actual mobile code lives
├── plugins # Cordova plugins folder, interfaces for native functionalities (Camera, Calendar etc.)
├── node_modules # App production and development dependencies
├── .gitignore
├── opal_env.setup.js # File to manage the Opal environments and versions
├── package-lock.json
├── package.json # Contains scripts for development
├── static # Contains static pages such as the landing page and password-reset site (Password reset functionality in Opal)
├── res # Contains app splash and icon images
├── src # This is where your source code lives
├── www  # The build/distribution folder, source code gets compiled into this directory
└── webpack.config.js # Webpack configuration file
```

In Opal, we have several environments which represent different stages along the release pipeline.
These environments, in order from closest to the developers to closest to its users, are
`local`, `devops`, `dev`, `qa`, `demo`, `staging`, `preprod` and `prod`.

The default project branch is used as the base for developers to write new code (which can be run in their `local` environment).
All new code is submitted for review via merge requests, and is then squashed-and-merged to the default branch.
From this branch, code can be released to each of the above environments (`dev` and above), in order, as part of the app release workflow.

For more information about versioning, please read [Versioning](https://gitlab.com/opalmedapps/qplus/-/wikis/Versioning).

### Installing, building and serving the web code

1. Clone the repository to the desired folder on your computer (create a dedicated folder for this).

    ```shell
    git clone https://gitlab.com/opalmedapps/qplus.git
    ```

2. Change directory to the qplus folder and make sure the main branch is checked out. If not, check out this branch.

    ```shell
    cd qplus
    git branch
    ```

    If main is not checked out:

    ```shell
    git checkout -b main origin/main
    ```

    This pulls the code from remote and creates a local main branch. The main branch is the development branch in Opal,
    and it will be the branch you will be working off of. When you create or develop a new feature, you will need to
    branch off of main, i.e.:

    ```shell
    git checkout main
    git checkout -b new_branch_name
    ```

    These commands will create a new branch called `new_branch_name` from the original `main` branch.

3. Install the [Node Version Manager for Mac](https://github.com/nvm-sh/nvm) or
   [Node Version Manager for Windows](https://github.com/coreybutler/nvm-windows) (`nvm`).
   Then, use `nvm` to install and use version 20.8.0 of Node:
   - `nvm list`
   - `nvm install v20.8.0`
   - `nvm use v20.8.0`
   - `nvm list`

   Verify that Node was correctly set up by running `node -v`.
   A few notes:
   - If you see the current version of the Node runtime installed after running `node -v`, then all is good! Otherwise please consult nvm/Node's troubleshooting manual or Google the error that occurs.
   - This installation also installs the Node.js package manager [npm](https://docs.npmjs.com/getting-started/what-is-npm).
     This package manager is in charge of installing all the libraries and dependencies required by the app.
   - The main description file for a Node.js application is the [package.json](./package.json) file. This file states all the dependencies for the app and the versions for each of them. _npm_'s job is to manage these dependencies.

4. Install the app's dependencies

    ```shell
    npm install
    ```

   For a list of all the app's dependencies, refer to the [package.json](./package.json) file.
   - [Webpack](https://webpack.js.org/) is a compiler & task manager that handles bundling of the app and other common webcode development tasks.
     Some of the jobs it has are as follows:
       1. Control the Opal environments: Opal uses different development environments, and
       _webpack_ allows us to easily specify environment variables for each.
       2. Emit a [minified](https://webpack.js.org/plugins/terser-webpack-plugin/) version of the code in one file.
       3. Compile the code to an older version of JavaScript using [babel](https://babeljs.io/), which allows us to use
       the latest features from JavaScript without worrying about JavaScript compatibility on patients' devices.
       4. Optimize the code in different ways.
       For more information on _webpack_ see: https://survivejs.com/webpack/what-is-webpack/
   - [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) is a web server which is used to serve _webpack_'s bundles
     from localhost while working on development.

5. Test the installation on your localhost.

    ```shell
    npm run start --env=dev
    ```

   This command will open a browser at the address `http://localhost:9000`, and once the app compiles, it will launch the app.
   A few notes:
    - Make sure port 9000 isn't used by your machine. If it's already in use, or if you'd like to spawn several Opal applications
      at the same time (using different ports), edit the `port` variable in `webpack.config.js` or add `--port=9001` (or other port number)
      to the right `webpack-dev-server` commands in `package.json`.
    - If the app looks normal (though stretched out), with the Opal logo and buttons, your installation was successful.
      If the app looks jumbled (a green screen, strange labels, no buttons, etc.), the app code is fine, but the package installations
      failed --> skip ahead to [Troubleshooting](#troubleshooting).
    - Note that for performance reasons, the `webpack-dev-server` spawned when using `npm run start` compiles and builds the code _in_memory_.
      This means that the code will not be compiled to the `www` folder which Cordova uses to build the app.
      If that's the desired outcome, use the following command to build and compile the app into the `www` folder instead:

      ```shell
      npm run build:web --env=dev
      ```

    For more information on `webpack-dev-server`, go to: https://webpack.js.org/guides/development/ under the `webpack-dev-server` section.

6. Try logging in; navigate to the login page and enter the following credentials:

    ```plain
    email: marge@opalmedapps.ca
    password: 12345Opal!!
    hospital: McGill University Health Centre (MUHC)
    security answer (depending on the question): red, superman, meg
    ```

7. (Optional) If setting up a local development environment of Opal with your own backend system, you'll want
   to redirect Opal to connect to this backend instead of `dev`. In this case, follow the instructions at
   [env/README.md](./env/README.md) to set up your installation to use the `local` environment
    (e.g. `npm run start --env=local`).

#### Notes on the development of web code

- We recommend the use of Chrome or Firefox as they have the best debug console, the Opal web code does not currently support Internet Explorer
- To debug the code, use the [developer console](https://developer.chrome.com/devtools), switch to mobile view and [disable caching](http://nicholasbering.ca/tools/2016/10/09/devtools-disable-caching/). Sometimes the browser caches pages disallowing developers from seeing change to the code.
- If you followed all the steps in [Installing Building and Serving web code](#installing-building-and-serving-the-web-code) correctly, the only errors you should see in the debug console are a 404 error for cordova.js, a 404 error for favicon.ico, and many warnings for translations that don't exist. Otherwise, skip ahead to [Troubleshooting](#troubleshooting).
**NOTE: In the past, several students have had trouble installing dependencies due to strange permission issues that block the ability to write to certain directories. Don't worry if this happens to you! Please consult the [Troubleshooting](#troubleshooting) section below.**

#### Optional dev server

If you want an alternative to using webpack-dev-server for serving the Opal web code, you can install http-server instead.

   ```shell
   npm install http-server -g
   ```

   This globally installs a simple, zero-configuration command line server that may be used to host the Opal app locally when developing in the browser.
   Sometimes it is useful to quickly have a server in order to
   test a particular page or app. For this http-server is a great package.
   For instance, an alternative to `npm run start:web --env=dev` which uses the _webpack-dev-server_,
   is to build the web app using `npm run build:web --env=dev -- --watch`, change directory to
   the `www` folder and run `http-server` inside this directory. In one command:

   ```shell
   # Build the app, and serve it in port 9000
   npm run build:web --env=dev -- --watch && cd www && http-server --port 9000 --open 
   ```

   This will watch the app code for changes, update the distribution folder (www) when a change is made which the
   http-server would then pickup upon refreshing the page.

### Installing, building, and serving the mobile app code

#### Locally

1. Make sure you have followed the steps on [Installing, building, and serving the mobile web code](#installing-building-and-serving-the-web-code).

2. Install and set up Cordova for the desired target platforms by following the steps in the Android and iOS cordova environments: **Note: iOS may only be built by a machine with macOS as the operating system**
    - **Android**: https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html
    - **iOS**: https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html

    Create an empty `www` folder in your project. Otherwise, you may get the following error from Cordova: `Current working directory is not a Cordova-based project.` This folder may be deleted and re-created if needed.

3. To build the app, run the following commands (if needed, replace `dev` with one of the folder names in `./env`
    to use a different environment). These commands make sure the Cordova plugins and platforms are up-to-date,
    build the web app and then run the `cordova build` command for Android or iOS, resulting in the compiled `platforms` folder.

    ```shell
    npm run build:app:ios --env=dev
    npm run build:app:android --env=dev
    ```

4. Finally, to run the app in an emulator, execute the following command. _Note_: on Mac, you may need to install
   cordova globally first (`npm install -g cordova`).

    ```shell
    cordova run [android|ios]
    ```

A few notes on this:

- If building for iOS you may need a developer profile in Apple depending on what you want to do. Running in an emulator does not require development profiles.
- Once the build commands have been run, the project becomes a valid Cordova project, which means you may use any of the [Cordova related cli commands](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/).
   As mentioned above, on Mac, you may need to install cordova globally to access the CLI commands.
- Only the build commands containing the word `release` (typically used with the `prod` environment setting)
   are used to create production-ready application builds. All other commands produce builds suited for development.

The development apps allow debugging, among other security risks such as self-signed certificates.
To disable them, use the release mode: `cordova build --release --verbose`.
In particular, prod settings (`prod/config.xml`) and release mode should be used for builds that are sent in for penetration or security testing, to ensure that common security vulnerabilities such as debugging being enabled are not flagged.

#### Using CI/CD

As an alternative to setting up your computer to build the app locally, GitLab can be used to build the app for you,
providing you with the resulting output files directly in GitLab.

1. After committing your work on a personal branch, push the branch to GitLab.
   1. If you have an open merge request, you will see a box saying
      `Detached merge request pipeline #___ waiting for manual action`.
      Click on the gear icon on the right to reveal buttons with which to launch an iOS, Android or web build.
   2. If you don't have an open merge request, navigate to
      the [Pipelines page](https://gitlab.com/opalmedapps/qplus/-/pipelines).
      There, click to open the blocked pipeline corresponding to your latest commit, and use the play buttons
      to launch a build for iOS, Android or web.
2. Once a build job has completed, click on it to open the job's page. On the right side panel, use the 'Job artifacts'
   section to download the output files for the build (`.ipa`, `.apk` or web files). App files can be used to install the app directly
   on your device, or can be sent to yourself via Firebase App Distribution in your personal Firebase project.

### Opal App Scripts

Commands for developer convenience can be found in the [package.json](./package.json) file (in the `"scripts"` section).
Take some time to understand what they do, to help you manipulate the project better.

Note that these commands are explicitly related in terms of dependent steps, so once you understand the structure,
you may choose to run them differently. For instance, the command:

```shell
# Build and run in iOS
npm run start:app:ios --env=dev
```

Calls in sequence `npm run prepare:app && npm run build:web && cordova run ios`, carrying along the `--env=dev` variable as it goes.
You may choose to simply run `cordova run ios`, if you know there is a current valid Cordova build.

## Troubleshooting

### Installation issues

If you are getting errors during your installation, here are some things you can try:

- If you got unexpected errors in the developer console, and the app looks jumbled, it is likely that one of the packages used by Opal was not properly installed.
- If one or many packages didn't install correctly, one of the reasons below may be preventing `npm install` from installing the packages correctly. [Note: if you want to try installing the packages again, you can navigate to your local qplus repository and delete the folder `node_modules`. Then, in the root of the repository, run `npm install`. Npm will detect that you deleted the folder and install the packages again.] You may be having one of the following problems:
  - You don't have the required permissions to perform the installation. Make sure you are logged in as an administrator on your computer, and try re-installing the packages. If you have a Mac, precede your npm commands with `sudo` to run the command with administrator permissions.
  - You have an extra firewall or security plugin installed, which is preventing the packages from installing. For example, the browser extension Ghostery is known to interfere with installation. Try disabling firewalls and security plugins and re-installing the packages.
  - Your computer security is too strong. For example, newer Mac devices running MacOS High Sierra or newer have been known to prevent some packages from installing. For newer Macs, follow the instructions on [this website](https://www.imore.com/how-turn-system-integrity-protection-macos) to turn off System Integrity Protection. Then, try re-installing the packages using the instructions above. Don't forget to re-enable System Integrity Protection once you're done.
  - You have a too recent (or old) version of node installed. Try installing the version recommended above, and re-install the packages.
- If you got an error from `npm install` like `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` or you are behind a firewall, you can try the following commands:
  - Run `npm config set strict-ssl false` and `set NODE_TLS_REJECT_UNAUTHORIZED=0` on the terminal. If this solution worked, you have to run these two commands again for the listener's installation. You also need to run `set NODE_TLS_REJECT_UNAUTHORIZED=0` everytime you restart the terminal.

If at this point you have been unable to install everything properly, reach out to an Opal team member for help.

### Build issues

- If you get the following error from Cordova: `Current working directory is not a Cordova-based project`, create an empty `www` folder in your project. You may delete this folder and re-create it.
- If you get the following error on Windows machine: `EBUSY: resource busy or locked, unlink '\google-services.json'`, go to your task manager, and kill all `Java(TM) Platform SE Binary` processes (select the processes and click on `End Task`).
- If you're unable to delete the `platforms` folder on Windows, follow the step above to kill the Java binary processes.
  If this fails, reboot your machine.
- If you have problems building the app, try to delete the `platforms` and `plugins` directories.
  - iOS: In some cases, it might even be necessary to delete the cached CocoaPods. For example, when updating a Cordova plugin to a newer version. Follow the [instructions on how to do this](https://stackoverflow.com/a/64040015).

### White (or gray) screen of death

If you get a white (or gray) screen of death this is most likely due to a JavaScript error.

#### iOS

Open Safari and navigate to Develop -> Your device.
There should be an inspectable application being listed (e.g., "localhost - index.html").
After selecting it, you get a web inspector window that you can use to troubleshoot, test, etc.

#### Android

Using Chrome, go to `chrome://inspect/#devices`.

## Testing

### Testing with a rooted device (Android)

In order to test that the jailbreak/root detection works correctly you need to simulate a rooted device.
Android Studio allows you to create a [rooted virtual device](https://infosecwriteups.com/get-yourself-a-rooted-android-virtual-device-avd-fb443d590dfa).
Basically, create a new device and choose an image without Google APIs.

### Running the tests

Tests should be written for all new features. It's important to maintain this effort to avoid any code regression.

**MORE TO COME...**

## Best Practices

1) When developing in the frontend, please follow [John Papa's Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
2) Any new features should be unit tested
3) Any new features should be documented using JSDoc format
4) Any new features should be added to the Wiki
5) Follow this [branching model](http://nvie.com/posts/a-successful-git-branching-model/)

## Frameworks used

- [AngularJS](https://angularjs.org/) - The web framework used
- [Webpack](https://webpack.js.org/) - A package bundler and task manager
- [OnsenUI](https://onsen.io/) - The mobile UI framework used
- [Cordova](https://cordova.apache.org/) - The mobile application framework used
- [Node.JS](https://nodejs.org/en/) - Runtime environment for our server-side code

## Authors

- **David Herrera**
- **Robert Maglieri**
- **James Brace**
- **Yick Mo**
- **Stacey Beard**

## License

This project is licensed under the MIT License.

## Acknowledgments

- Medical Physics department at the MUHC for providing a space to work in
- Cedar's Cancer Centre
- Laurie Hendren, John Kildea, and Tarek Hijal for founding the initiative
- All the McGill students who have graciously contributed to the project development
