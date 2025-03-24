# Setting Up a Local Environment

A local environment can be set up to facilitate development on a single machine without having to rely on external
components.
See the [set up guide](https://opalmedapps.gitlab.io/) for instructions on how to set everything up.

To connect the app to your local environment, create the following file in `env/local`:

```shell
opal.config.js
```

Fill in the file by copying and pasting the contents of either the sample file (`env/opal.config.sample.js`)
or the dev file (`env/dev/opal.config.js`). Refer to comments in the sample file for guidance on the meaning of each variable.
Each of the environment variables in the `settings` portion can be changed according to your preferences. In the
`firebase` section, add the web configurations of your personal Firebase project. Change the config `name` to "Opal Local"
and the config `env` to "local".

If you wish to also **build** your local app for an emulator or mobile, follow these steps:

1. Fill out the `configXml` section of your `env/local/opal.config.js` file with appropriate values.
2. Set up an Android app (required) and an iOS app (optional) in your Firebase project.
3. Via the Android app you set up in Firebase, download the provided `google-services.json` file, and add it to this folder.

The above files will allow your app to connect to your local environment, as it would for any of the official environments
provided in this repo.

To access your local environment, append all `start` or `build` npm commands with `--env=local`, for example:

```shell
npm run start --env=local
```

## Additional Environments

Any number of additional environments can be set up by first creating a new folder in the `env` directory,
then following the same instructions as the `local` environment described above.
The name of this folder determines the name of a new environment.
