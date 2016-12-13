<?php
include "config.php";
    try{
       $pdo = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
       $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
       $pdo->exec('SET NAMES "utf8"');
   }catch(PDOException $e)
   {
       echo $e;
   }
?>
