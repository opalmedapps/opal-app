<?php
require_once('../password_compat/random_string_generator.php');
$rand=new randomString();
echo $rand->rand_sha1(10);
 ?>
