--
-- Table structure for table `PatientDeviceIdentifier`
--
CREATE TABLE `PatientDeviceIdentifier` (
  `PatientDeviceIdentifierSerNum` int(11) NOT NULL AUTO_INCREMENT,
  `PatientSerNum` int(11) NOT NULL,
  `DeviceId` varchar(255) NOT NULL,
  `RegistrationId` varchar(255) NOT NULL DEFAULT '',
  `DeviceType` tinyint(4) NOT NULL,
  `SessionId` text NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PatientDeviceIdentifierSerNum`),
  UNIQUE KEY `unique_patient_deviceId` (`DeviceId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Table structure for table `PushNotification`
--
CREATE TABLE `PushNotification` (
  `PushNotificationSerNum` int(11) NOT NULL AUTO_INCREMENT,
  `PatientDeviceIdentifierSerNum` int(11) DEFAULT NULL,
  `NotificationSerNum` int(11) NOT NULL,
  `DateAdded` datetime NOT NULL,
  `SendStatus` tinyint(3) NOT NULL,
  `SendLog` int(11) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PushNotificationSerNum`),
  UNIQUE KEY `notification_index` (`NotificationSerNum`,`PatientDeviceIdentifierSerNum`),
  KEY `PatientDeviceIdentifierSerNum` (`PatientDeviceIdentifierSerNum`),
  KEY `NotificationControlSerNum` (`NotificationSerNum`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=latin1;