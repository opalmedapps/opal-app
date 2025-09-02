<!--
SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>

SPDX-License-Identifier: Apache-2.0
-->

# Opal Web And Mobile App

Opal is a patient portal application for mobile devices and the web which originated from the winning project of
the 2014 MUHC Q+ initiative. The project proposal was submitted by the Health Informatics Group (HIG, now known as O-HIG) and was entitled
“Realistic knowledge-based waiting time estimates for radiation oncology patients - addressing the pain of waiting”.
It had as its goal the provision of waiting time estimates to radiation oncology patients.
The app has now extended past its original scope to provide appointments, lab results, clinical reports,
educational material and much more to patients, making it a full-fledged empowerment tool for those undergoing medical treatment.

## Installation

The first section of these instructions will get you a copy of the Opal app running on your local machine
for development or testing purposes.

The app is built using [Cordova](https://cordova.apache.org/), which is a
mobile development framework that packages web code into mobile applications for iOS and Android.
This installation guide is therefore divided into two main sections:
[Web](#web) and [Mobile App](#mobile-app).
The first section will help you set up the project to run Opal's web code in a browser,
allowing for easy development without the overhead of building for mobile.
The second section will guide you towards building the app for a mobile device, as is done for its end users.

The app installed via this guide can be configured to communicate either with a server-hosted environment backend
(used for development, or in production), or with a fully local environment installed on your own development machine.

### Web

This section covers installation steps to build the app's web code on your local machine.

1.  Node.js is required to run and build the app. Install Node.js version `20.17.X`, ideally via the [Node Version Manager for Mac](https://github.com/nvm-sh/nvm) or
    [Node Version Manager for Windows](https://github.com/coreybutler/nvm-windows) (`nvm`).
    Using `nvm` instead of installing Node.js directly greatly facilitates updates, and makes switching between versions convenient and easy.

    ```shell
    nvm list
    ```
    ```shell
    nvm install 20.17.0
    ```
    ```shell
    nvm use 20.17.0
    ```

    To verify that Node was set up correctly, run:
    ```shell
    node -v
    ```

    This installation also installs the Node.js package manager [npm](https://docs.npmjs.com/getting-started/what-is-npm),
    which is in charge of installing and managing all the libraries and dependencies required by the app.

2.  Install the app's dependencies

    ```shell
    npm install
    ```

    This project uses [AngularJS](https://angularjs.org/) which reached end of life in January 2022.

    A long-term support version of AngularJS can be used instead, provided by [HeroDevs](https://www.herodevs.com/support/nes-angularjs) (paid service).
    If you have an `npm` token to retrieve this version from their registry, place the `.npmrc` file containing the credentials in the root directory.

    Then, substitute the AngularJS dependencies in `package.json` with the packages provided by HeroDevs
    (see [their setup instructions here](https://docs.herodevs.com/angularjs/angularjs-1-8#detailed-instructions)).

    For a list of all dependencies used in this project, refer to [package.json](./package.json).

3.  Connect your installation to a running backend.

    The Opal app requires connection to a running listener (and associated backend components) to be able to run and serve data upon login.

    Follow the instructions in [the env folder's README](./env/README.md) to configure your connection to a local or server-hosted backend.

4.  Run the app in a browser (the following command assumes you've configured an environment called `local`;
    if not, replace this with the name you've chosen).

    ```shell
    npm run start --env=local
    ```

    This command will open a browser at the address `http://localhost:9000`, and once the app compiles, it will launch the app.
    A few notes:
      - Make sure port 9000 isn't used by your machine. If it's already in use, or if you'd like to spawn several Opal applications
        at the same time (using different ports), edit the `port` variable in `webpack.config.js` or add `--port=9001` (or other port number)
        to the right `webpack-dev-server` commands in `package.json`.
      - If the app looks normal (though stretched out, until you resize the window), with the Opal logo and buttons, your installation was successful.
        If the app looks jumbled (a green screen, untranslated labels, no buttons, etc.), the app code is fine, but the package installations
        failed. In this case, skip ahead to [Troubleshooting](#troubleshooting).
      - Note that for performance reasons, the `webpack-dev-server` spawned when using `npm run start` compiles and builds the code _in memory_.
        This means that the code will not be compiled to the `www` folder which Cordova uses to build the app.
        If that's the desired outcome, use the following command to build and compile the app into the `www` folder instead:

        ```shell
        npm run build:web --env=local
        ```

        For more information on `webpack-dev-server`, go to: https://webpack.js.org/guides/development/ under the `webpack-dev-server` section.

5.  Try logging in; navigate to the login page and enter the following credentials:

    ```plain
    email: marge@opalmedapps.ca
    password: 12345Opal!!
    hospital (English): Opal Medical Institution (OMI)
    hospital (French): Établissement médical Opal (ÉMO)
    security answer (depending on the question): red, superman, meg
    ```

#### Notes on the development of web code

- We recommend the use of Chrome or Firefox as they have good developer tools.
- To debug the code, open the developer console, switch to mobile view and [disable caching](http://nicholasbering.ca/tools/2016/10/09/devtools-disable-caching/).
  Caching can sometimes interfere with Webpack's live reloading to see updates in real time.
- If you followed all the steps in the [Web](#web) section correctly, the only errors you should see in the debug console are
  errors for `cordova.js` (which only runs in the mobile app, and isn't needed in the web version).
  If you see any additional errors that seem to be interfering with the app's functionality, skip ahead to [Troubleshooting](#troubleshooting).

### Mobile App

This section covers installation steps to build the mobile app on your local machine.

1.  Make sure you have followed the setup steps for [Web](#web).

2.  Install and set up Cordova for the desired target platform(s) by following the guides below.
    <br>
    **Note: the iOS app may only be built on a machine with macOS as the operating system**
      - **Android**: https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html
      - **iOS**: https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html

3.  Create an empty `www` folder in your project, if one wasn't already created.
    Otherwise, you may get the following error from Cordova: `Current working directory is not a Cordova-based project.`
    This folder may be deleted and re-created if needed.

4.  To build the app, run either of the following commands (if needed, replace `local` with the name of another environment in `/env`).
    These commands make sure the Cordova plugins and platforms are up-to-date,
    build the web app and run the `cordova build` command for Android or iOS, resulting in a compiled `platforms` folder
    and an output `.ipa` or `.apk` file.

    ```shell
    npm run build:app:ios --env=local
    ```
    ```shell
    npm run build:app:android --env=local
    ```

    If you encounter any issues, the folders `platforms` and `plugins` can safely be deleted to build from a clean state.

5.  Finally, to run the app on an emulator, execute one of the following commands.
    <br>
    _Note_: on Mac, you may need to install
    cordova globally first (`npm install -g cordova`).

    ```shell
    cordova run ios
    ```
    ```shell
    cordova run android
    ```

A few notes:

- If building for iOS, you may need a developer profile in Apple, depending on what you want to do.
  Running in an emulator does not require development profiles.
- Once the build commands have been run, the project becomes a valid Cordova project, which means you may use any of the [Cordova related cli commands](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/).
  As mentioned above, on Mac, you may need to install cordova globally to access the CLI commands.
- Only the build commands containing the word `release` are used to create production-ready application builds.
  All other commands produce builds suited for development.
- When sending builds to third-party vendors for security testing, or when running security scans,
  production settings (in `opal.config.js`) and cordova's release mode should be used.
  This ensures that common security vulnerabilities (such as debugging being enabled) are not flagged.

### Opal App Scripts

Commands for developer convenience can be found in the [package.json](./package.json) file (in the `"scripts"` section).

Note that these commands are explicitly related in terms of dependent steps, so once you understand their structure,
you may choose to run them differently. For instance, consider the following command:

```shell
# Build and run for iOS
npm run start:app:ios --env=local
```

This command calls in sequence `npm run prepare:app && npm run build:web && cordova run ios`, carrying along the `--env=local` variable as it goes.
You may choose to simply execute `cordova run ios`, if you know there already exists a valid Cordova build.

### External Content

The app includes dynamically loaded pages such as `Terms of Use`, `Service Agreement`, `About`, etc., which are retrieved from an external server. On startup, it
downloads a configuration file for this external content based on the `externalContentFileURL` setting in `opal.config.js`. **For testing purposes**, you can include the external configuration and content files in the webpack build, allowing them to be accessed as regular local static files. Follow the instructions in [the content folder's README](./content/README.md) to use the external content samples.

### Password Reset

To support password reset in the Opal app, a standalone web page must be deployed,
which redirects users from password reset emails to the right page in the app.

To deploy this webpage, follow the steps related to the password reset redirect page
in [Pushing a Webpage to Firebase](./docs/deployment/firebase-webpage-deployment.md).

## Troubleshooting

If you are getting errors during your installation, here are some things you can try.

### Dependency Installation Issues
- If you get unexpected errors in the developer console, and the app's UI looks jumbled, it's likely that one of the packages used by Opal was not properly installed.
  To reinstall the packages from a clean state, delete `node_modules` and rerun `npm install`.
  If one or more packages didn't install correctly, one of the reasons below may be preventing `npm install` from executing correctly.
  - You don't have the required permissions to perform the installation. Make sure you are logged in as an administrator on your computer, and try re-installing the packages. If you have a Mac, precede your npm commands with `sudo` to run the command with administrator permissions.
  - You have an extra firewall or security plugin installed, which is preventing the packages from installing.
    Try disabling them or whitelisting `npm` and re-installing the packages.
  - You have a too recent (or too old) version of node installed. Try installing the version recommended above, and re-installing the packages.
- If you got the error `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` from `npm install`, or if you are behind a firewall, you can try the following:
  - Run `npm config set strict-ssl false` and `set NODE_TLS_REJECT_UNAUTHORIZED=0` on the terminal.
    You'll also need to run `set NODE_TLS_REJECT_UNAUTHORIZED=0` every time you restart the terminal.
    This solution can also be applied when installing dependencies for other projects, such as the listener.

### Build issues

- If you get the following error from Cordova: `Current working directory is not a Cordova-based project`, create an empty `www` folder in your project.
- If you get the following error on a Windows machine: `EBUSY: resource busy or locked, unlink '\google-services.json'`, go to your task manager, and kill all `Java(TM) Platform SE Binary` processes.
- If you're unable to delete the `platforms` folder on Windows, follow the step above to kill the Java binary processes.
  If this fails, reboot your machine.
- If you have problems building the app, try deleting the `platforms` and `plugins` directories.
  - iOS: In some cases, it might even be necessary to delete the cached CocoaPods. For example, when updating a Cordova plugin to a newer version. Follow the [instructions here on how to do this](https://stackoverflow.com/a/64040015).

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

### Running MobSF to analyze the app builds (static and dynamic analysis)

In order to analyze the app builds for security issues you can run [MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF).
Follow the [instructions](https://github.com/MobSF/Mobile-Security-Framework-MobSF#documentation) to run it as a container and open the web UI on the exposed port in your browser.
You can then upload the iOS (`.ipa`) or Android (`.apk`) build and have it analyzed.

## Best Practices

1) When developing in the app, please follow [John Papa's Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
2) Any new features should be unit tested
3) Any new features should be documented using JSDoc format
4) Any new features should be added to the Wiki
5) Follow this [branching model](http://nvie.com/posts/a-successful-git-branching-model/)

## Repository Overview

The following is a high-level overview of the folders in this repository.
The most important folders are the source web code in `src`, the compiled web code in `www`,
and the platform specific code generated by Cordova for iOS and Android in `platforms`.

```plain
.
├── .gitlab # Contains templates used in GitLab
├── docs # Project-specific documentation
├── env # Contains folders configured to connect to any given backend environment
    ├── local
    └── etc.
├── hooks # Cordova hooks for the application
├── node_modules # Dependencies folder (generated by npm)
├── platforms # Platforms folder (generated by Cordova), where the compiled mobile code lives
├── plugins # Plugins folder (generated by Cordova), providing interfaces to native mobile functionality (GPS, file system, etc.)
├── res # Contains app splashscreens and icons
├── src # The app's source code
├── static # Contains static pages such as the web app's landing page and the password reset redirection webpage
├── www  # Web code folder (generated by Webpack), where the compiled web code lives
├── .gitignore
├── .gitlab-ci.yml # GitLab CI/CD pipeline description file
├── .releaserc # Configuration for semantic-release, used to automatically increment the app version
├── CHANGELOG.md # Description of changes per version
├── firebase.json # Configuration used to deploy the password reset redirection webpage
├── opal-env.setup.js # Utility file managing environment setup when building or running the app
├── package.json # List of dependencies and build/execution scripts
├── package-lock.json # Dependency installation record (generated by npm)
├── README.md
├── renovate.json5 # Configuration for renovate-bot, used to facilitate dependency updates
├── THIRDPARTY.md # Licenses for all first-level third-party dependencies used in this project.
└── webpack.config.js # Webpack configuration file
```

## More Information

- [Versioning](https://gitlab.com/opalmedapps/qplus/-/wikis/Versioning)
- [Use of Webpack](./docs/webpack.md)

## Frameworks used

- [AngularJS](https://angularjs.org/) - The web framework used
- [Webpack](https://webpack.js.org/) - A package bundler and task manager
- [OnsenUI](https://onsen.io/) - The mobile UI framework used
- [Cordova](https://cordova.apache.org/) - The mobile application framework used
- [Node.JS](https://nodejs.org/en/) - Runtime environment for our server-side code

## License

This project is licensed under the Apache 2.0 License.

## Acknowledgments

- Medical Physics department at the MUHC for providing a space to work in
- Cedar's Cancer Centre
- Laurie Hendren, John Kildea, and Tarek Hijal for founding the initiative
- All the McGill students who have graciously contributed to the project development
