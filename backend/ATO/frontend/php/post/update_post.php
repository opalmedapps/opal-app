<?php 

	/* To update a post for any changes */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$postObject = new Post; // Object 

	// Construct array
	$postArray	= array(
		'name_EN' 	        => $_POST['name_EN'],
		'name_FR' 	        => $_POST['name_FR'],
        'body_EN'           => str_replace(array('"', "'"), '\"', $_POST['body_EN']),
        'body_FR'           => str_replace(array('"', "'"), '\"', $_POST['body_FR']),
        'publish_date'      => $_POST['publish_date'],
        'filters'           => $_POST['filters'],
 		'serial' 	        => $_POST['serial'],
 		'type' 		        => $_POST['type']
	);

	// Call function
    $response = $postObject->updatePost($postArray);

    print json_encode($response);

?>
