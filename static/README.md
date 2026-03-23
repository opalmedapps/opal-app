<!--
SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>

SPDX-License-Identifier: Apache-2.0
-->

# Static files

This folder contains supplementary static files for the mobile application.

- The `passwordreset` folder contains a web page used during password reset to redirect the user from the password reset email to the Opal app.
This page is deployed via Firebase hosting.
  * See the file `docs/deployment/firebase-webpage-deployment.md` in this project for details
    on how to publish this page to Firebase hosting.

- The `landingpage` directory contains the landing page for the web app.
  This content is automatically deployed via the GitHub Action "Build and Deploy Web".
