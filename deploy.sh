#!/usr/bin/env bash
## Get last commit message
# Set the project to preprod
echo "SETTING UP ENVIRONMENT"
firebase use preprod --token "$FIREBASE_TOKEN"
# echo "BUMPING BUILD_VERSION for app in staging"
echo "BUILDING APP"
npm run build:app:staging
node -e "require('./opal_env.setup').bumpBuildNumbers('staging')"
echo "DEPLOYING REDIRECT WEBSITE"
firebase deploy
echo "DISTRIBUTION APP"
release_notes="$(git log --format=%B -n 1)"
echo "RELEASE NOTES: $release_notes"
# Deploy iOS PreProd
# firebase appdistribution:distribute  ./platforms/ios/build/device/Opal\ Pre\ Prod.ipa --app 1:476395494069:ios:240e439dca2279403afcfc --release-notes "$release_notes" --token "$FIREBASE_TOKEN"  --groups "preprod"
# Deploy Android PreProd
# firebase appdistribution:distribute ./platforms/android/app/build/outputs/apk/debug/app-debug.apk --app 1:476395494069:android:d0f90b091897d35c3afcfc --release-notes "$release_notes" --token "$FIREBASE_TOKEN"  --groups "preprod"
# Deploy iOS Staging
firebase appdistribution:distribute  ./platforms/ios/build/device/Opal\ Pre\ Prod.ipa --app 1:652464215237:ios:a42a98feebcb5883f94cac --release-notes "$release_notes" --token "$FIREBASE_TOKEN"  --groups "staging"
# Deploy Android Staging
firebase appdistribution:distribute ./platforms/android/app/build/outputs/apk/debug/app-debug.apk --app 1:652464215237:android:a281bac842624c92f94cac --release-notes "$release_notes" --token "$FIREBASE_TOKEN"  --groups "staging"