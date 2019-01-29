#!/bin/bash

# Original script : bumpversion.sh and modified
# for staging version

# works with a file called STAGING in the current directory,
# the contents of which should be a semantic version number
# such as "1.2.3.4"

# this script will display the current version, automatically
# suggest a "minor" version update, and ask for input to use
# the suggestion, or a newly entered value.

# once the new version number is determined, the script will
# pull a list of changes from git history, prepend this to
# a file called CHANGES (under the title of the new version
# number) and create a GIT tag.

if [ -f STAGING ]; then
    BASE_STRING=`cat STAGING`
    BASE_LIST=(`echo $BASE_STRING | tr '.' ' '`)
    V_MAJOR=${BASE_LIST[0]}
    V_MINOR=${BASE_LIST[1]}
    V_CHANGE=${BASE_LIST[2]}
    V_PATCH=${BASE_LIST[3]}
    echo "Current staging : $BASE_STRING"
    V_MINOR=$((V_MINOR + 1))
    V_CHANGE=0
    V_PATCH=0
    SUGGESTED_VERSION="$V_MAJOR.$V_MINOR.$V_CHANGE.$V_PATCH"
    read -p "Enter a staging number [$SUGGESTED_VERSION]: " INPUT_STRING
    if [ "$INPUT_STRING" = "" ]; then
        INPUT_STRING=$SUGGESTED_VERSION
    fi
    echo "Will set new staging to be $INPUT_STRING"
    echo $INPUT_STRING > STAGING
    echo "Staging $INPUT_STRING:" > tmpfile
    git log --pretty=format:" - %s" "st$BASE_STRING"...HEAD >> tmpfile
    echo "" >> tmpfile
    echo "" >> tmpfile
    cat CHANGES >> tmpfile
    mv tmpfile CHANGES
    git add CHANGES STAGING
    git commit -m "Staging bump to $INPUT_STRING"
    git tag -a -m "Tagging staging $INPUT_STRING" "st$INPUT_STRING"
else
    echo "Could not find a STAGING file"
    read -p "Do you want to create a staging file and start from scratch? [y]" RESPONSE
    if [ "$RESPONSE" = "" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "Y" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "Yes" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "yes" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "YES" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "y" ]; then
        echo "0.1.0.0" > STAGING
        echo "Staging 0.1.0.0" > CHANGES
        git log --pretty=format:" - %s" >> CHANGES
        echo "" >> CHANGES
        echo "" >> CHANGES
        git add STAGING CHANGES
        git commit -m "Added STAGING and CHANGES files, Staging bump to st0.1.0.0"
        git tag -a -m "Tagging staging 0.1.0.0" "st0.1.0.0"
    fi

fi
