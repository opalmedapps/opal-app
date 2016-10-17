<?php 

	/* To call Edu Material Object to update when the "Publish Flag" checkbox
	 * has been changed
	 */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

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
    print json_encode($response);
?>


