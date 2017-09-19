##How to get API running
1. Get an Apache server such as (MAMP)[https://www.mamp.info/en/] or (XAMPP)[https://www.apachefriends.org/index.html], it seems that XAMPP works 
better for Windows, while MAMP works better for MAC. The purpose of this is to get a database running with phpMySql, basically the apache will be
able to compile php requests to read from the mysql database, if you already have that or something similar skip this step.
2. Download the source code for the listener folder.
3. Download the .sql file under the folder listener and run the sql code to recreate the qplus table in your own server.
4. Go to the credentials.js file and change the credentials to run with your own sql database server.
5. `$node main.js` Will start the listener, it should be reading requests from the database.
6. `Change name of Firebase database in credentials.js to your own (Firebase)[https://www.firebase.com/signup/] if you want to play around with the data.

##Guide to API
Follow instructions above to get API running.
The api is under the listener folder, there are two ways to run the api. Via website server, and via a NodeJS script.
The website server version creates a connection with Firebase through the client side using the Firebase library for websites. The script version of the backend creates a connection with Firebase through the NodeJS library version of Firebase. 
### Why two version?
This becomes an issue when we try to use the NodeJS version of Firebase because of the hospital's Firewall, and SSL ceritificate problems (we suspect). This is been an outstanding problem for this project as if we were to get the NodeJS version working, we would not have a  need for the Website version. Having said that, the only solution found thus far is to use the client version of NodeJS, the website server, to connect to Firebase inside the hospital, this solution is not ideal as will be explained soon. I have enquire about this issue [here](https://groups.google.com/forum/#!searchin/firebase-talk/node$20firebase/firebase-talk/zuckXyk9Rj0/fQHyE8cgCgAJ).
###Why is the NodeJS script better than the Website server?
In terms of performance the difference is minimal! The main reason then is that the listener is a program that is supposed to run continuously, uniterrupted, unsupervised and at all times. This requirements makes for a system that should have ways to fallback in case of errors, system reestars and any other problem. If the listener is down for whatever reason the results would simply be disastrous as we would completely disconnect ALL our users from the servers. 
The listener then is best describe by the daemon definition, a daemon (/ˈdiːmən/ or /ˈdeɪmən/) is a computer program that runs as a background process, rather than being under the direct control of an interactive user [[1]](https://en.wikipedia.org/wiki/Daemon_(computing)).
###Via website server:

* To get a website server running, run script called server.js, this contains a script that uses a library called express.js and allows     you to connect your website to your backend given that you are hosting them both at the same place using node.js. Express basically      creates a channel of communication through a port and your website sends requests through this port, the backend scripts written in      NodeJS receive the request, query tables, and then send the response back to the website. For more information look up             [express](http://expressjs.com/) and check the server.js file, the last lines is the initialization of the port.

###Via node script:
* This is contained in the main.js file, simple run the instructions above.

