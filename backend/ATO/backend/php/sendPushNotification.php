<?php

    /* Script to send push notifications given the following POST requests. */

    $messageTitle       = $_POST['message_title'];
    $messageText        = $_POST['message_text'];
    $deviceType         = $_POST['device_type'];
    $registrationID     = $_POST['registration_id'];

    include_once('HospitalPushNotification.php');

    // Call API to send push notification
    $response = HospitalPushNotification::sendNotification($deviceType, $registrationID, $messageTitle, $messageText);

    // Return response
    print json_encode($response);

?>
