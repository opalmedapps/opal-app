# Setting Up a Local Environment

A local environment can be set up to facilitate development on a single machine without having to rely on external
components. A typical local development environment of the Opal app includes at a minimum: the app, the listener,
a Firebase project, and the Opal databases. Make sure you have access to a local installation of each of these components
before proceeding.

To connect the app to your local environment, create the following file in this folder:

```
opal.config.js
```

Fill in the file by copying and pasting the contents of either the sample file (`env/opal.config.sample.js`)
or the dev file (`env/dev/opal.config.js`). Refer to comments in the sample file for guidance on the meaning of each variable.
Each of the environment variables in the `settings` portion can be changed according to your preferences. In the
`firebase` section, add the web configurations of your personal Firebase project. Change the config `name` to "Opal Local"
and the config `env` to "local".

If you wish to also **build** your local app for an emulator or mobile, follow these steps:
  1. Create a `config.xml` file in this folder (similar to the existing ones, but with an appropriate app ID and name).
  2. Set up an Android app (required) and an iOS app (optional) in your Firebase project.
  3. Via the Android app you set up in Firebase, download the provided `google-services.json` file, and add it to this folder.

The above files will allow your app to connect to your local environment, as it would for any of the offical environments
provided in this repo.

To access your local environment, append all `start` or `build` npm commands with `--env=local`, for example:

```
npm run start --env=local
```
