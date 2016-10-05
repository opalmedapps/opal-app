<?php 

	/* To update an edu material for any changes */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

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
    print json_encode($response); // Return response
?>

