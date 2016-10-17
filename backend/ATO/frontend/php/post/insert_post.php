<?php

	/* To insert a newly created post */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Construct array
	$postArray	= array(
		'name_EN' 	        => $_POST['name_EN'],
		'name_FR' 	        => $_POST['name_FR'],
        'body_EN'           => str_replace(array('"', "'"), '\"', $_POST['body_EN']),
        'body_FR'           => str_replace(array('"', "'"), '\"', $_POST['body_FR']),
        'publish_date'      => $_POST['publish_date'],
        'filters'           => $_POST['filters'],
 		'type' 		        => $_POST['type']
	);

	$postObject = new Post; // Object

	// Call function
	$postObject->insertPost($postArray);
	
?>
