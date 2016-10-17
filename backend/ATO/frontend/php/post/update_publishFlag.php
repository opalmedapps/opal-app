<?php 

	/* To call Post Object to update post when the "Publish Flag" checkbox
	 * has been changed
	 */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$postObject = new Post; // Object

	// Retrieve FORM params
	$postPublishes	= $_POST['publishList'];
	
	// Construct array
	$postList = array();

	foreach($postPublishes as $post) {
		array_push($postList, array('serial' => $post['serial'], 'publish' => $post['publish']));
	}

	// Call function
    $response = $postObject->updatePostPublishFlags($postList);
    print json_encode($response); // Return response
?>


