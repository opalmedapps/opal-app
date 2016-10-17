<?php
	/* To get details on a particular post */

	// Include config module 
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM params
	$callback = $_GET['callback'];
	$serial = $_GET['serial'];

	$post = new Post; // Object

	// Call function
	$postDetails = $post->getPostDetails($serial);

	// Callback to http request
	print $callback.'('.json_encode($postDetails).')';

?>
