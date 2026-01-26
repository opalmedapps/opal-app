<!--
SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>

SPDX-License-Identifier: Apache-2.0
-->

# Using External Content Samples

**NOTE:** This setup is intended only for testing purposes and to simplify the initial
installation of the app. In a production environment, the application should retrieve
dynamic content from an external server. Do not use the configuration below in a live
production environment.

## External Content

To use external configuration and content sample files as local resources,
follow these steps:

1. Create an external configuration file by copying a sample configuration file that is
available at `content/content.config.sample.json`.

    ```bash
    cp content/content.config.sample.json content/content.config.json
    ```

2. Create content files by copying sample contents to the `content` folder:

    ```bash
    cp -r content/samples/* content/
    ```

    The created content files (e.g., `content/partners/en.html`) can be modified to test
    different HTML contents.

3. Open the newly created `content/content.config.json` file and verify the values for
each constant and external content link. Ensure that external content links are specified
in a relative path format. For example, to reference the `Terms of Use` files, the links
should be configured as shown below:

    ```json
    {
        "constants": {
            // your constants here
        },
        "contentLinks": {
            "termsOfUse": {
                "en": "./content/samples/terms-of-use/en.html",
                "fr": "./content/samples/terms-of-use/fr.html"
            },
            // other content links
        }
    }
    ```

    **NOTE:** Content files are organized in subdirectories within `content`,
    with each subdirectory named according to its content type  (e.g. partners, terms-of-use, etc.).

4. In `opal.config.js`, set the `externalContentFileURL` setting to reference
your newly created configuration file:

    ```javascript
    externalContentFileURL: './content/content.config.json'
    ```

## Service Status

The `Service Status` (a.k.a. Message of the Day) is downloaded separately from an
external server, with the URL specified in the `serviceStatusURL` setting in
`opal.config.js`. A sample configuration file for `Service Status` is available at
`content/service-status.sample.json`.

In production, it's important to host the service status file on an external server,
ideally on a different server than the one on which the Opal backend software is running.
This will allow users to be informed of service disruptions even in the case of a complete failure of the main server.

However, for testing or in non-production environments, a service status file can be provided locally.
To use a local file, copy `content/service-status.sample.json` to `content/service-status.json`,
and make sure that the `serviceStatusURL` points to this path.
In the new file, provide the `title` and `message` strings that will be shown at app startup.
If `message` is left empty, no pop-up will be shown (this can be used to disable the feature when not in use).

## Deployment

When deploying the external configuration and content sample files to your production
server, it's essential to configure the Access-Control-Allow-Origin header
correctly. This prevents Cross-Origin Resource Sharing (CORS) errors, allowing your
application to access these resources from different origins.

For an Apache web server, you can set the header for specific JSON files by adding
the following configuration to your server settings or `.htaccess` file:

```apache
# Set headers only for specific JSON configuration files in the content directory
<Files "content.config.json">
  Header set Access-Control-Allow-Origin "*"
</Files>

<Files "service-status.json">
  Header set Access-Control-Allow-Origin "*"
</Files>
```
