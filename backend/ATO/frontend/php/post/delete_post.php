<?php

	/* To delete a post */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$post = new Post; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
    $response = $post->removePost($serial);

    print json_encode($response);

?>
