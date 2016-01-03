##Guide to get API running
1. Get an Apache server such as (MAMP)[https://www.mamp.info/en/] or (XAMPP)[https://www.apachefriends.org/index.html], it seems that XAMPP works 
better for Windows, while MAMP works better for MAC. The purpose of this is to get a database running with phpMySql, basically the apache will be
able to compile php requests to read from the mysql database, if you already have that or something similar skip this step.
2. Download the source code for the listener folder.
3. Download the .sql file under the folder listener and run the sql code to recreate the qplus table in your own server.
4. Go to the credentials.js file and change the credentials to run with your own sql database server.
5. `$node main.js` Will start the listener, it should be reading requests from the database.
6. `Change name of Firebase database in credentials.js to your own (Firebase)[https://www.firebase.com/signup/] if you want to play around with the data.

