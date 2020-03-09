# Opal Versioning

The versioning of the app will be handled via two numbers: (1) the version number;
and (2) the build number. The version number will be the publicly facing version while
the build number will be internal to our builds of the app (every commit to a main opal branch).

The main Opal branches are: `prod` for production, `preprod` for pre-production,
and `staging` for development. 
# Version number
The version number will have the following format: 
`major.minor.patch`. We will decide ahead of time what features 
the new version of production will contain. If it contains too many new features and views, we
may decide to bump up the major number. On the other hand, if it contains fixes to current views, or a
re-design of current views we then may simply bump the minor version.
If we set the production version to 1.8.0, the `preprod` version will become
1.8.0-rc, while the `staging` version will be 1.8.0-beta. These version numbers will not be
updated in `staging` and `preprod` until they are updated in production.

# Build Numbers
A build number will simply be an integer. e.g. `1817`
Build numbers are use to manage internally our versions of the app, i.e.
anytime we merge a commit to `staging`, we increase the build
number by one. 
# The `staging` branch
In the normal flow, a developer will develop a feature in
a branch off the `staging` branch, once the developer is ready to merge it makes
a merge request to `staging`, when that request is merged, the developers 
will get a new version of the app with an updated build number. 

# The `preprod` branch

Once the `staging` branch is ready to be merged into the `preprod` branch,
the `preprod` branch will inherit the build number from `staging`.

# Hot fixes in production
If there are any hot fixes in production, we will increase the patch number
in production and make the changes/testing directly production as the
`preprod`, and `staging` branches may already be out of date. When this happens
we will create a task in Jira to cherry-pick the commit into `staging` and `preprod`   
 
  
# The production branch

This branch will represent what is currently in the App Stores for iOS and Android.
In this branch we will purely use the version number to control what will be displayed.
There are two flows to update this branch:
1. **The normal flow**: This goes through the flow of `staging`->`preprod`->`prod`.
   during this flow, we know exactly what features will be in the next version of `prod`,
   and thus we know the version that will eventually be released. 
   In this case, depending on the changes we will bump either the minor, or major number
 