<!--
SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>

SPDX-License-Identifier: Apache-2.0
-->

# Pushing a Webpage to Firebase

Firebase projects provide free hosting for a webpage, via [Firebase Hosting](https://firebase.google.com/docs/hosting/quickstart).
In this project, a simple webpage is used as part of the password reset process.
Follow the instructions below to deploy this page to Firebase Hosting.

## Password Reset Redirect Page

Opal's password reset process makes use of Firebase hosting to host a webpage that redirect users to the Opal app to reset their password.
The code for this webpage is stored in this repository, in the directory `static/passwordreset/`.

After making changes to this page, or when first setting up the project, the page can be published as follows
(note that you must have the Firebase CLI installed to follow these steps):

1. Navigate to a cloned copy of this repository using a command-line interface. Make sure you are in the root folder of the project.
2. If you haven't published a page before, run `firebase login` to log in to your Firebase account in the Firebase CLI.
3. Run `firebase projects:list` to see the list of projects to which you have access.
4. Run `firebase use myProjectID` (replacing myProjectID with your own value) to select a project to which the page will be uploaded.
   Choose the appropriate project based on the environment in which you want to publish the page (if several have been configured).
5. Run `firebase deploy --only hosting` to publish the webpage.

If the deployment fails, delete the hidden folder `.firebase` in your project directory,
which contains cached files related to your previous page deployment.
These files can cause your upload to fail, especially after running `firebase use` to switch to a different project.

If any other failure occurs, consult the Firebase Hosting documentation linked above.
