<?php 

	/* To call Edu Material Object to update when the "Publish Flag" checkbox
	 * has been changed
	 */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$eduMatObject = new EduMaterial; // Object

	// Retrieve FORM params
	$eduMatPublishes	= $_POST['publishList'];
	
	// Construct array
	$eduMatList = array();

	foreach($eduMatPublishes as $eduMat) {
		array_push($eduMatList, array('serial' => $eduMat['serial'], 'publish' => $eduMat['publish']));
	}

	// Call function
    $response = $eduMatObject->updatePublishFlags($eduMatList);
    print json_encode($response); // Return response
?>


