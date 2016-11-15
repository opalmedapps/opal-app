<?php
include "config.php";
    try{
       $pdo = new PDO('mysql:unix_socket=/Applications/MAMP/tmp/mysql/mysql.sock;dbname=QPlusApp','root','root');
       //$pdo = new PDO('mysql:host='.DATABASE_HOST.';dbname='.DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD);
       $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
       $pdo->exec('SET NAMES "utf8"');
   }catch(PDOException $e)
   {
       echo $e;
   }
?>