## GitLab CI/CD

This project is configured with [GitLab CI/CD pipelines](https://docs.gitlab.com/ee/ci/pipelines/)
that build and deploy the application automatically.
Currently, only building and deploying to the `dev` environment is supported. However, we have plans to expand this
to other environments in the future.

Two different workflows are handled by the pipeline, as follows.

### 1. Commits on feature branches (regular development)

When working on feature branches, the commits that developers make and push trigger a basic workflow.
Specifically, any commits on branches _other_ than the default branch are handled as follows:

- Pipeline runs on the pushed commit
  - Stage 1: `check`
    - `check dependencies`: The npm dependencies are installed, as a smoke test.
      This provides early feedback (in the form of a failed pipeline) to alert developers that the build will later fail
      since the dependencies are unable to install successfully.
  - Stage 2: `build`
    - `build android`/`build ios` (manual): The build is not automatically executed, to save on resources.
      This makes sense given that developers will rarely need to build the app on every commit they push.
      However, a manual button is available to build the app on demand.
      The resulting `apk` and `ipa` files are available as artifacts for download.

### 2. Commits on the default branch (after completed merge requests)

Commits on the default branch are produced as the result of approved and "squashed-and-merged" merge requests.
These commits represent completed work that is ready for deployment to our development environment.
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
      - `@semantic-release/exec`: Updates `./env/*/config.xml` with the new app version number (used by cordova
        when building the app).
        This is done by executing versioning commands available in [opal_env.setup.js](../../opal_env.setup.js).
      - `@semantic-release/git`: Commits the above files to the default branch.
        This commit is also tagged by semantic-release to identify the new version number (e.g. `v1.0.0`).
  - Note: for the first pipeline, the work ends here. This is because the first pipeline is not running on
    the brand-new commit made by semantic-release. For the build to use to the newly committed version in `config.xml`,
    it must be on a new pipeline running on the latest commit, i.e. the commit created by semantic-release
    and tagged with a version number.
- The second pipeline runs on the _tag_ created by semantic-release (which is on the new commit)
  - Stage 1: `build`
    - `build android`/`build ios`: The build executes automatically using the new version number in `config.xml`
      committed by semantic-release.
  - Stage 2: `deploy`
    - `deploy android to firebase`/`deploy ios to firebase`: The two app build files generated in the previous step
      (`apk` and `ipa`) are automatically deployed to the team via Firebase App Distribution, which notifies them by email
      that a new version is available.
