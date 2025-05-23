<!--
SPDX-FileCopyrightText: Copyright (C) 2023 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>

SPDX-License-Identifier: Apache-2.0
-->

_This document refers to some features and uses of GitLab CI/CD which have not yet been converted to GitHub Actions._
_Content will be updated as this work progresses._

# GitHub Actions

This project is configured with [GitHub Actions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
to build and deploy the application automatically.
Currently, deployment is only supported for internal distribution, not to end users via the app stores.

Two different workflows are handled as follows.

## Workflows - GitHub

The `Build App` workflow runs automatically on all commits to the main branch, to build the app for iOS and Android.
Commits on this branch are produced as the result of approved "squashed-and-merged" merge requests.
These commits represent completed work that is ready for deployment to our development environment.
As such, the jobs in this workflow run by default in the Dev environment.

The workflow also provides a UI interface which can be used to build the app for another environment.

To build the app on demand, go to the [GitHub Actions Tab](https://github.com/opalmedapps/opal-app/actions),
select `Build App` in the left sidebar, and next to `This workflow has a workflow_dispatch event trigger`,
select `Run workflow`.
This will open a panel in which to provide inputs, such as which environment to use.

## Workflows - GitLab

### 1. Commits on feature branches (regular development)

When working on feature branches, the commits that developers make and push will trigger a basic workflow.
Specifically, any commits on branches _other_ than the default branch are handled as follows:

- Pipeline runs on the pushed commit
  - Stage 1: `check`
    - `check dependencies`: The npm dependencies are installed, as a smoke test.
      This provides early feedback (in the form of a failed pipeline) to alert developers that the build will later fail
      since the dependencies are unable to install successfully.
  - Stage 2: `build`
    - `build android`/`build ios`/`build web` (manual/manual/auto): Mobile app builds are not automatically executed, to save on resources.
      This makes sense given that developers will rarely need to build the mobile app on every commit they push.
      However, a manual button is available to build the app on demand (using the Dev environment settings and backend).
      The resulting `apk`, `ipa` and web files are available as artifacts for download.
  - Stage 3: `test`
    - _More details to be added._

### 2. Commits on the default branch (after completing merge requests)

Commits on the default branch are produced as the result of approved and "squashed-and-merged" merge requests.
These commits represent completed work that is ready for deployment to our development environment.
As such, the bulk of the jobs described below run by default in the Dev environment.
The last set of jobs, `build and deploy <ENV>`, can be used after a successful deployment to the Dev environment
to promote and deploy the same version to another environment.

Any commits to the default branch are handled as follows:

- The first pipeline runs on the pushed commit
  - Stage 1: `check`
    - `check dependencies`: The npm dependencies are installed, as a smoke test.
      The build will not proceed if dependencies cannot be installed, and a clear failing test alerts developers
      to this issue.
  - Stage 2: `prepare`
    - `increment version`: To prepare to build and deploy a new release of the app,
      [semantic-release](https://github.com/semantic-release/semantic-release) runs to increment the build number.
      The following plugins were configured for semantic-release (see [.releaserc](../../.releaserc)):
      - `@semantic-release/commit-analyzer`: Analyzes commits using conventional commit syntax
        to determine the next version number.
      - `@semantic-release/release-notes-generator`: Generates release notes from the conventional commits.
      - `@semantic-release/changelog`: Updates [CHANGELOG.md](../../CHANGELOG.md) with the release notes.
      - `@semantic-release/exec`: Updates `./env/config.xml` with the new app version number (used by cordova
        when building the app).
        This is done by executing versioning commands available in [opal-env.setup.js](../../opal-env.setup.js).
      - `@semantic-release/git`: Commits the above files to the default branch.
        This commit is also tagged by semantic-release to identify the new version number (e.g. `v1.0.0`).
  - Note: The first pipeline ends here. This is because the first pipeline is not running on
    the brand-new commit made by semantic-release. For the build to use to the newly committed version in `config.xml`,
    it must be on a new pipeline running on the latest commit, i.e. the commit created by semantic-release
    and tagged with a version number.
- The second pipeline runs on the _tag_ created by semantic-release (which is on the new commit)
  - Stage 1: `check`
    - `check dependencies`: See more details above. This job runs in every pipeline to ensure the build will pass.
  - Stage 2: `build`
    - `build android`/`build ios`/`build web`: The build executes automatically for the Dev environment
      using the new version number committed to `config.xml` by semantic-release.
  - Stage 3: `deploy`
    - `deploy android to firebase`/`deploy ios to firebase`: The two app build files generated in the previous step
      (`apk` and `ipa`) are automatically deployed to the team via Firebase App Distribution for Opal Dev,
      which notifies them by email that a new version is available.
      Permission to execute this job is restricted via the use of protected environments (more details below).
    - `deploy web`: The web app as well as its landing page are uploaded to the FTP server corresponding to the environment.
  - Stage 4: `post`
    - `build and deploy <ENV>`: Optional manual trigger job that can be used to launch a [downstream child pipeline](https://docs.gitlab.com/ee/ci/pipelines/downstream_pipelines.html#parent-child-pipelines)
      to deploy the app in a given environment. If launched, the same jobs in this current "second pipeline" run again,
      but using the variables for that environment.
      For more information on downstream pipelines, refer to GitLab's documentation.

## Protected Environments - GitLab

GitLab [Protected Environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)
are used to limit which users are authorized to deploy versions of the app to each environment.
Any user can launch a _build_ of an app in any environment, but only authorized users can deploy it
to Firebase App Distribution.
Environment protection is applied to the deployment jobs using the value of the `$ENV` variable in the pipeline.

The environment protection settings are configured as follows:

- The `semantic-release` user is authorized to deploy to the `dev` environment, since this user is the one that triggers
the automatic deployment pipeline (the "second pipeline" in workflow #2 above).
- The `qa` environment is restricted to users who are authorized to promote a version and deploy it to QA.

Note that the `environment` keyword cannot be used directly in conjunction with the `trigger` keyword, which is why the
`build and deploy QA` job is not protected directly. [Reference](https://stackoverflow.com/questions/70768874/gitlab-ci-using-environment-key-with-trigger-in-job)
