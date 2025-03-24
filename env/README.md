# Setting Up an Environment

This guide will walk you through connecting this project (the frontend Opal app) to a backend environment,
hosted either on a server or on your local machine for development.
A connection to a running backend environment is required to log into the app and receive data.

If you haven't already configured a backend environment, refer to
[the official Opal set up guide](https://opalmedapps.gitlab.io/docs/development/setup/)
for instructions on how to get started.

## Setup

The following instructions assume an environment name of `local`.
You can replace this with any name you prefer, without any spaces or special characters (except `-` or `_`).

First, create a folder called `local` inside `env`.

Copy the sample config file to `env/local`:

```shell
cp env/opal.config.sample.js env/local/opal.config.js
```

Open the new file and fill out the values for each variable.
Refer to the comments from the sample file for guidance on the meaning of each one;
in particular, each environment variable in the `settings` portion can be changed according to your preferences. In the
`firebase` section, add the web configurations for your environment's Firebase project.
Also make sure to edit all instances of the word `local` if you've chosen a different name.

If you wish to also build the app for an emulator or mobile device, follow these steps:

1. Fill out the `configXml` section of your `env/local/opal.config.js` file with appropriate values.
2. Set up an Android app (required) and an iOS app (optional) in your Firebase project.
3. Via the Android app you set up in Firebase, download the provided `google-services.json` file, and put it in `env/local`.

To access your environment, append all `start` or `build` npm commands with the name of the environment in the format `--env=local`,
for example:

```shell
npm run start --env=local
```

## Additional Environments

Any number of additional environments can be set up by creating a new folder in the `env` directory,
then following the same instructions as above for the `local` environment, just using a different name.
The name of the folder determines the name of the new environment.
