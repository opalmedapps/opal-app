<?php

	/* To insert a newly created alias */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM params
	$aliasName_EN	= $_POST['name_EN'];
	$aliasName_FR	= $_POST['name_FR'];
	$aliasDesc_FR	= $_POST['description_FR'];
	$aliasDesc_EN	= $_POST['description_EN'];
	$aliasSer 	= $_POST['serial'];
	$aliasType 	= $_POST['type'];
    $aliasEduMat    = $_POST['eduMat'];
	$aliasTerms	= $_POST['terms'];
	// Construct array
	$aliasArray	= array(
		'name_EN' 	=> $aliasName_EN,
		'name_FR' 	=> $aliasName_FR,
		'description_EN'=> $aliasDesc_EN,
		'description_FR'=> $aliasDesc_FR,
 		'serial' 	=> $aliasSer,
        'type' 		=> $aliasType,
        'edumat'    => $aliasEduMat,
		'terms' 	=> $aliasTerms
	);

	$aliasObject = new Alias; // Object

	// Call function
	$aliasObject->insertAlias($aliasArray);
	
?>
