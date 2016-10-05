<?php
/* Simple logout script */ 
session_start();
session_destroy(); // Remove session
// DEV
include_once("config_ATO_DEV.php");
/* PRO
 *include_once("config_AEHRA_PRO.php");
 */

header("Location: ".ABS_URL."main.php"); // Redirect page
?>
