<?php
    require_once('PushNotifications.php');
    $data = array(
        "mtitle"=>"heelo",
        "mdesc"=>"world"
    );
    $response = PushNotifications::iOS($data,"1e9ff2c65087659df2efdfbf961eac2be47adddb34bdf2a187e30ff6bec21305");
   ?>