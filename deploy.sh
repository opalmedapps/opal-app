#!/usr/bin/env bash
## Get last commit message
# Set the project to preprod
echo "SETTING UP ENVIRONMENT"
firebase use staging --token "$FIREBASE_TOKEN"
echo "BUMPING BUILD_VERSION for app in staging"
echo "BUILDING APP"
npm run build:staging
node -e "require('./opal_env.setup').bumpBuildNumbers('staging')"
echo "DEPLOYING REDIRECT WEBSITE"
firebase deploy
echo "DISTRIBUTION APP"
release_notes="$(git log --format=%B -n 1)"
echo "RELEASE NOTES: $release_notes"
# Deploy iOS
firebase appdistribution:distribute  ./platforms/ios/build/device/Opal\ Staging.ipa --app 1:652464215237:ios:a42a98feebcb5883f94cac --release-notes "$release_notes" --token "$FIREBASE_TOKEN"  --groups "staging"
# Deploy Android
firebase appdistribution:distribute ./platforms/android/app/build/outputs/apk/debug/app-debug.apk --app 1:652464215237:android:a281bac842624c92f94cac --release-notes "$release_notes" --token "$FIREBASE_TOKEN"  --groups "staging"
