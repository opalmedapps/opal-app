<?php

/**
 * Notification class
 *
 */
class Notification {

    /**
     *
     * Gets a list of existing notifications
     *
     * @return array
     */    
    public function getNotifications() {
        $notificationList = array();
        try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                SELECT DISTINCT
                    nt.NotificationControlSerNum,
                    nt.Name_EN,
                    nt.Name_FR,
                    nt.Description_EN,
                    nt.Description_FR,
                    nt.NotificationType
                FROM
                    NotificationControl nt
            ";
		    $query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
            
                $serial             = $data[0];
                $name_EN            = $data[1];
                $name_FR            = $data[2];
                $description_EN     = $data[3];
                $description_FR     = $data[4];
                $type               = $data[5];

                $notificationArray = array(
                    'serial'            => $serial,
                    'name_EN'           => $name_EN,
                    'name_FR'           => $name_FR,
                    'description_EN'    => $description_EN,
                    'description_FR'    => $description_FR,
                    'type'              => $type
                );

                array_push($notificationList, $notificationArray);
            }

            return $notificationList;
        } catch (PDOException $e) {
			echo $e->getMessage();
			return $notificationList;
		}
	}

    /**
     *
     * Gets details of a particular notification 
     *
     * @param integer $serial : the notification serial number
     * @return array
     */        
    public function getNotificationDetails ($serial) {
        $notificationDetails = array();
        try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                SELECT DISTINCT
                    nt.Name_EN,
                    nt.Name_FR,
                    nt.Description_EN,
                    nt.Description_FR,
                    nt.NotificationType
                FROM
                    NotificationControl nt
                WHERE
                    nt.NotificationControlSerNum = $serial
            ";

	        $query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			$data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT);

            $name_EN            = $data[0];
            $name_FR            = $data[1];
            $description_EN     = $data[2];
            $description_FR     = $data[3];
            $type               = $data[4];

            $notificationDetails = array(
                'serial'            => $serial,
                'name_EN'           => $name_EN,
                'name_FR'           => $name_FR,
                'description_EN'    => $description_EN,
                'description_FR'    => $description_FR,
                'type'              => $type
            );

            return $notificationDetails;
        } catch (PDOException $e) {
			echo $e->getMessage();
			return $notificationDetails;
		}
	}

    /**
     *
     * Gets the types of notifications from the database
     *
     * @return array
     */        
    public function getNotificationTypes () {
        $types = array();
	    try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                SELECT DISTINCT
                    ntt.NotificationTypeName,
                    ntt.NotificationTypeId
                FROM
                    NotificationTypes ntt
                LEFT JOIN NotificationControl nt
                ON nt.NotificationType = ntt.NotificationTypeId
                WHERE
                    nt.NotificationType IS NULL
            ";
		    $query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
                $typeArray = array(
                    'name'  => $data[0],
                    'id'    => $data[1]
                );

                array_push($types, $typeArray);
            }

            return $types;
        } catch (PDOException $e) {
			echo $e->getMessage();
			return $types;
		}
	}

     /**
     *
     * Inserts a notification into the database
     *
     * @param array $notification : the notification details
     */       
    public function insertNotification($notification) {

        $name_EN            = $notification['name_EN'];
        $name_FR            = $notification['name_FR'];
        $description_EN     = $notification['description_EN'];
        $description_FR     = $notification['description_FR'];
        $type               = $notification['type'];

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                INSERT INTO
                    NotificationControl (
                        Name_EN,
                        Name_FR,
                        Description_EN,
                        Description_FR,
                        NotificationType,
                        DateAdded
                    )
                VALUES (
                    \"$name_EN\",
                    \"$name_FR\",
                    \"$description_EN\",
                    \"$description_FR\",
                    '$type',
                    NOW()
                )
            ";
            $query = $connect->prepare( $sql );
			$query->execute();
        } catch( PDOException $e) {
			return $e->getMessage();
		}

    }

    /**
     *
     * Updates the notification in the database
     *
     * @param array $notification : the notification details
     * @return array : response
     */        
    public function updateNotification($notification) {

        $name_EN            = $notification['name_EN'];
        $name_FR            = $notification['name_FR'];
        $description_EN     = $notification['description_EN'];
        $description_FR     = $notification['description_FR'];
        $serial             = $notification['serial'];

        $response = array(
            'value'     => 0,
            'message'   => ''
        );

        try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                UPDATE
                    NotificationControl
                SET
                    NotificationControl.Name_EN            = \"$name_EN\",
                    NotificationControl.Name_FR            = \"$name_FR\",
                    NotificationControl.Description_EN     = \"$description_EN\",
                    NotificationControl.Description_FR     = \"$description_FR\"
                WHERE
                    NotificationControl.NotificationControlSerNum = $serial
            ";

	        $query = $connect->prepare( $sql );
            $query->execute();

            $response['value'] = 1;
            return $response;

	    } catch( PDOException $e) {
		    $response['message'] = $e->getMessage();
			return $response;
		}
	}

    /**
     *
     * Removes a notification from the database
     *
     * @param integer $serial : the notification serial number
     * @return array : response
     */        
    public function removeNotification($serial) {

        $response = array(
            'value'     => 0,
            'message'   => ''
        );

        try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                DELETE FROM 
                    NotificationControl
                WHHERE
                    NotificationControl.NotificationControlSerNum = $serial
            ";
            $query = $connect->prepare( $sql );
            $query->execute();

            $response['value'] = 1;
            return $response;

        } catch( PDOException $e) {
		    $response['message'] = $e->getMessage();
			return $response;
		}
	}

}

?>
