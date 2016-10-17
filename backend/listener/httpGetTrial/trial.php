<?php
if ($_SERVER['REQUEST_METHOD'] == 'GET' && empty($_GET)){
  $_GET = json_decode(file_get_contents('php://input'), true);
}
?>