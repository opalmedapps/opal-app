Update Cordova App to Include the login and home screen
====


## Basic file set up

1. Follow Guillaume's set up instructions.
2. Replace the contents of the www folder with the contents of this folder.

##Signing in
  Email:davidfhryam@yahoo.com
  Password:qplus
  
##Firebase Information

When my computer is on, there will be background daemon waiting for logged in users to update the fields.
Either change to a different firebase in the loginController.js file, line 8 and create a script to upload the firstname, lastname, email, and telnum fields to that firebase, or hope for my computer to be on running. :)

##Deploy the app
Follow the instructions given by https://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html
  
