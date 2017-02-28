<?php
    /* Script to call sendCallPatientNotification given the following GET requests. */

    $patientId          = $_GET['patientid'];
    $room_EN            = $_GET['room_EN'];
    $room_FR            = $_GET['room_FR'];
    $apptSourceUID      = $_GET['appointment_ariaser'];

    // Combine room info
    $room = array( 
        'room_EN'   => $room_EN,
        'room_FR'   => $room_FR
    );

    include_once('HospitalPushNotification.php');

    // Call API 
    $responses = HospitalPushNotification::sendCallPatientNotification($patientId, $room, $apptSourceUID);

    // Return responses
    print json_encode($responses);
?>
