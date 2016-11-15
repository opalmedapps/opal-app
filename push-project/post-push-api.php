
<?php
    require_once('HospitalPushNotification.php');              
   if(isset($_POST["NotificationType"]))
   {
       switch($_POST["NotificationType"])
       {       
           case "RoomAssignedNotification":
                if(isset($_POST["PatientId"]) && isset($_POST["RoomLocation"]) && isset($_POST["AppointmentAriaSer"]))
                {
                    $result = HospitalPushNotification::sendCallPatientNotification($_POST["PatientId"], $_POST["RoomLocation"], $_POST["AppointmentAriaSer"]);     
                }else{
                    $result = array("success"=>"0","failure"=>"1","error"=>"Invalid Parameters for Request");
                } 
                break;
          case "SendNotification":
                if(isset($_POST["DeviceType"]) && isset($_POST["RegistrationId"]) && isset($_POST["NotificationTitle"]) && isset($_POST["NotificationDescription"]))
                {
                    $result = HospitalPushNotification::sendNotification($_POST["DeviceType"], $_POST["RegistrationId"], $_POST["NotificationTitle"], $_POST["NotificationDescription"]);   
                }else{
                    $result = array("success"=>"0","failure"=>"1","error"=>"Invalid Parameters for Request");
                } 
                break;
         case "SendNotificationMultipleDevices":
                if(isset($_POST["Devices"]) && isset($_POST["NotificationTitle"]) && isset($_POST["NotificationDescription"]))
                {
                    $result = HospitalPushNotification::sendNotificationToMultipleDevices($_POST["Devices"], $_POST["NotificationTitle"], $_POST["NotificationDescription"]);   
                }else{
                    $result = array("success"=>"0","failure"=>"1","error"=>"Invalid Parameters for Request");
                } 
            break;
        
         case "SendNotificationUsingPatientId":
                if(isset($_POST["PatientId"]) && isset($_POST["NotificationTitle"]) && isset($_POST["NotificationDescription"]))
                {
                    $result = HospitalPushNotification::sendNotificationUsingPatientId($_POST["PatientId"], $_POST["NotificationTitle"], $_POST["NotificationDescription"]);   
                }else{
                    $result = array("success"=>"0","failure"=>"1","error"=>"Invalid Parameters for Request");
                } 
            break;
        // case "SendNotificationUsingNotificationSerNum":
        //     break;
         
       }
       echo json_encode($result);
   }
    
?>