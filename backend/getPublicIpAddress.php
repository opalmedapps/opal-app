<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
if (isset($_SERVER['REMOTE_ADDR'])) {

  if($_SERVER['REMOTE_ADDR']=='::1'){
    echo '127.0.0.1';
  }else{
    echo inet_ntop($_SERVER['REMOTE_ADDR']);
  }

}
?>
