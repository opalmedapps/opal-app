<?php

	/* To delete a post */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$post = new Post; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
    $response = $post->removePost($serial);

    print json_encode($response); // Return response

?>
