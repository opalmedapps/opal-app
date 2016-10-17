<?php

	/* To update notification */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

    // Construct array
    $notification = array(
        'name_EN'               => $_POST['name_EN'],
        'name_FR'               => $_POST['name_FR'],
        'description_EN'        => $_POST['description_EN'],
        'description_FR'        => $_POST['description_FR'],
        'type'                  => $_POST['type'],
        'serial'                => $_POST['serial']
    );

    $notificationObj = new Notification; // Object

    // Call function
    $response = $notificationObj->updateNotification($notification);
    print json_encode($response); // Return response
?>
