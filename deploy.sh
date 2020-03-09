#!/usr/bin/env bash
## Get last commit message
FIREBASE_TOKEN="1//0f2B50Bte2dbtCgYIARAAGA8SNwF-L9IrM4C-06qkQB7nzW8NVbzkHRdtvnFL90wH26ah6SHkwOs7jrgEXzd2nTLnjRJYrgDlwfU"
# Set the project to preprod
#echo "SETTING UP ENVIRONMENT"
#firebase use staging --token "$FIREBASE_TOKEN"
#echo "BUILDING APP"
#npm run build:staging
#echo "DEPLOYING REDIRECT WEBSITE"
#firebase deploy
#echo "DISTRIBUTION APP"
release_notes="$(git log --format=%B -n 1)"
echo "RELEASE NOTES: $release_notes"
# Deploy iOS
firebase appdistribution:distribute ./platforms/ios/build/device/Opal\ Staging.ipa --app 1:476395494069:ios:240e439dca2279403afcfc --release-notes "$release_notes" --token "$FIREBASE_TOKEN" --testers "davidfherrerar@gmail.com"

