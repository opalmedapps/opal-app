#!/bin/sh

#BUILD SCRIPT FOR OPAL APP.
#Parameters: Target (valid entries: prod or preprod), Version
#Description: Builds the target app. It performs tests and various other tasks to prepare for the build such as updating version and adding to changelog.
#			  In addition there is a stream-lined checklist to make sure the deployer followed standard procedures to avoid wasting time re-building due to trivial error.


#It will immediately stop your script if a simple command fails.
set -e

DEST=$1
VERSION=$2

WORKING_DIR=/Users/rob/Opal/qplus
PREPROD_DIR=/Users/rob/Web/QPlus/Cordova/dev-opal
PROD_DIR=/Users/rob/Web/QPlus/Cordova/opal

TARGET_DIR=''

#Check if working directory exists
if [ ! -d "$WORKING_DIR" ]; then
	echo "ERROR: Specified working directory in configuration does not exist. Please fix before continuing."
fi

#Check if pre-production directory exists
if [ ! -d "$PREPROD_DIR" ]; then
	echo "ERROR: Specified pre-production directory in configuration does not exist. Please fix before continuing."
fi

#Check if production directory exists
if [ ! -d "$PROD_DIR" ]; then
	echo "ERROR: Specified production directory in configuration does not exist. Please fix before continuing."
fi

#If there is no first parameter, then display the "help" view with instructions on how to use this script
if [ -z "$DEST" ]
then
	echo ""
	echo ""
	echo "Welcome to the Opal App build script!"
	echo ""
	echo "This build script is relatively simple and only takes in 2 parameters."
	echo "However, note, that if you building on computer other than 'Rob's old computer' ... all Opal developers should know what I mean by this... then you need to change the folder destinations in the script before continuing."
	echo ""
	echo ""
	echo "Parameters: "
	echo ""
	echo "Target: you only have two options for this parameter... "
	echo "		preprod -- to build the preproduction version of the app"
	echo "		prod -- to build the production version of the app"
	echo ""
	echo "Version: a string representing the version of the app your building. Needs to be in the format x.x.x (i.e semver)"
	echo ""
	echo ""
	exit -1
fi

#Verify that version number was inputted
if [ -z "$VERSION" ]
then
	echo "Please specify a version number"
	exit -1
fi

#Evaluate the correct version format was entered (ie semver)
rx='^([0-9]+\.){2}(\*|[0-9]+)$'
if  [[ ! $VERSION =~ $rx ]]; then
	echo ""
	echo "Improper version: '$VERSION'"
	echo "Please follow the semver syntax. (i.e. 1.2.3)"
	echo ""
 	exit -1
fi

if [ "$DEST" = "preprod" ] || [ "$DEST" = "prod" ]
then
	
	#Make sure you are on the correct branch
	if [ "$DEST" = "preprod" ]
	then
		TARGET_DIR=$PREPROD_DIR
		BRANCH=$(git --git-dir $WORKING_DIR/.git rev-parse --abbrev-ref HEAD)
		if [[ "$BRANCH" != "opal_pre_prod" ]]; then
			echo ""
		  	echo "Error: You are not on the correct branch! You are currently on $BRANCH. Please switch to opal_pre_prod before trying to build to preprod app";
		  	echo ""
		  	exit 1;
		fi
	else
		TARGET_DIR=$PROD_DIR
		BRANCH=$(git --git-dir $WORKING_DIR/.git rev-parse --abbrev-ref HEAD)
		if [[ "$BRANCH" != "master" ]]; then
			echo ""
			echo "Error: You are not on the correct branch! You are currently on $BRANCH. Please switch to opal_prod before trying to build the prod app";
			echo ""
			exit 1;
		fi
	fi

	#If files can be pushed... go ahead and do so.
	LOCAL=$(git --git-dir $WORKING_DIR/.git rev-parse @)
	REMOTE=$(git --git-dir $WORKING_DIR/.git rev-parse @{u})
	BASE=$(git --git-dir $WORKING_DIR/.git merge-base @ @{u})

	if [ $LOCAL = $REMOTE ]; then
		echo ""
	    echo "Your branch is Up-to-date, continuing with build process..."
	    echo ""
	elif [ $LOCAL = $BASE ]; then
		echo ""
	    echo "Need to pull. Please pull latest changes before running this build script."
	    echo ""
	    exit -1
	elif [ $REMOTE = $BASE ]; then
		echo ""
	    echo "Keep in mind that there are changes you need to push.. please do so after this build!"
	    echo ""
	else
	    echo "Diverged"
	fi

	#Make sure the user is aware of what they are trying to do, and ask for input to contine
	echo ""
	echo "You are attempting to build the $DEST version of the Opal App. This will overwrite everything currently existing in $TARGET_DIR and cannot be undone."

	while true; do
		echo ""
	    read -p "Do you wish to continue with the build process? (Y/n) " yn
	    case $yn in
	        [Yy]* ) echo "Continuing build process..."; break;;
	        [Nn]* ) echo "Exiting build process"; exit;;
	        * ) echo "Please answer yes or no.";;
	    esac
	done

	cd $WORKING_DIR
	cd www

	#Make sure karma config is set up properly... (i.e. with phantomJS and watching turned off)
	echo ""
	echo "Validating that karma.conf is properly configured..."

	#TODO: PERFORM KARMA CONFIG VALIDATION CHECK HERE

	# karma start

	#TODO: ANALYZE ERRORS?

	
	#Move to target environment
	cd $TARGET_DIR
	rm -r www
	mkdir www

	#Prod specific build phase, this includes gulp taks + using proper index.html file
	if [ "$DEST" = "prod" ]; then
		#Run Gulp tasks in order to compress and bundle all needed files
		cd $WORKING_DIR

		echo ""
		echo ""
		echo "Making sure all build dependencies are installed..."
		echo ""
		echo ""

		npm install

		echo ""
		echo ""
		echo "Dependency installation was successful. Now starting gulp automated processes."
		echo ""
		echo ""

		#Do minification work here
		gulp build

		echo ""
		echo ""
		echo "Gulp build tasks were successful!"
		echo ""
		echo ""
		echo "Copying over other dependencies to dest folder..."

		#Copy over language directory
		cp -a $WORKING_DIR/www/Languages/. $WORKING_DIR/dest/Languages

		#Copy over fonts directory to root
		cp -a $WORKING_DIR/www/fonts/. $WORKING_DIR/dest/fonts

		#Copy over fonts directory to vendor for OnsenUI
		cp -a $WORKING_DIR/www/fonts/. $WORKING_DIR/dest/vendor/fonts

		cp $WORKING_DIR/www/lib/bower_components/bootstrap/dist/css/bootstrap.min.css.map $WORKING_DIR/dest/vendor

		#Grab from dest folder and move them the production environment
		cp -a $WORKING_DIR/dest/. $TARGET_DIR/www

		echo ""
		echo ""
		echo "Copying completed successfully..."

		echo ""
		echo ""
		echo "Removing intermediate build folder..."
	
		#You can now remove the dest folder 
		rm -r $WORKING_DIR/dest


	else
		#Just transfer everything over if not in production mode 
		cp -a $WORKING_DIR/www/. $TARGET_DIR/www
		rm www/karma.conf.js
		rm www/package.json

		if [ -d "$WORKING_DIR/www/node_modules" ]; then
            rm -r www/node_modules
        fi
	fi

	#TODO: UPDATE VERSION # IN CONFIG.XML + Gradle.Build file

	echo ""
	echo ""
	echo ""
	echo "Copying over config.xml to build destination..."

	#Remove current config.xml and replace with current one
	rm $TARGET_DIR/config.xml
	cp $WORKING_DIR/config.xml $TARGET_DIR

	#Move to target directory
	cd $TARGET_DIR

	echo ""
	echo ""
	echo ""
	echo "All checks have been met... time to build...."
	echo ""
	echo ""
	echo ""

	#All checks have been met... time to build...
	if [ "$DEST" = "prod" ]; then
		cordova build -verbose

		#TODO: ARCHIVE APP WITH XCODE

		#AUTOMATE FABRIC.IO DEPLOYMENT PROCESS

	else
		cordova build
	fi

	
	echo ""
	echo "Build was successful!"
	echo ""

	if [ "$DEST" = "prod" ]; then
		echo "Opening up changelog for you to update!"
		cd $WORKING_DIR
		vi CHANGELOG.md
	fi

else
	echo ""
	echo ""
	echo "Please specify a valid build destination as the first parameter."
	echo "Valid entries are: " 
	echo ""
	echo ""
	echo "preprod --- for building the testing version"
	echo ""
	echo "prod --- if you want to build the release version."
	echo ""
	echo ""

fi