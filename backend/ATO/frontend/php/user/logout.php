<?php
    /* Simple logout script */ 

    session_start();
    session_destroy(); // Remove session

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);


    header("Location: ".ABS_URL."main.php"); // Redirect page
?>
