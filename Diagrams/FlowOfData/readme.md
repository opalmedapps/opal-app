##Data Flow App

This document will walk through the interaction between the server data and how the app handles and processes all this data from an overall perspective

###Case 1: Incoming data from login.
###Steps:
1. The user authenticates and sends request to Firebase
2. The app goes into the loading state where the loading controller calls, the UpdateUI service.
3. UpdateUI service determines if app is online or offline, if online it listens for firebase to upload the data. If offline, if there is data for the patient saved in the local storage UpdateUI uses that.
4. Once UpdateUI has the information, either offline or online, it distributes this information to all the services for the views i.e. it grabs the patient information and sends it to the Patient service, grabs the doctors information and sends it to the Doctor service, it grabs the patient documents and sends it to the Documents service.
5. At this point, UpdateUI waits for all the services to process this data and return to tell the loading controller to send the user to the home page.
6. Once in the home page, the home view uses the HomeController, the HomeController grabs the information from the services, at this point that information is already processed and ready to use by the controller and the view.



###Case 2: Request from view to update server
Imagine you want to send something to the server in order to update the information in the server tables, examples of this would be sending a message, checking in to an appointment, reading a message, reading a notification, etc.
###Steps:
1. User performs an action, such as sending a message, reading an unread message as explained above.
2. The controller responds by calling the RequestToServer service to send a request to the database, this service will format the request appropiately, encrypt it using the EncryptionService, then send it to firebase. 
####Improvements
Maybe there should be a way from the server to response letting the user or app know that the request was successful.




