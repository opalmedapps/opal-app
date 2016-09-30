<?php 

	/* To update an alias for any changes */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$aliasObject = new Alias; // Object 

	// Retrieve FORM params
	$aliasName_EN	= $_POST['name_EN'];
	$aliasName_FR	= $_POST['name_FR'];
	$aliasDesc_FR	= $_POST['description_FR'];
	$aliasDesc_EN	= $_POST['description_EN'];
	$aliasSer 	= $_POST['serial'];
	$aliasTerms	= $_POST['terms'];
    $aliasEduMat    = $_POST['eduMat'];
	$aliasArray	= array(
		'name_EN' 	=> $aliasName_EN,
		'name_FR' 	=> $aliasName_FR,
		'description_EN'=> $aliasDesc_EN,
		'description_FR'=> $aliasDesc_FR,
 		'serial' 	=> $aliasSer,
        'terms' 	=> $aliasTerms,
        'edumat'    => $aliasEduMat
	);

	// Call function
    $response = $aliasObject->updateAlias($aliasArray);
    print json_encode($response);

?>
