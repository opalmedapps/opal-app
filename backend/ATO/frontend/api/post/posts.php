<?php
	/* To get a list of existing posts */

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$post = new Post; // Object

	// Call function
	$existingPostList = $post->getExistingPosts();

	// Callback to http request
	print $callback.'('.json_encode($existingPostList).')';

?>
