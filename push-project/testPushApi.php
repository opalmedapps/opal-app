<?php
    include_once('HospitalPushNotification.php');
    /*$data = array(
        "mtitle"=>"heelo",
        "mdesc"=>"world"
    );*/
    $response = HospitalPushNotification::sendNotificationUsingPatientId(1092300, 'Hello', 'World');

    print_r($response);

   ?>