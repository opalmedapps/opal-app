<?php
   require_once('PushNotifications.php');
   include_once "db.inc.php";
   
   class HospitalPushNotification{

       /**
       * ==============================================================================
       *            API CALL FUNCTIONS
       * ==============================================================================
       **/

        /**
        *    (sendSingleNotification($deviceType, $registrationId, $title, $description) 
        *    Consumes a $deviceType, a $registrationId, a  $title and a $message 
        *    Description: Sends notification with $title and $message to that device
        *    Requires: $deviceType = 0 or 1, 0 for iOS, 1 for Android.
	    *    Returns: Array containing key of success, failure, error if any.
        **/
       public function sendNotification($deviceType, $registrationId, $title, $description)
       {
           $message = array(
               "mtitle"=>$title,
               "mdesc"=>$description
           );
           if($deviceType==0)
           {
               $response = PushNotifications::iOS($message,$registrationId);
           }else if($deviceType==1)
           {
               $response = PushNotifications::android( $message,$registrationId);
           }
           return $response;
       }
    
        /**
        *    (sendNotificationToMultipleDevices($devices, $title, $description)
        *    Consumes a $title,  a $description and an array of $devices. 
        *    Sends notification with $title and $description to those devices listed
        *    Requires: $devices must have two fields for each array item: DeviceType,
        *    RegistrationId.
        *    Returns: Array of Objects, each object has keys of success, failure,    
        *    RegistrationId, DeviceType and error if any.
        **/
       public function sendNotificationToMultipleDevices($devices, $title, $description)
       {
           //Create message
           $message = array(
               "mtitle"=>$title,
               "mdesc"=>$description
           );

           //Go through list of devices
           $resultsArray = array();
           for ($i=0; $i <count($devices) ; $i++) { 
               //Determine device type
                if($devices[$i]["DeviceType"]==0)
                {
                    $response = PushNotifications::iOS($message, $devices[$i]["RegistrationId"]);
                }else if($device[$i]["DeviceType"]==1)
                {
                    $response = PushNotifications::android($message, $devices[$i]["RegistrationId"]);
                }
                //Build response
                $response["DeviceType"] = $devices[$i]["DeviceType"];
                $response["RegistrationId"] = $devices[$i]["RegistrationId"];
                $resultsArray[] = $response;
           }
          return array("responseDevices"=>$resultsArray);

       }
      /**
        *    sendRoomNotification($patientId, $room, $appointmentSerNum):
        *    Consumes a PatientId, a room location, and an AppointmentAriaSer, it 
        *    stores notification in database, updates appointment with room location, sends 
        *    the notification to the pertinent devices that map to that particular patientId,     
        *    and finally records the send status for the push notification.
        *    (sendRoomNotification String, String, String) -> Array
        *    Requires: - PatientId and AppointmentSerNum are real values in the Database. 
        *              - NotificationControlSerNum = 10, Corresponds to the AssignedRoom 
        *                notification.
        *    Returns:  Object containing keys of success, failure,    
        *             responseDevices, which is an array containing, (success, failure, 
        *             registrationId, deviceId) for each device, and Message array containing 
        *             (title,description),  NotificationSerNum, and error if any. 
        **/
       public function sendCallPatientNotification($patientId, $room, $appointmentAriaSer)
       {
           global $pdo;

           //Obtain Patient and appointment information from Database i.e. PatientSerNum, AppointmentSerNum and Language
           $sql = "SELECT Patient.Language, Patient.PatientSerNum, Appointment.AppointmentSerNum FROM Appointment, Patient WHERE Patient.PatientId = :patientId AND Patient.PatientSerNum = Appointment.PatientSerNum AND Appointment.AppointmentAriaSer = :ariaSer";
           try{
                $s = $pdo->prepare($sql);
                $s->bindValue(':patientId', $patientId);
                $s->bindValue(':ariaSer', $appointmentAriaSer);
                $s->execute();
                $result = $s->fetchAll();
           }catch(PDOException $e)
           {
               return array("success"=>0,"failure"=>1,"error"=>$e);
               exit();
           }
           if(count($result)==0)
           {
               return array("success"=>0,"failure"=>1,"error"=>"No matching PatientSerNum or AppointmentSerNum in Database");
               exit();
           }
           
           //Sets parameters for later usage
            $language = $result[0]["Language"];
            $patientSerNum = $result[0]["PatientSerNum"];
            $appointmentSerNum = $result[0]["AppointmentSerNum"];


           //Update appointment room location in database
           try{
               $sql = "UPDATE Appointment SET RoomLocation_EN = '".$room['room_EN']."', RoomLocation_FR = '".$room['room_FR']."' WHERE Appointment.AppointmentAriaSer = ".$appointmentAriaSer." AND Appointment.PatientSerNum = ".$patientSerNum;
                $resultAppointment = $pdo->query($sql); 
           }catch(PDOException $e)
           {
               return array("success"=>0,"failure"=>1,"error"=>$e);
               exit();
           }
           
           //Insert into notifications table
           try{
             $sql = 'INSERT INTO `Notification` (`PatientSerNum`, `NotificationControlSerNum`, `RefTableRowSerNum`, `DateAdded`, `ReadStatus`) SELECT '.$result[0]["PatientSerNum"].',ntc.NotificationControlSerNum,'.$result[0]["AppointmentSerNum"].', NOW(),0 FROM NotificationControl ntc WHERE ntc.NotificationType = "RoomAssignment"';
             $resultNotification = $pdo->query($sql);
           }catch(PDOException $e)
           {
               return array("success"=>0,"failure"=>1,"error"=>$e);
               exit();
           }
 
           //Obtain NotificationSerNum for the last inserted Id.
            $notificationSerNum = $pdo->lastInsertId();

            //Obtain message for room assignment
            try{
                $sql = 'SELECT Name_'.$language.', Description_'.$language.' FROM NotificationControl WHERE NotificationType = "RoomAssignment"';
                $result = $pdo->query($sql);
            }catch(PDOException $e)
            {
                return array("success"=>0,"failure"=>1,"error"=>$e);
                exit();
            }

            //Build message, replace the $roomLocation with the actual room location argument $room
            $messageLabels = $result->fetch();
           
            $message = self::buildMessageForRoomNotification($room, $messageLabels["Name_".$language ],$messageLabels["Description_".$language] );
           //Obtain patient device identifiers
            $patientDevices = self::getDevicesForPatient($patientId);

            //If no identifiers return there are no identifiers
            if(count($patientDevices)==0)
            {
                return array("success"=>1, "failure"=>0,"responseDevices"=>"No patient devices available for that patient");
                exit();
            }
            
            //Send message to patient devices and record in database
            $resultsArray = array();
            foreach($patientDevices as $device)
            {   
                //Determine device type
                if($device["DeviceType"]==0)
                {
                    $response = PushNotifications::iOS($message, $device["RegistrationId"]);
                }else if($device["DeviceType"]==1)
                {
                    $response = PushNotifications::android($message, $device["RegistrationId"]);
                }

                //Log result of push notification on database.
                self::pushNotificationDatabaseUpdate($device["PatientDeviceIdentifierSerNum"], $notificationSerNum, $response);
                //Build response
                $response["DeviceType"] = $device["DeviceType"];
                $response["RegistrationId"] = $device["RegistrationId"];
                $resultsArray[] = $response;
            }

            return array("success"=>1,"failure"=>0,"responseDevices"=>$resultsArray,"message"=>$message,"notificationSerNum"=>$notificationSerNum);
       }
        
       /**
       *    (sendNotificationUsingPatientId($patientId, $title, $description)) 
       *    Consumes a patientId, a title and a descriptions
       *    Description: Sends push notification containing title and description to all the
       *                 devices matching that $patientId. 
       *    NOTE: Does not log anything into database. 
       *    Returns: Object with success, failure, responseDevices 
       *            (array of response for each device), and the message array sent.
       **/
       public function sendNotificationUsingPatientId($patientId, $title, $description)
       {
           //Creating message
           $message = array(
               "mtitle"=> $title,
               "mdesc"=> $description
           );
            
            $patientDevices = self::getDevicesForPatient($patientId);
            //If not identifiers return there are no identifiers
            if(count($patientDevices)==0)
            {
                return array("success"=>1, "failure"=>0,"responseDevices"=>"No patient devices available for that patient");
                exit();
            }

           foreach($patientDevices as $device)
            {   
                //Determine device type
                if($device["DeviceType"]==0)
                {
                    $response = PushNotifications::iOS($message, $device["RegistrationId"]);
                }else if($device["DeviceType"]==1)
                {
                    $response = PushNotifications::android($message, $device["RegistrationId"]);
                }

                //Build response
                $response["DeviceType"] = $device["DeviceType"];
                $response["RegistrationId"] = $device["RegistrationId"];
                $resultsArray[] = $response;
            }

            return array("success"=>1,"failure"=>0,"responseDevices"=>$resultsArray,"message"=>$message);
       }

       /**
       *    (sendFailedNotificationUsingNotificationSerNum($patientId, $title, $description,
       *     $notificationSerNum)) 
       *    Consumes a patientId, a title, a description, and a notificationSerNum
       *    Description: Sends push notification containing title and description to all the
       *                 devices matching that $patientId and records results into OpalDB
       *    Returns: Object with success, failure, responseDevices 
       *            (array of response for each device), and the message array sent.
       **/
       public function sendFailedNotificationUsingNotificationSerNum($patientId, $title, $description, $notificationSerNum)
       {
            //Creating message
           $message = array(
               "mtitle"=> $title,
               "mdesc"=> $description
           );

           //Retrieve device identifiers for patient
            $patientDevices = self::getDevicesForPatient($patientId);
        
            //If not identifiers return there are no identifiers
            if(count($patientDevices)==0)
            {
                return array("success"=>1, "failure"=>0,"response"=>"No patient devices available for that patient");
                exit();
            }
           $resultsArray = array();
           foreach($patientDevices as $device)
            {   
                //Determine device type
                if($device["DeviceType"]==0)
                {
                    $response = PushNotifications::iOS($message, $device["RegistrationId"]);
                }else if($device["DeviceType"]==1)
                {
                    $response = PushNotifications::android($message, $device["RegistrationId"]);
                }

                //Log result of push notification on database.
                self::pushNotificationDatabaseUpdate($device["PatientDeviceIdentifierSerNum"], $notificationSerNum, $response);
                //Build response
                $response["DeviceType"] = $device["DeviceType"];
                $response["RegistrationId"] = $device["RegistrationId"];
                $resultsArray[] = $response;
            }

            return array("success"=>1,"failure"=>0,"responseDevices"=>$resultsArray);
       }
       /**
       * ==============================================================================
       *                    HELPER FUNCTIONS
       * ==============================================================================
       **/

        /**
        *    (pushNotificationDatabaseUpdate($deviceSerNum, $notificationSerNum, $sendStatus)
        *    Consumes a PatientDeviceIdentifierSerNum, $deviceSerNum,  a NotificationSerNum, $notificationSerNum 
        *    and response, $response, where send status is a 1 or 0 for whether is was successfully sent or not.
        *    Inserts a into the PushNotification table or updates SendLog flag.
        *    RegistrationId.
        *    Returns: Returns the send status   
        **/
       private function pushNotificationDatabaseUpdate($deviceSerNum, $notificationSerNum, $response)
       {
           global $pdo;
           $sendStatus  = $response['success'];
           $sendLog     = $response['error'];
           if ($sendStatus == 0) {$sendStatus = 'F';}
           else {
               $sendStatus = 'T';
               $sendLog = "Successfully sent push notification!";
           } 
           $sql = " INSERT INTO `PushNotification`(
                    `PatientDeviceIdentifierSerNum`, `PatientSerNum`, `NotificationControlSerNum`,
                    `RefTableRowSerNum`, `DateAdded`, `SendStatus`, `SendLog`) 
                    SELECT ".$deviceSerNum.", nt.PatientSerNum, nt.NotificationControlSerNum, nt.RefTableRowSerNum,
                    NOW(),'".$sendStatus."','".$sendLog."' FROM Notification nt WHERE nt.NotificationSerNum = ".$notificationSerNum;
           $result = $pdo->query($sql);
           return $sendStatus;
       }

       /**
        *    (getDevicesForPatient($patientId)
        *    Consumes a PatientId, $patientId
        *    Returns: Returns array with devices that match that particular PatiendId. 
        **/
       private function getDevicesForPatient($patientId)
       {
           global $pdo;
           //Retrieving device registration id for notification and device
           try{
               $sql = "SELECT PatientDeviceIdentifier.PatientDeviceIdentifierSerNum, PatientDeviceIdentifier.RegistrationId, PatientDeviceIdentifier.DeviceType FROM PatientDeviceIdentifier, Patient WHERE Patient.PatientId = '".$patientId."' AND Patient.PatientSerNum = PatientDeviceIdentifier.PatientSerNum";
               $result = $pdo->query($sql);
           }catch(PDOException $e)
           {
               echo $e;
               exit();
           }
          return $result ->fetchAll();
       }
       
       /**
        *    (buildMessageForRoomNotification($room, $title, $description)
        *    Consumes a room, a title and a description of message
        *    Description: Builds push notification message for Room Notification
        *    Returns: Returns array with the push notification message to be sent
        **/
       private function buildMessageForRoomNotification($room, $title, $description)
       {
            $message = array(
               "mtitle"=>$title,
               "mdesc"=>str_replace('$roomNumber',$room, $description)
            );
            return $message;
       }
      

       


       

   }
   
?>
