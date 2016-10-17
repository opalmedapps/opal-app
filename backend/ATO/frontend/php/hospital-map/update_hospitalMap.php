<?php

	/* To update hospital map */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

    // Construct array
    $hosMapArray = array(
        'name_EN'           => $_POST['name_EN'],
        'name_FR'           => $_POST['name_FR'],
        'description_EN'    => $_POST['description_EN'],
        'description_FR'    => $_POST['description_FR'],
        'url'               => $_POST['url'],
        'qrid'              => $_POST['qrid'],
        'serial'            => $_POST['serial']
    );

    $hosMap = new HospitalMap;

    // Call function
    $hosMap->updateHospitalMap($hosMapArray);

?>

