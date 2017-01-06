<?php
include "config.php";
// Server file

class PushNotifications {
	// (Android)API access key from Google API's Console.
	private static $api_key = API_KEY ;
	// (iOS) Private key's passphrase.
	private static $passphrase = CERTIFICATE_PASSWORD;
	//(iOS) Location of certificate file
	private static $certificate_file = CERTIFICATE_FILE;

	
	// Change the above three vriables as per your app.
	public function __construct() {
		exit('Init function is not allowed');
	}
	
        // Sends Push notification for Android users

	/**
	*	(android($data, $reg_id)) Consumes an array with message
	*	to be sent and a registration id.
	*	Description: Creates curl request to FCM (Firebase Cloud Messaging) and sends
	*                push notification to android device
	*   Requires: $data must contain mtitle, and mdesc for the 
	*             push notification.
	**/
	public function android($data, $reg_id) {
	        $url = 'https://fcm.googleapis.com/fcm/send';
	        $message = array(
	            'title'         => $data['mtitle'],
	            'message'       => $data['mdesc'],
                'style'         => 'inbox',
                'summaryText'   => 'There are %n% notifications'
	        );
	        
	        $headers = array(
	        	'Authorization: key=' .self::$api_key,
	        	'Content-Type: application/json'
	        );
	        $fields = array(
	            'registration_ids' => array($reg_id),
	            'data' => $message,
	        );
			$response = self::useCurl($url, $headers, json_encode($fields));
			$response = json_decode($response,true);

			$data = array();
			$data["success"] = $response["success"];
			$data["failure"] = $response["failure"];
			if($response["success"]==0)
			{
				$data["error"]=$response["results"][0]["error"];
			}
	    	return $data;
    	}
		
    /**
	*	(iOS($data, $devicetoken)) Consumes an array with message
	*	to be sent and a registration id.
	*	Description: Creates a connection to APN (Apple Push Notification
	*              socket and sends push notification to android device              
	*   Requires: $data must contain mtitle, and mdesc for the 
	*             push notification.
	**/
	public function iOS($data, $devicetoken) {
		$deviceToken = $devicetoken;
		$ctx = stream_context_create();
		// ck.pem is your certificate file
		stream_context_set_option($ctx, 'ssl', 'local_cert', self::$certificate_file);
		stream_context_set_option($ctx, 'ssl', 'passphrase', self::$passphrase);
		// Open a connection to the APNS server
		$fp = stream_socket_client(
			'ssl://gateway.sandbox.push.apple.com:2195', $err,
			$errstr, 60, STREAM_CLIENT_CONNECT|STREAM_CLIENT_PERSISTENT, $ctx);
		if (!$fp)
		{
			
			$response = array("success"=>0,"failure"=>1,"error"=>"Failed to connect: $err $errstr" . PHP_EOL);
			return $response;
		}
			
		// Create the payload body
		$body['aps'] = array(
			'alert' => array(
			    'title' => $data['mtitle'],
                'body' => $data['mdesc'],
			 ),
			'sound' => 'default'
		);
		// Encode the payload as JSON
		$payload = json_encode($body);
		// Build the binary notification
		$msg = chr(0) . pack('n', 32) . pack('H*', $deviceToken) . pack('n', strlen($payload)) . $payload;
		// Send it to the server
		$result = fwrite($fp, $msg, strlen($msg));
		// Close the connection to the server
		fclose($fp);
		if (!$result)
			$response =  array("success"=>0,"failure"=>1,"error"=>"Unable to send packets to APN socket");
		else{
			$response =  array("success"=>1,"failure"=>0);
		}
		return $response;
		}
	
	// Curl 
	private function useCurl($url, $headers, $fields = null) {
	        // Open connection
	        $ch = curl_init();
	        if ($url) {
	            // Set the url, number of POST vars, POST data
	            curl_setopt($ch, CURLOPT_URL, $url);
	            curl_setopt($ch, CURLOPT_POST, true);
	            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	     
	            // Disabling SSL Certificate support temporarly
	            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	            if ($fields) {
	                curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
	            }
	     
	            // Execute post
	            $result = curl_exec($ch);
	            if ($result === FALSE) {
					$result = "{\"Success\":0,\"Failure\":1,\"Error\":\"Connection to Google servers failed\"}";
	                die('Curl failed: ' . curl_error($ch));
	            }
	     
	            // Close connection
				 curl_close($ch);
	            return $result;
        }
    }
}
?>
