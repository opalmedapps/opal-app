Requirements:
NodeJS, Cordova, http-server node module.
 - Install Node.js

- Install cordova:

	-Follow the instructions to install cordova and create a the hello world project contained in the 	following link.
		 https://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html
	
	-Run commands: 
			$cordova platform add ios
			$cordova platform add android
	-Switch to the hello folder.
	-Replace all the files in the hello folder by the files inside the zip file.
	-Run command:
		-$cordova build
Should be ready now, 
APP INFORMATION:
		Username for app: ooof@gmail.com
		Password for app: 12345
	
-To run on browser,

		Run commands: 
		-$npm install 
	   	-$npm install -g http-server
		- Now while in hello folder run command: $http-server
		- On any browser go to, http://localhost:8080/#//Login
		- On a new tab, open firebase and go to luminous-heat-8715 		  database
	
	
	
-To run on iOS:

		Run command: cordova build ios
		Go to ios folder under hello/platforms/ios
		Select MUHC.xcodeproj file and open with Xcode
		Run with desired emulator.

		
	
