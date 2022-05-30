#!/bin/bash

# Interactive script that uses git tags with .gitlab-ci.yml to launch a build job on GitLab.
#
# Users will be prompted to choose a build environment among those available in the ./env folder (e.g. local, staging, etc.),
# and to choose a target platform (ios, android, or all).
#
# This script creates and pushes a tag on the current commit to trigger a build. Then, the tag is deleted.
#
# author: Stacey Beard
# date: 2022-05-10
#


# If this variable is modified, also edit the regex and build job choices in .gitlab-ci.yml
PLATFORM_CHOICES="ios android all"


# Checks if a string is in a space-separated list
# {string} $1 - The string to find.
# {string} $2 - A space-separated string containing the list of options among which to search.
# returns 1 if the string is in the list; 0 if it isn't.
isInList () {
  TO_FIND=$1
  LIST=$2
  FOUND=0
  for ELEMENT in $LIST
  do
    if [ "$TO_FIND" == "$ELEMENT" ]; then
      FOUND=1
    fi
  done
  return $FOUND
}

# Takes as input a space-separated string and replaces the spaces with commas+spaces
#     e.g. "hello welcome" becomes "hello, welcome"
# {string} $1 - The string to use.
# echos the resulting string after the replacements
spacesToCommas () {
  STRING=$1
  NEW_STRING="${STRING// /, }"
  echo "$NEW_STRING"
}

# ---- MAIN SCRIPT ----
if [ -f .gitlab-ci.yml ]; then

  # ---- CONTEXTUAL INFORMATION ----
  echo ""
  echo "Welcome to the GitLab CI/CD build script."
  echo ""
  echo "The current commit will be used to trigger a build on GitLab (excluding any local uncommitted changes):"
  echo ""
  git log -1 --format=short
  echo ""

  CURRENT_USER=$(git config user.name)
  echo "Your git username (git config user.name) will be used to identify the build job: $CURRENT_USER"
  echo ""

  # ---- ENVIRONMENT SELECTION ----
  # Extract the list of possible environments from the subdirectories in './env' (space-separated)
  ENV_CHOICES=$(find env -mindepth 1 -maxdepth 1 -type d)  # Read sub-directories
  ENV_CHOICES="${ENV_CHOICES//env\//}"                     # Get rid of the 'env/' prefixes
  ENV_CHOICES=$(echo "$ENV_CHOICES" | paste -s -d " " -)   # Paste all options on one space-separated line

  # Format the environment choices in a nice way for printing (comma-separated)
  ENV_CHOICES_PRINT_FRIENDLY=$(spacesToCommas "$ENV_CHOICES")

  read -p "Choose an environment ($ENV_CHOICES_PRINT_FRIENDLY): " INPUT_ENV

  # Check that the user's choice is in the list of available options
  isInList "$INPUT_ENV" "$ENV_CHOICES"
  VALID_ENV=$?
  if [ ! $VALID_ENV ] ; then
    echo "Invalid environment choice $INPUT_ENV"
    exit 1
  fi

  # ---- PLATFORM SELECTION ----
  # Format the platform choices in a nice way for printing (comma-separated)
  PLATFORM_CHOICES_PRINT_FRIENDLY=$(spacesToCommas "$PLATFORM_CHOICES")

  read -p "Choose a target platform ($PLATFORM_CHOICES_PRINT_FRIENDLY): " INPUT_PLATFORM

  # Check that the user's choice is in the list of available options
  isInList "$INPUT_PLATFORM" "$PLATFORM_CHOICES"
  VALID_PLATFORM=$?
  if [ ! $VALID_PLATFORM ] ; then
    echo "Invalid platform choice $INPUT_PLATFORM"
    exit 1
  fi

  # ---- EXECUTE BUILD ----
  # Assemble the tag name to use to launch the build
  CURRENT_USER_SANITIZED=$(echo "$CURRENT_USER" | sed 's/[^0-9A-Za-z]//g'); # Only keep characters allowed in tags
  TAG_NAME="build-$INPUT_ENV-$INPUT_PLATFORM-$CURRENT_USER_SANITIZED"

  # Prompt the user to continue
  echo ""
  read -p "Press enter to proceed with a $INPUT_ENV build for $INPUT_PLATFORM (tag name: $TAG_NAME)"

  echo "Launching build..."
  echo ""

  # Create and push a build tag. This tag will automatically be picked up by the regex in the .gitlab-ci.yml workflow rules.
  git tag -a "$TAG_NAME" -m "Created by build.sh for GitLab CI/CD"
  git push origin "$TAG_NAME"

  echo ""
  echo "The build status will appear shortly on the following page: https://gitlab.com/opalmedapps/qplus/-/pipelines"

  exit 0

else
  echo "Could not find .gitlab-ci.yml. Make sure this file exists before proceeding."
fi
