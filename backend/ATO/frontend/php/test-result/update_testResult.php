<?php 

	/* To update an edu material for any changes */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

    $testResult = new TestResult; // Object

    // Construct array
    $testResultArray = array(
        'name_EN'           => $_POST['name_EN'],
        'name_FR'           => $_POST['name_FR'],
        'description_EN'    => $_POST['description_EN'],
        'description_FR'    => $_POST['description_FR'],
        'group_EN'          => $_POST['group_EN'],
        'group_FR'          => $_POST['group_FR'],
        'serial'            => $_POST['serial'],
        'tests'             => $_POST['tests']
    );

    // Call function
    $response = $testResult->updateTestResult($testResultArray);
    print json_encode($response);
?>

