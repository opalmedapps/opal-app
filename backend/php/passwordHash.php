<?php
require('./password_compat/lib/password.php');
$var=password_hash("staffTest", PASSWORD_DEFAULT);
$pass='staffTest';
if(password_verify($pass, $var))
{
  echo $var;
  echo 'david';
}

 ?>
