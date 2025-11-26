<!--
SPDX-FileCopyrightText: Copyright (C) 2023 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>

SPDX-License-Identifier: Apache-2.0
-->

# GitHub Actions

This project is configured with [GitHub Actions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
to build and deploy the application automatically.
This includes deployment for internal distribution, as well as to the app stores.

## Quick Guide

### 1. Building the Dev App

The Dev app is automatically built and deployed to Firebase App Distribution when PRs are merged.

### 2. Building the Prod App and Releasing to the Stores

To build and release the prod app to the stores, follow these steps:

  1. Go to https://github.com/opalmedapps/opal-app/actions, select `Build and Deploy App`,
     and next to the `workflow_dispatch`, select `Run workflow` with the following options:
      - Deploy the app via the app stores: yes.
      - A specific build number to use: enter a number — check the stores for the next sequential number to use.
  2. When the build finishes:
      - It will have been automatically uploaded to TestFlight (Apple).
      - You'll need to manually upload the `android-app-release` aab file to Google Play (Android).
  3. The app won't automatically be published to users;
     you'll still need to create new releases in the stores and submit them for review.

## Workflow Descriptions

The different workflows are handled as follows.

### CI

This workflow executes automatically for all pull-request, merge-queue and main-branch commits,
to perform a series of checks on the updated code. It can also be run manually. These checks include:

- Linting via pre-commit
- License checks via REUSE
- Validation of the contents of THIRDPARTY.md

### Build and Deploy App

The `Build and Deploy App` workflow runs automatically on all commits to the main branch,
to build and deploy the app to Firebase app distribution (and optionally to the stores) for iOS and Android.
Commits on this branch are produced as the result of approved "squashed-and-merged" merge requests.
These commits represent completed work that is ready for deployment to our development environment.
As such, the jobs in this workflow run by default for the Dev environment.

This workflow also provides a manual interface ([workflow dispatch](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow))
which can be used to build and deploy the app for another environment.
When building for the prod environment, an option can be selected to also deploy the app to the stores.
Choosing this option will build a release version of the iOS and Android apps (in addition to the regular build).
In the case of iOS, this release app is uploaded to TestFlight for release.
The Android release app can be uploaded manually to Google Play (WIP to use an action to also do this automatically).

To build the app on demand, go to the [GitHub Actions Tab](https://github.com/opalmedapps/opal-app/actions),
select `Build and Deploy App` in the left sidebar, and next to `This workflow has a workflow_dispatch event trigger`,
select `Run workflow`.
This will open a panel in which to provide inputs, such as which environment to use and whether to deploy the resulting app.

### Build and Deploy Web

Similarly to `Build and Deploy App`, the `Build and Deploy Web` workflow runs automatically on all commits to the main branch.
In addition, it runs on all pull-request and merge-queue commits,
to ensure that the web build can complete successfully before merging new code.

This workflow is constructed similarly to `Build and Deploy App`, except that it builds for the web instead of for a mobile app platform,
and deploys the site to our web app server.

### Increment Version

`Increment Version` is a manual-only workflow that runs [semantic-release](https://github.com/semantic-release/semantic-release)
to update the app's version number.
Between runs of `Increment Version`, sequential commits on the main branch result in builds with increasing build numbers
(for example, 1.0.0 (1), 1.0.0 (2), 1.0.0 (3), etc. for each commit on main).
`Increment Version` can be run to have semantic-release bump the app to the next semantic version (e.g. 1.0.1 (1)).

The following plugins were configured for semantic-release (see [.releaserc](../../.releaserc)):

  - `@semantic-release/commit-analyzer`: Analyzes commits using conventional commit syntax
    to determine the next version number.
  - `@semantic-release/release-notes-generator`: Generates release notes from the conventional commits.
  - `@semantic-release/changelog`: Updates [CHANGELOG.md](../../CHANGELOG.md) with the release notes.
  - `@semantic-release/exec`: Updates `./env/config.xml` with the new app version number (used by cordova when building the app).
    This is done by executing versioning commands available in [opal-env.setup.js](../../opal-env.setup.js).
  - `@semantic-release/git`: Commits the above files to the default branch.
    This commit is also tagged by semantic-release to identify the new version number (e.g. `v1.0.0`).

## Pipeline Maintenance (Expired Secrets)

The following [GitHub Actions secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
expire on a regular basis.
They will need to be recreated to keep the pipeline running.

Note that any variables including `BASE64` were converted from their source file using the `base64` command-line tool,
which is very simple to use (typically requiring just an input and output file name).
Use `base64 --help` to get the right syntax for your operating system (also available on Windows via Git Bash).

### Build Certificate

```text
BUILD_CERTIFICATE_BASE64_FILE  # Development certificate (for non-release builds)
BUILD_CERTIFICATE_DISTRIBUTION_BASE64_FILE  # Distribution certificate (for store release builds)
```

These certificates are listed at https://developer.apple.com/account/resources/certificates/list,
and expire after 1 year.

They are usually created on a Mac in Xcode: `Settings > Accounts > ACCOUNT_NAME > Manage Certificates`,
after which you can right-click on them to export them as a file.
But, it may be possible to create them directly from the Apple Developer website instead.

When you create these files and export them, you may be given the option to set a password.
If so, also update `BUILD_CERTIFICATE_PASSWORD` or `BUILD_CERTIFICATE_DISTRIBUTION_PASSWORD`.

### Provisioning Profiles

```text
# Development provisioning profiles
DEV_PROVISIONING_PROFILE_BASE64_FILE
DEV_PROVISIONING_PROFILE_UUID

PROD_PROVISIONING_PROFILE_BASE64_FILE
PROD_PROVISIONING_PROFILE_UUID

# Distribution provisioning profile for prod
PROD_PROVISIONING_PROFILE_DISTRIBUTION_BASE64_FILE
PROD_PROVISIONING_PROFILE_DISTRIBUTION_UUID
```

Provisioning profiles are listed at https://developer.apple.com/account/resources/profiles/list.
They each depend on a build certificate (see above).
So, when a build certificate expires, the provisioning profiles linked to it are no longer valid.

Each distinct app requires its own profile, since a profile is attached to an app ID.
The prod app is the only one with two profiles, since it needs both a development profile for regular app builds,
and a distribution profile for App Store release builds.

To create a development provisioning profile via the Apple Developer website:
  - Select "For Development", "iOS App Development".
  - Pick a specific app ID.
  - Link it to a Development certificate.

To create a distribution provisioning profile via the Apple Developer website:
  - Select "For Distribution", "App Store Connect".
  - Pick the prod app ID.
  - Link it to a Distribution certificate.
  - Include all devices.

To get the UUID of a provisioning profile (for the `UUID` variables above),
download the profile and open it in a text editor; copy the string value below `<key>UUID</key>`.
This value is used by cordova to identify which provisioning profile to use while building.
