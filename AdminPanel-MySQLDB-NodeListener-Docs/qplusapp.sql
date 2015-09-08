-- phpMyAdmin SQL Dump
-- version 4.3.11
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Sep 09, 2015 at 12:01 AM
-- Server version: 5.6.24
-- PHP Version: 5.6.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `qplusapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE IF NOT EXISTS `admin` (
  `AdminSerNum` int(11) NOT NULL,
  `ResourceSerNum` int(11) NOT NULL,
  `FirstName` text NOT NULL,
  `LastName` text NOT NULL,
  `Username` text NOT NULL,
  `Password` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`AdminSerNum`, `ResourceSerNum`, `FirstName`, `LastName`, `Username`, `Password`) VALUES
(2, 14, 'Test', 'Admin', 'man', 'lool'),
(3, 15, 'Test', 'Admin', 'woman', 'lololol'),
(4, 16, 'Teist', 'admoon', 'weoman', 'lololol'),
(5, 17, 'Teist', 'atkinson', 'roan', 'lololol');

-- --------------------------------------------------------

--
-- Table structure for table `alias`
--

CREATE TABLE IF NOT EXISTS `alias` (
  `AliasSerNum` int(11) NOT NULL,
  `AliasType` varchar(25) NOT NULL,
  `AliasName_FR` varchar(100) NOT NULL,
  `AliasName_EN` varchar(100) NOT NULL,
  `AliasDescription_FR` varchar(250) NOT NULL,
  `AliasDescription_EN` varchar(250) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `alias`
--

INSERT INTO `alias` (`AliasSerNum`, `AliasType`, `AliasName_FR`, `AliasName_EN`, `AliasDescription_FR`, `AliasDescription_EN`, `LastUpdated`) VALUES
(1, 'Appointment', 'Consultation', 'Consult', 'Description pour la consultation', 'Description for consult', '2015-08-10 16:53:49');

-- --------------------------------------------------------

--
-- Table structure for table `aliasexpression`
--

CREATE TABLE IF NOT EXISTS `aliasexpression` (
  `AliasExpressionSerNum` int(11) NOT NULL,
  `AliasSerNum` int(11) NOT NULL DEFAULT '0',
  `ExpressionName` varchar(250) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `aliasexpression`
--

INSERT INTO `aliasexpression` (`AliasExpressionSerNum`, `AliasSerNum`, `ExpressionName`, `LastUpdated`) VALUES
(1, 1, 'Consult  N-O', '2015-08-10 16:54:32'),
(2, 1, 'Consult  R-I', '2015-08-10 16:54:54'),
(3, 0, 'CONSULT REFERRAL RECEIVED - MUHC', '2015-08-11 13:40:31'),
(4, 0, 'MEDICALLY READY PALLIATIVE', '2015-08-11 13:40:31'),
(5, 0, 'SGAS_P3', '2015-08-11 13:40:31'),
(6, 0, 'BOOK CT SIM', '2015-08-11 13:40:31'),
(7, 0, 'PATIENT INFORMATION', '2015-08-11 13:40:31'),
(8, 0, 'READY FOR CONTOUR', '2015-08-11 13:40:31'),
(9, 0, 'READY FOR MD CONTOUR', '2015-08-11 13:41:11'),
(10, 0, 'READY FOR DOSE CALCULATION', '2015-08-11 13:41:11'),
(11, 0, 'CALL PATIENT', '2015-08-11 13:41:11'),
(12, 0, 'READY FOR DOSI QA', '2015-08-11 13:41:11'),
(13, 0, 'TX_3D (PLAN)', '2015-08-11 13:41:11'),
(14, 0, 'READY FOR PHYSICS QA', '2015-08-11 13:41:11'),
(15, 0, 'READY FOR TREATMENT', '2015-08-11 13:41:11'),
(16, 0, 'END OF TREATMENT NOTE', '2015-08-11 13:41:11'),
(17, 0, 'PMR PALLIATIVE', '2015-08-11 13:41:11'),
(18, 0, 'INTRA TREAT NOTE', '2015-08-11 13:41:11'),
(19, 0, 'CLOSE CHART', '2015-08-11 13:41:11'),
(20, 0, 'CONSULT NEW OUT', '2015-08-11 13:41:11'),
(21, 0, '.EBM-Iso Shift', '2015-08-11 13:43:57'),
(22, 0, '.EBP-Daily Rx', '2015-08-11 13:43:57'),
(23, 0, '.EBP-Last Rx', '2015-08-11 13:43:57'),
(24, 0, 'CT Sim (TASKED)', '2015-08-11 13:43:57'),
(25, 0, '.EBP-New Start', '2015-08-11 13:43:57'),
(26, 0, '.EBC-Daily Rx', '2015-08-11 13:43:57'),
(27, 0, 'INTRA TREAT OUT', '2015-08-11 13:43:57'),
(28, 0, 'RAD ONC REQUISTION                      ', '2015-08-11 13:43:57'),
(29, 0, 'RADIOTHERAPY PRESCRIPTION               ', '2015-08-11 13:43:57'),
(30, 0, 'Planning note                           ', '2015-08-11 13:43:57'),
(31, 0, 'Consult                                 ', '2015-08-11 13:43:57'),
(32, 0, 'PMR note                                ', '2015-08-11 13:43:57');

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE IF NOT EXISTS `appointment` (
  `AppointmentSerNum` int(11) NOT NULL,
  `AliasExpressionSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `AppointmentAriaSer` int(11) NOT NULL,
  `ScheduledStartTime` datetime NOT NULL,
  `ScheduledEndTime` datetime NOT NULL,
  `Location` text NOT NULL,
  `Checkin` tinyint(1) NOT NULL,
  `ChangeRequest` tinyint(1) NOT NULL,
  `ResourceSerNum` int(10) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `appointment`
--

INSERT INTO `appointment` (`AppointmentSerNum`, `AliasExpressionSerNum`, `PatientSerNum`, `AppointmentAriaSer`, `ScheduledStartTime`, `ScheduledEndTime`, `Location`, `Checkin`, `ChangeRequest`, `ResourceSerNum`, `LastUpdated`) VALUES
(1, 2, 47, 717771, '2008-10-29 15:30:00', '2008-10-29 15:45:00', 'L1, General Hospital', 0, 1, 2, '2015-08-18 17:48:04'),
(2, 1, 50, 669033, '2008-06-16 15:30:00', '2008-06-16 16:00:00', 'L1, General Hospital', 0, 0, 1, '2015-08-12 21:20:38'),
(3, 20, 51, 1369580, '2015-08-05 13:00:00', '2015-08-05 13:10:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56'),
(4, 21, 51, 1373255, '2015-08-14 13:15:00', '2015-08-15 13:45:00', 'L1, General Hospital', 1, 0, 4, '2015-08-14 16:12:55'),
(5, 22, 51, 1373256, '2015-08-21 09:15:00', '2015-08-21 09:30:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56'),
(6, 22, 51, 1373257, '2015-08-22 08:30:00', '2015-08-22 08:45:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56'),
(7, 22, 51, 1373258, '2015-08-25 09:00:00', '2015-08-25 09:15:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56'),
(8, 22, 51, 1373259, '2015-08-26 09:00:00', '2015-08-26 09:15:00', 'L1, General Hospital', 0, 1, 4, '2015-08-25 18:58:08'),
(9, 22, 51, 1373260, '2015-08-27 09:15:00', '2015-08-27 09:30:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56'),
(10, 22, 51, 1373261, '2015-08-28 18:15:00', '2015-08-28 18:45:00', 'L1, General Hospital', 0, 0, 4, '2015-08-27 22:30:43'),
(11, 22, 51, 1373262, '2015-08-29 09:30:00', '2015-08-29 09:45:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56'),
(12, 23, 51, 1373263, '2015-09-03 09:30:00', '2015-09-03 09:45:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56'),
(13, 24, 51, 1373467, '2015-08-25 18:00:00', '2015-08-25 18:30:00', 'L1, General Hospital', 1, 0, 4, '2015-08-25 19:29:52'),
(14, 25, 51, 1378084, '2015-08-26 04:00:00', '2015-08-26 04:00:00', 'L1, General Hospital', 0, 1, 4, '2015-08-25 19:00:53'),
(15, 26, 51, 1378088, '2015-09-02 09:30:00', '2015-09-02 09:45:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56'),
(16, 27, 51, 1379924, '2015-08-25 09:13:00', '2015-08-25 09:23:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56'),
(17, 27, 51, 1381999, '2015-09-03 09:18:00', '2015-09-03 09:28:00', 'L1, General Hospital', 0, 0, 4, '2015-08-12 21:28:56');

-- --------------------------------------------------------

--
-- Table structure for table `appointmentchangerequests`
--

CREATE TABLE IF NOT EXISTS `appointmentchangerequests` (
  `RequestSerNum` int(11) NOT NULL,
  `IsProcessed` tinyint(1) NOT NULL,
  `AppointmentSerNum` int(11) NOT NULL,
  `PreferredStartDate` datetime NOT NULL,
  `PreferredEndDate` datetime NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `TimeOfDay` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `appointmentchangerequests`
--

INSERT INTO `appointmentchangerequests` (`RequestSerNum`, `IsProcessed`, `AppointmentSerNum`, `PreferredStartDate`, `PreferredEndDate`, `PatientSerNum`, `TimeOfDay`) VALUES
(2, 0, 16, '2015-08-29 00:00:00', '2015-08-30 00:00:00', 51, 'morning'),
(3, 0, 4, '2015-08-20 04:14:00', '2015-08-20 05:16:00', 51, 'afternoon');

-- --------------------------------------------------------

--
-- Table structure for table `diagnosis`
--

CREATE TABLE IF NOT EXISTS `diagnosis` (
  `DiagnosisSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `DiagnosisAriaSer` varchar(32) NOT NULL,
  `CreationDate` datetime NOT NULL,
  `Description_EN` varchar(200) NOT NULL,
  `Description_FR` text NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `diagnosis`
--

INSERT INTO `diagnosis` (`DiagnosisSerNum`, `PatientSerNum`, `DiagnosisAriaSer`, `CreationDate`, `Description_EN`, `Description_FR`, `LastUpdated`) VALUES
(1, 50, '13956', '2011-05-01 00:00:00', 'Ca of central portion of breast', '', '2015-08-10 17:00:15'),
(2, 49, '191', '2003-09-02 00:00:00', 'Stomach, NOS', '', '2015-08-10 17:00:46'),
(3, 47, '13238', '2005-12-01 00:00:00', 'Upper lobe, lung', '', '2015-08-10 17:01:08'),
(4, 51, '23314', '2010-12-20 00:00:00', 'Ca of parotid gland', '', '2015-08-11 13:24:29');

-- --------------------------------------------------------

--
-- Table structure for table `doctor`
--

CREATE TABLE IF NOT EXISTS `doctor` (
  `DoctorSerNum` int(11) NOT NULL,
  `ResourceSerNum` int(11) NOT NULL,
  `DoctorAriaSer` int(11) NOT NULL,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `Email` text,
  `Phone` int(11) DEFAULT NULL,
  `LoginID` text NOT NULL,
  `Address` text,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `doctor`
--

INSERT INTO `doctor` (`DoctorSerNum`, `ResourceSerNum`, `DoctorAriaSer`, `FirstName`, `LastName`, `Email`, `Phone`, `LoginID`, `Address`, `LastUpdated`) VALUES
(2, 1, 36, 'Doctor', 'Test', 'doctoremail@gmail.com', 444888333, '', 'L1 , Radiation oncology', '2015-08-27 17:06:35'),
(4, 2, 5631, 'Tarek', 'Hijal', 'doctoremail@gmail.com', NULL, '', 'L2 , Radiation Oncology', '2015-08-27 17:05:45'),
(5, 5, 5280, 'Doctor', 'Test', 'doctoremail@gmail.com', 222333444, '', 'M7, Cancer center', '2015-08-27 22:29:25'),
(6, 6, 5677, 'Dr. Test', 'Smith', 'doctoremail@gmail.com', 444333233, '', 'M3 , Cancer Center', '2015-08-27 17:06:11'),
(7, 7, 6699, 'Dr. Test', 'House', 'doctoremail@gmail.com', 555666777, '', 'M2 , Cancer Center', '2015-08-27 17:06:18'),
(8, 8, 7155, 'MGH', 'Medical Records', 'doctoremail@gmail.com', NULL, '', 'M1 , Cancer Center', '2015-08-12 20:05:56'),
(9, 9, 7156, 'RVH', 'Medical Records', 'doctoremail@gmail.com', 444888333, '', 'L5, Medical Physics', '2015-08-12 20:05:56');

-- --------------------------------------------------------

--
-- Table structure for table `document`
--

CREATE TABLE IF NOT EXISTS `document` (
  `DocumentSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `DocumentId` varchar(100) NOT NULL,
  `AliasExpressionSerNum` int(11) NOT NULL,
  `Revised` varchar(5) NOT NULL,
  `ValidEntry` varchar(5) NOT NULL,
  `ErrorReasonText` text NOT NULL,
  `OriginalFileName` varchar(500) NOT NULL,
  `FinalFileName` varchar(500) NOT NULL,
  `TransferStatus` varchar(10) NOT NULL,
  `TransferLog` varchar(1000) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `document`
--

INSERT INTO `document` (`DocumentSerNum`, `PatientSerNum`, `DocumentId`, `AliasExpressionSerNum`, `Revised`, `ValidEntry`, `ErrorReasonText`, `OriginalFileName`, `FinalFileName`, `TransferStatus`, `TransferLog`, `LastUpdated`) VALUES
(1, 51, '9607000000000003706935', 28, '', 'Y', '', '553660.doc', '553660.doc', '', '', '2015-08-11 13:43:57'),
(2, 51, '96070000000000037069911', 29, '', 'Y', '', '555845.doc', '555845.doc', '', '', '2015-08-11 13:43:57'),
(3, 51, '96070000000000037069912', 30, '', 'Y', '', '555848.doc', '555848.doc', '', '', '2015-08-11 13:43:57'),
(4, 51, '960700000000000370691013', 31, '', 'Y', '', '555986.doc', '555986.doc', '', '', '2015-08-11 13:43:57'),
(5, 51, '960700000000000370691418', 32, '', 'Y', '', '558867.doc', '558867.doc', '', '', '2015-08-11 13:43:57'),
(6, 51, '960700000000000370691519', 16, '', 'Y', '', '560535.doc', '560535.doc', '', '', '2015-08-11 13:43:57');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE IF NOT EXISTS `feedback` (
  `FeedbackSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `FeedbackContent` text NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`FeedbackSerNum`, `PatientSerNum`, `FeedbackContent`, `LastUpdated`) VALUES
(1, 51, 'This is a really good app.', '2015-09-03 20:43:16'),
(2, 50, 'this is not good at all!', '2015-09-03 20:43:16');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE IF NOT EXISTS `messages` (
  `MessageSerNum` int(11) NOT NULL,
  `SenderRole` enum('Doctor','Patient','Admin') NOT NULL,
  `ReceiverRole` set('Patient','Doctor','Admin') NOT NULL,
  `SenderSerNum` int(10) unsigned NOT NULL COMMENT 'Sender''s SerNum',
  `ReceiverSerNum` int(11) unsigned NOT NULL COMMENT 'Recipient''s SerNum',
  `MessageContent` varchar(255) NOT NULL,
  `Attachment` text NOT NULL,
  `ReceiverReadStatus` tinyint(1) NOT NULL,
  `MessageDate` datetime NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`MessageSerNum`, `SenderRole`, `ReceiverRole`, `SenderSerNum`, `ReceiverSerNum`, `MessageContent`, `Attachment`, `ReceiverReadStatus`, `MessageDate`, `LastUpdated`) VALUES
(1, 'Patient', 'Doctor', 51, 4, ' Hi, I just installed the app !', '', 0, '2015-08-11 00:00:00', '2015-08-13 22:05:40'),
(2, 'Doctor', 'Patient', 4, 51, 'Very good. Our communication will be much faster now that you have the app.', '', 0, '2015-08-12 00:00:00', '2015-08-27 17:04:41'),
(4, 'Patient', 'Doctor', 51, 4, 'I look forward to it.I have pain in my back. Should I take more pills for it ?', '', 0, '2015-08-14 00:00:00', '2015-08-27 17:05:03'),
(15, 'Patient', 'Doctor', 51, 5, 'Yey!', '', 1, '2015-08-18 00:00:00', '2015-08-14 16:25:40'),
(16, 'Doctor', 'Patient', 5, 51, 'asdas', '', 1, '2015-08-13 15:11:06', '2015-08-25 19:41:58'),
(17, 'Patient', 'Doctor', 51, 5, 'Yey', '', 1, '2015-08-13 15:12:58', '2015-08-14 16:25:40'),
(18, 'Doctor', 'Patient', 5, 51, 'Yey!', '', 1, '2015-08-19 00:00:00', '2015-08-25 19:41:58'),
(19, 'Patient', 'Doctor', 51, 5, 'asdas', '', 1, '2015-08-13 15:11:06', '2015-08-14 16:25:40'),
(20, 'Patient', 'Doctor', 51, 5, 'Yey', '', 1, '2015-08-13 15:12:58', '2015-08-14 16:25:40'),
(21, 'Patient', 'Doctor', 51, 6, 'Hey!', '', 0, '2015-08-13 15:47:47', '2015-08-13 22:05:39'),
(22, 'Patient', 'Doctor', 51, 7, 'Hello', '', 0, '2015-08-13 15:48:25', '2015-08-13 22:05:22'),
(23, 'Patient', 'Doctor', 51, 7, 'Hey!', '', 0, '2015-08-13 17:08:06', '2015-08-13 22:05:22'),
(25, 'Patient', 'Doctor', 51, 7, 'asdas', '', 0, '2015-08-13 18:08:55', '2015-08-13 22:10:13'),
(26, 'Patient', 'Doctor', 51, 4, 'ZXZ', '', 0, '2015-08-13 18:10:13', '2015-08-13 22:10:05'),
(27, 'Patient', 'Doctor', 51, 8, 'hhhjhjh', '', 0, '2015-08-13 18:11:33', '2015-08-13 22:11:25'),
(28, 'Patient', 'Doctor', 51, 8, 'asdas', '', 0, '2015-08-13 18:12:25', '2015-08-13 22:12:17'),
(29, 'Patient', 'Doctor', 51, 8, 'Mehryar', '', 0, '2015-08-13 18:13:42', '2015-08-13 22:13:33'),
(30, 'Patient', 'Doctor', 51, 8, 'David', '', 0, '2015-08-13 18:14:44', '2015-08-13 22:14:36'),
(31, 'Patient', 'Doctor', 51, 8, 'Andrew', '', 0, '2015-08-13 18:16:02', '2015-08-13 22:15:53'),
(32, 'Patient', 'Doctor', 51, 8, 'Adesw', '', 1, '2015-08-13 18:17:54', '2015-08-13 22:24:46'),
(33, 'Patient', 'Doctor', 51, 4, 'Too bad, I am a bad doctor, do not crash though', '', 1, '2015-08-13 18:30:09', '2015-08-13 22:30:01'),
(35, 'Patient', 'Doctor', 51, 5, 'Boom!', '', 1, '2015-08-14 12:14:56', '2015-08-14 16:25:40'),
(36, 'Patient', 'Doctor', 51, 9, 'Thats the one!', '', 0, '2015-08-14 12:27:29', '2015-08-14 16:27:21'),
(37, 'Patient', 'Doctor', 51, 9, 'yep', '', 0, '2015-08-14 12:27:49', '2015-08-14 16:27:41'),
(38, 'Patient', 'Doctor', 51, 8, 'Tootsie', '', 0, '2015-08-14 12:37:21', '2015-08-14 16:37:13'),
(46, 'Patient', 'Doctor', 51, 5, '', '', 0, '2015-08-25 15:56:40', '2015-08-25 19:56:30'),
(48, 'Patient', 'Doctor', 51, 5, 'asds', '', 0, '2015-08-25 15:59:49', '2015-08-25 19:59:39'),
(49, 'Patient', 'Doctor', 51, 5, '', '', 0, '2015-08-25 16:01:00', '2015-08-25 20:00:50'),
(51, 'Doctor', 'Patient', 4, 51, 'It''s normal. If the pain continues for longer than a week we will arrange a visit. Please send me your latest CT scan images.', '', 0, '2015-08-27 00:00:00', '2015-08-27 17:03:33'),
(52, 'Patient', 'Doctor', 51, 4, 'OK Thanks. My appointment CT imaging appointment is tomorrow. I will send the documents when I receive them.', '', 0, '2015-08-28 00:00:00', '2015-08-27 17:03:33'),
(53, 'Patient', 'Doctor', 51, 5, 'Messi', '', 0, '2015-08-26 20:33:47', '2015-08-27 17:17:19'),
(54, 'Patient', 'Doctor', 51, 5, 'aSa', '', 0, '2015-08-26 20:33:57', '2015-08-27 17:17:19'),
(55, 'Patient', 'Doctor', 51, 5, '', '', 0, '2015-08-26 20:34:08', '2015-08-27 17:17:19'),
(56, 'Patient', 'Doctor', 51, 4, 'Yea', '', 0, '2015-08-26 20:38:06', '2015-08-27 17:17:19'),
(57, 'Patient', 'Doctor', 51, 4, '', '', 0, '2015-08-26 20:38:15', '2015-08-27 17:17:19'),
(58, 'Patient', 'Doctor', 51, 4, 'Andrew Martin', '', 0, '2015-08-26 20:38:28', '2015-08-27 17:17:19'),
(59, 'Patient', 'Doctor', 51, 4, 'Messi', '', 0, '2015-08-26 20:38:33', '2015-08-27 17:17:19'),
(60, 'Patient', 'Doctor', 51, 4, 'sjkasdhas', '', 0, '2015-08-26 20:40:45', '2015-08-27 17:17:19'),
(61, 'Patient', 'Doctor', 51, 4, '', '', 0, '2015-08-26 20:40:52', '2015-08-27 17:17:19'),
(62, 'Patient', 'Doctor', 51, 4, '', '', 0, '2015-08-26 20:41:06', '2015-08-27 17:17:19'),
(63, 'Patient', 'Doctor', 51, 4, '', '', 0, '2015-08-27 12:57:00', '2015-08-27 17:17:19'),
(64, 'Patient', 'Doctor', 51, 4, '', '', 0, '2015-08-27 14:50:01', '2015-08-27 18:49:48'),
(65, 'Patient', 'Doctor', 51, 5, '', '', 0, '2015-08-27 18:39:50', '2015-08-27 22:39:50'),
(66, 'Patient', 'Doctor', 51, 6, '', '', 0, '2015-08-27 18:40:13', '2015-08-27 22:40:14'),
(67, 'Patient', 'Admin', 51, 2, 'How are you admin ?', '', 0, '2015-08-26 07:00:00', '2015-09-02 16:30:16'),
(68, 'Admin', 'Patient', 2, 51, 'Im fine how about you?', '', 0, '2015-08-26 05:00:00', '2015-09-02 16:30:19'),
(69, 'Patient', 'Admin', 50, 2, 'HOOOOOOOOHOOO', '', 0, '2015-08-14 00:00:00', '2015-09-02 18:13:45'),
(70, 'Patient', 'Admin', 49, 2, 'sssssssssssss', '', 0, '2015-08-31 00:00:00', '2015-09-02 18:13:45'),
(73, 'Admin', 'Patient', 2, 50, 'hi', 'No', 0, '2015-09-05 14:06:17', '2015-09-05 18:06:17'),
(74, 'Admin', 'Patient', 2, 50, 'hi', 'No', 0, '2015-09-05 14:06:42', '2015-09-05 18:06:42'),
(75, 'Admin', 'Patient', 2, 50, 'hello', 'No', 0, '2015-09-05 14:07:31', '2015-09-05 18:07:31'),
(76, 'Admin', 'Patient', 2, 50, 'how are you today ?', 'No', 1, '2015-09-05 14:07:43', '2015-09-06 16:34:05'),
(77, 'Admin', 'Patient', 2, 51, 'hey do you hear me ????', 'No', 1, '2015-09-05 14:13:48', '2015-09-06 16:34:01'),
(78, 'Admin', 'Patient', 2, 52, 'HAHA finally found you', 'No', 0, '2015-09-05 14:15:13', '2015-09-05 18:15:13'),
(79, 'Admin', 'Patient', 2, 51, 'a file', 'PatientFiles/51/Attachments/message-read.png', 0, '2015-09-06 20:42:16', '2015-09-07 00:42:16'),
(85, 'Admin', 'Patient', 0, 0, '2', 'PatientFiles/"/Attachments/FinalLogo.png', 0, '2015-09-06 21:22:32', '2015-09-07 01:22:32'),
(86, 'Admin', 'Patient', 0, 0, '2', 'PatientFiles/"/Attachments/MUHC-Logo.png', 0, '2015-09-06 21:25:23', '2015-09-07 01:25:23'),
(87, 'Admin', 'Patient', 0, 0, '2', 'PatientFiles/"/Attachments/MUHC-Logo.png', 0, '2015-09-06 21:27:24', '2015-09-07 01:27:24'),
(88, 'Admin', 'Patient', 2, 51, 'jjj', 'PatientFiles/51/Attachments/FinalLogo.png', 0, '2015-09-06 21:38:44', '2015-09-07 01:38:44'),
(89, 'Admin', 'Patient', 2, 51, 'ss', 'PatientFiles/51/Attachments/MUHC-Logo.png', 0, '2015-09-06 22:17:09', '2015-09-07 02:17:09'),
(90, 'Admin', 'Patient', 2, 51, ' ', 'PatientFiles/51/Attachments/userlogo.jpg', 0, '2015-09-06 22:27:39', '2015-09-07 02:27:39'),
(91, 'Admin', 'Patient', 2, 51, ' ', 'PatientFiles/51/Attachments/FinalLogo.png', 0, '2015-09-06 22:36:03', '2015-09-07 02:36:03'),
(92, 'Admin', 'Patient', 2, 52, ' ', 'PatientFiles/52/Attachments/MUHC-2012.jpg', 0, '2015-09-06 22:47:16', '2015-09-07 02:47:16'),
(93, 'Admin', 'Patient', 2, 49, ' ', 'PatientFiles/49/Attachments/userlogo.jpg', 0, '2015-09-06 22:48:20', '2015-09-07 02:48:20'),
(94, 'Admin', 'Patient', 2, 51, ' ', 'PatientFiles/51/Attachments/FinalLogo.png', 0, '2015-09-06 22:51:22', '2015-09-07 02:51:22');

-- --------------------------------------------------------

--
-- Table structure for table `patient`
--

CREATE TABLE IF NOT EXISTS `patient` (
  `PatientSerNum` int(11) NOT NULL,
  `PatientAriaSer` int(11) NOT NULL,
  `PatientId` varchar(50) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Alias` text NOT NULL,
  `TelNumForSMS` bigint(11) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `Language` enum('EN','FR','SN') NOT NULL,
  `LoginID` text NOT NULL,
  `Password` text NOT NULL,
  `SSN` text NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `EnableSMS` tinyint(1) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `patient`
--

INSERT INTO `patient` (`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `Alias`, `TelNumForSMS`, `Email`, `Language`, `LoginID`, `Password`, `SSN`, `LastUpdated`, `EnableSMS`) VALUES
(49, 0, '3323', 'testfirstname', 'testlastname', '', 1234567890, 'wtv@wtv.com', '', 'simplelogin:14', '', '', '0000-00-00 00:00:00', 0),
(50, 0, '9923', 'Fred', 'Flinstone', '', 5144758943, 'jkildea@gmail.com', '', 'simplelogin:16', 'hashinghash', '', '0000-00-00 00:00:00', 0),
(51, 43570, '3333', 'Test', 'patient', '', 4389957878, 'david.herrera@mail.mcgill.ca', 'FR', 'simplelogin:17', '12345', 'Tepat13141516', '2015-08-11 13:07:30', 1),
(52, 112233, '2784', 'Test Patient', 'Patient', 'Hello', 4356787654, 'testest@gmail.com', 'EN', 'simplelogin:16', '12345', '', '2015-08-12 18:44:23', 1);

-- --------------------------------------------------------

--
-- Table structure for table `patientactivitylog`
--

CREATE TABLE IF NOT EXISTS `patientactivitylog` (
  `ActivitySerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `ActivityType` text NOT NULL,
  `ActivityDescription` varchar(255) NOT NULL COMMENT 'This will have information about the previous and current values of fields',
  `ActivityDateTime` datetime NOT NULL COMMENT 'The description of each field will obtain past and new values for account changes and appointment changes',
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=584 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `patientactivitylog`
--

INSERT INTO `patientactivitylog` (`ActivitySerNum`, `PatientSerNum`, `ActivityType`, `ActivityDescription`, `ActivityDateTime`, `LastUpdated`) VALUES
(289, 51, 'Login', 'no description', '2015-08-14 12:13:28', '2015-08-14 16:13:28'),
(290, 51, 'Login', 'no description', '2015-08-14 12:14:41', '2015-08-14 16:14:41'),
(291, 51, 'Message', 'no description', '2015-08-14 12:14:49', '2015-08-14 16:14:49'),
(292, 51, 'Refresh', 'no description', '2015-08-14 12:14:54', '2015-08-14 16:14:54'),
(293, 51, 'Login', 'no description', '2015-08-14 12:17:52', '2015-08-14 16:17:52'),
(294, 51, 'Login', 'no description', '2015-08-14 12:18:22', '2015-08-14 16:18:22'),
(295, 51, 'Login', 'no description', '2015-08-14 12:20:58', '2015-08-14 16:20:58'),
(296, 51, 'Login', 'no description', '2015-08-14 12:23:31', '2015-08-14 16:23:31'),
(297, 51, 'Login', 'no description', '2015-08-14 12:23:53', '2015-08-14 16:23:53'),
(298, 51, 'Login', 'no description', '2015-08-14 12:24:18', '2015-08-14 16:24:18'),
(299, 51, 'Login', 'no description', '2015-08-14 12:25:38', '2015-08-14 16:25:38'),
(300, 51, 'MessageRead', 'no description', '2015-08-14 12:25:40', '2015-08-14 16:25:40'),
(301, 51, 'MessageRead', 'no description', '2015-08-14 12:25:40', '2015-08-14 16:25:40'),
(302, 51, 'MessageRead', 'no description', '2015-08-14 12:25:40', '2015-08-14 16:25:40'),
(303, 51, 'MessageRead', 'no description', '2015-08-14 12:25:40', '2015-08-14 16:25:40'),
(304, 51, 'MessageRead', 'no description', '2015-08-14 12:25:40', '2015-08-14 16:25:40'),
(305, 51, 'MessageRead', 'no description', '2015-08-14 12:25:40', '2015-08-14 16:25:40'),
(306, 51, 'MessageRead', 'no description', '2015-08-14 12:25:40', '2015-08-14 16:25:40'),
(307, 51, 'Refresh', 'no description', '2015-08-14 12:26:15', '2015-08-14 16:26:15'),
(308, 51, 'Login', 'no description', '2015-08-14 12:27:01', '2015-08-14 16:27:01'),
(309, 51, 'Message', 'no description', '2015-08-14 12:27:21', '2015-08-14 16:27:21'),
(310, 51, 'Refresh', 'no description', '2015-08-14 12:27:25', '2015-08-14 16:27:25'),
(311, 51, 'Refresh', 'no description', '2015-08-14 12:27:33', '2015-08-14 16:27:33'),
(312, 51, 'Message', 'no description', '2015-08-14 12:27:41', '2015-08-14 16:27:41'),
(313, 51, 'Refresh', 'no description', '2015-08-14 12:27:49', '2015-08-14 16:27:49'),
(314, 51, 'Login', 'no description', '2015-08-14 12:34:01', '2015-08-14 16:34:01'),
(315, 51, 'Login', 'no description', '2015-08-14 12:34:08', '2015-08-14 16:34:08'),
(316, 51, 'Login', 'no description', '2015-08-14 12:34:15', '2015-08-14 16:34:15'),
(317, 51, 'Message', 'no description', '2015-08-14 12:37:13', '2015-08-14 16:37:13'),
(318, 51, 'Refresh', 'no description', '2015-08-14 12:37:46', '2015-08-14 16:37:46'),
(319, 51, 'Login', 'no description', '2015-08-14 12:41:15', '2015-08-14 16:41:15'),
(320, 50, 'Login', 'no description', '2015-08-14 12:41:18', '2015-08-14 16:41:18'),
(321, 51, 'Login', 'no description', '2015-08-14 12:47:07', '2015-08-14 16:47:07'),
(322, 51, 'Login', 'no description', '2015-08-14 12:47:30', '2015-08-14 16:47:30'),
(323, 51, 'Login', 'no description', '2015-08-14 12:48:20', '2015-08-14 16:48:20'),
(324, 51, 'Login', 'no description', '2015-08-14 12:48:48', '2015-08-14 16:48:48'),
(325, 51, 'Login', 'no description', '2015-08-14 12:53:00', '2015-08-14 16:53:00'),
(326, 51, 'Login', 'no description', '2015-08-14 12:58:10', '2015-08-14 16:58:10'),
(327, 51, 'Login', 'no description', '2015-08-14 12:58:24', '2015-08-14 16:58:24'),
(328, 51, 'Login', 'no description', '2015-08-14 12:59:39', '2015-08-14 16:59:39'),
(329, 51, 'Login', 'no description', '2015-08-14 13:03:01', '2015-08-14 17:03:01'),
(330, 51, 'Login', 'no description', '2015-08-14 13:09:16', '2015-08-14 17:09:16'),
(331, 51, 'Login', 'no description', '2015-08-14 13:10:37', '2015-08-14 17:10:37'),
(332, 51, 'Login', 'no description', '2015-08-14 13:11:23', '2015-08-14 17:11:23'),
(333, 51, 'Login', 'no description', '2015-08-14 14:13:27', '2015-08-14 18:13:27'),
(334, 51, 'Login', 'no description', '2015-08-14 14:17:00', '2015-08-14 18:17:00'),
(335, 51, 'Login', 'no description', '2015-08-14 14:18:12', '2015-08-14 18:18:12'),
(336, 51, 'Login', 'no description', '2015-08-14 14:26:13', '2015-08-14 18:26:13'),
(337, 51, 'Login', 'no description', '2015-08-14 14:26:24', '2015-08-14 18:26:24'),
(338, 51, 'Login', 'no description', '2015-08-14 14:27:15', '2015-08-14 18:27:15'),
(339, 51, 'Login', 'no description', '2015-08-14 14:27:21', '2015-08-14 18:27:21'),
(340, 51, 'Login', 'no description', '2015-08-14 14:27:28', '2015-08-14 18:27:28'),
(341, 51, 'Login', 'no description', '2015-08-14 14:30:37', '2015-08-14 18:30:37'),
(342, 51, 'Login', 'no description', '2015-08-14 14:32:54', '2015-08-14 18:32:54'),
(343, 51, 'Login', 'no description', '2015-08-14 14:33:09', '2015-08-14 18:33:09'),
(344, 51, 'Login', 'no description', '2015-08-14 14:33:46', '2015-08-14 18:33:46'),
(345, 51, 'Login', 'no description', '2015-08-14 14:33:58', '2015-08-14 18:33:58'),
(346, 51, 'Logout', 'no description', '2015-08-14 14:41:07', '2015-08-14 18:41:07'),
(347, 51, 'Login', 'no description', '2015-08-14 14:41:08', '2015-08-14 18:41:08'),
(348, 51, 'Login', 'no description', '2015-08-14 14:41:08', '2015-08-14 18:41:08'),
(349, 51, 'Login', 'no description', '2015-08-14 14:41:08', '2015-08-14 18:41:08'),
(350, 51, 'Login', 'no description', '2015-08-14 14:41:08', '2015-08-14 18:41:08'),
(351, 51, 'Login', 'no description', '2015-08-14 14:41:08', '2015-08-14 18:41:08'),
(352, 51, 'Login', 'no description', '2015-08-14 14:41:08', '2015-08-14 18:41:08'),
(353, 51, 'Login', 'no description', '2015-08-14 14:41:08', '2015-08-14 18:41:08'),
(354, 51, 'Login', 'no description', '2015-08-14 14:48:02', '2015-08-14 18:48:02'),
(355, 51, 'Login', 'no description', '2015-08-14 14:48:09', '2015-08-14 18:48:09'),
(356, 51, 'Login', 'no description', '2015-08-14 14:50:08', '2015-08-14 18:50:08'),
(357, 51, 'Login', 'no description', '2015-08-14 14:50:15', '2015-08-14 18:50:15'),
(358, 51, 'Login', 'no description', '2015-08-14 14:56:48', '2015-08-14 18:56:48'),
(359, 51, 'Login', 'no description', '2015-08-14 15:02:25', '2015-08-14 19:02:25'),
(360, 51, 'Login', 'no description', '2015-08-14 15:03:58', '2015-08-14 19:03:58'),
(361, 51, 'Login', 'no description', '2015-08-14 15:04:15', '2015-08-14 19:04:15'),
(362, 51, 'Login', 'no description', '2015-08-14 15:07:11', '2015-08-14 19:07:11'),
(363, 51, 'Login', 'no description', '2015-08-14 15:07:40', '2015-08-14 19:07:40'),
(364, 51, 'Login', 'no description', '2015-08-14 15:08:39', '2015-08-14 19:08:39'),
(365, 51, 'Login', 'no description', '2015-08-14 15:11:42', '2015-08-14 19:11:42'),
(366, 51, 'Login', 'no description', '2015-08-14 15:13:03', '2015-08-14 19:13:03'),
(367, 51, 'Login', 'no description', '2015-08-14 15:13:37', '2015-08-14 19:13:37'),
(368, 51, 'Login', 'no description', '2015-08-14 15:14:15', '2015-08-14 19:14:15'),
(369, 51, 'Login', 'no description', '2015-08-14 15:15:52', '2015-08-14 19:15:52'),
(370, 51, 'Login', 'no description', '2015-08-14 15:16:48', '2015-08-14 19:16:48'),
(371, 51, 'Login', 'no description', '2015-08-14 15:17:42', '2015-08-14 19:17:42'),
(372, 51, 'Login', 'no description', '2015-08-14 15:18:05', '2015-08-14 19:18:05'),
(373, 51, 'Login', 'no description', '2015-08-14 15:19:05', '2015-08-14 19:19:05'),
(374, 51, 'Login', 'no description', '2015-08-14 15:19:29', '2015-08-14 19:19:29'),
(375, 51, 'Login', 'no description', '2015-08-14 15:20:50', '2015-08-14 19:20:50'),
(376, 51, 'Login', 'no description', '2015-08-14 15:22:34', '2015-08-14 19:22:34'),
(377, 51, 'Login', 'no description', '2015-08-14 15:23:02', '2015-08-14 19:23:02'),
(378, 51, 'Login', 'no description', '2015-08-14 15:24:09', '2015-08-14 19:24:09'),
(379, 51, 'Login', 'no description', '2015-08-14 15:24:22', '2015-08-14 19:24:22'),
(380, 51, 'Login', 'no description', '2015-08-14 15:25:35', '2015-08-14 19:25:35'),
(381, 51, 'Login', 'no description', '2015-08-14 15:28:41', '2015-08-14 19:28:41'),
(382, 51, 'Login', 'no description', '2015-08-14 15:30:23', '2015-08-14 19:30:23'),
(383, 51, 'Login', 'no description', '2015-08-14 15:30:45', '2015-08-14 19:30:45'),
(384, 51, 'Login', 'no description', '2015-08-14 15:33:10', '2015-08-14 19:33:10'),
(385, 51, 'Login', 'no description', '2015-08-14 15:35:37', '2015-08-14 19:35:37'),
(386, 51, 'Login', 'no description', '2015-08-14 15:36:00', '2015-08-14 19:36:00'),
(387, 51, 'Login', 'no description', '2015-08-14 15:37:35', '2015-08-14 19:37:35'),
(388, 51, 'Login', 'no description', '2015-08-14 15:38:18', '2015-08-14 19:38:18'),
(389, 51, 'Login', 'no description', '2015-08-14 15:44:55', '2015-08-14 19:44:55'),
(390, 51, 'Login', 'no description', '2015-08-14 15:45:14', '2015-08-14 19:45:14'),
(391, 51, 'Login', 'no description', '2015-08-14 15:47:09', '2015-08-14 19:47:09'),
(392, 51, 'Logout', 'no description', '2015-08-14 15:47:42', '2015-08-14 19:47:42'),
(393, 51, 'Login', 'no description', '2015-08-14 15:47:51', '2015-08-14 19:47:51'),
(394, 51, 'Login', 'no description', '2015-08-14 16:00:14', '2015-08-14 20:00:14'),
(395, 51, 'Login', 'no description', '2015-08-14 16:01:11', '2015-08-14 20:01:11'),
(396, 51, 'Login', 'no description', '2015-08-14 16:09:00', '2015-08-14 20:09:00'),
(397, 51, 'Login', 'no description', '2015-08-14 16:09:18', '2015-08-14 20:09:18'),
(398, 51, 'Login', 'no description', '2015-08-14 16:10:21', '2015-08-14 20:10:21'),
(399, 51, 'Login', 'no description', '2015-08-14 16:27:49', '2015-08-14 20:27:49'),
(400, 51, 'Login', 'no description', '2015-08-14 16:27:57', '2015-08-14 20:27:57'),
(401, 51, 'Login', 'no description', '2015-08-14 16:29:18', '2015-08-14 20:29:18'),
(402, 51, 'Login', 'no description', '2015-08-14 16:32:04', '2015-08-14 20:32:04'),
(403, 51, 'Login', 'no description', '2015-08-14 16:33:28', '2015-08-14 20:33:28'),
(404, 51, 'Login', 'no description', '2015-08-14 16:33:42', '2015-08-14 20:33:42'),
(405, 50, 'Login', 'no description', '2015-08-14 16:47:57', '2015-08-14 20:47:57'),
(406, 51, 'Login', 'no description', '2015-08-14 16:55:10', '2015-08-14 20:55:10'),
(407, 50, 'Login', 'no description', '2015-08-17 13:10:10', '2015-08-17 17:10:10'),
(408, 50, 'Login', 'no description', '2015-08-17 13:10:48', '2015-08-17 17:10:48'),
(409, 51, 'Message', 'no description', '2015-08-17 13:17:25', '2015-08-17 17:17:25'),
(410, 51, 'Message', 'no description', '2015-08-17 13:17:25', '2015-08-17 17:17:25'),
(411, 51, 'AppointmentChange', 'no description', '2015-08-17 14:14:50', '2015-08-17 18:14:50'),
(412, 50, 'Login', 'no description', '2015-08-17 14:20:20', '2015-08-17 18:20:20'),
(413, 51, 'Message', 'no description', '2015-08-17 14:22:01', '2015-08-17 18:22:01'),
(414, 51, 'Message', 'no description', '2015-08-17 14:27:12', '2015-08-17 18:27:12'),
(415, 51, 'Login', 'no description', '2015-08-17 14:29:07', '2015-08-17 18:29:07'),
(416, 51, 'Login', 'no description', '2015-08-17 14:29:34', '2015-08-17 18:29:34'),
(417, 51, 'Login', 'no description', '2015-08-17 14:35:33', '2015-08-17 18:35:33'),
(418, 51, 'Login', 'no description', '2015-08-17 14:36:46', '2015-08-17 18:36:46'),
(419, 51, 'Login', 'no description', '2015-08-17 14:38:20', '2015-08-17 18:38:20'),
(420, 51, 'Login', 'no description', '2015-08-17 14:39:05', '2015-08-17 18:39:05'),
(421, 51, 'Login', 'no description', '2015-08-17 14:39:18', '2015-08-17 18:39:18'),
(422, 51, 'Refresh', 'no description', '2015-08-17 14:39:27', '2015-08-17 18:39:27'),
(423, 51, 'Login', 'no description', '2015-08-17 14:40:20', '2015-08-17 18:40:20'),
(424, 51, 'Login', 'no description', '2015-08-17 14:40:39', '2015-08-17 18:40:39'),
(425, 51, 'Message', 'no description', '2015-08-17 14:40:45', '2015-08-17 18:40:45'),
(426, 51, 'Refresh', 'no description', '2015-08-17 14:40:49', '2015-08-17 18:40:49'),
(427, 51, 'AppointmentChange', 'no description', '2015-08-17 14:41:23', '2015-08-17 18:41:23'),
(428, 50, 'Login', 'no description', '2015-08-17 15:13:12', '2015-08-17 19:13:12'),
(429, 51, 'Login', 'no description', '2015-08-17 15:29:35', '2015-08-17 19:29:35'),
(430, 51, 'AppointmentChange', 'no description', '2015-08-17 15:29:59', '2015-08-17 19:29:59'),
(431, 51, 'Login', 'no description', '2015-08-17 15:31:48', '2015-08-17 19:31:48'),
(432, 51, 'AppointmentChange', 'no description', '2015-08-17 15:32:00', '2015-08-17 19:32:00'),
(433, 51, 'Login', 'no description', '2015-08-17 15:34:00', '2015-08-17 19:34:00'),
(434, 51, 'AppointmentChange', 'no description', '2015-08-17 15:34:15', '2015-08-17 19:34:15'),
(435, 51, 'Login', 'no description', '2015-08-17 15:35:23', '2015-08-17 19:35:23'),
(436, 51, 'Login', 'no description', '2015-08-17 15:36:19', '2015-08-17 19:36:19'),
(437, 51, 'Login', 'no description', '2015-08-17 15:37:41', '2015-08-17 19:37:41'),
(438, 51, 'AppointmentChange', 'no description', '2015-08-17 15:37:56', '2015-08-17 19:37:56'),
(439, 51, 'Login', 'no description', '2015-08-17 15:40:51', '2015-08-17 19:40:51'),
(440, 51, 'Login', 'no description', '2015-08-17 16:01:46', '2015-08-17 20:01:46'),
(441, 51, 'Login', 'no description', '2015-08-17 16:02:13', '2015-08-17 20:02:13'),
(442, 51, 'Login', 'no description', '2015-08-17 16:03:06', '2015-08-17 20:03:06'),
(443, 51, 'Login', 'no description', '2015-08-17 16:06:26', '2015-08-17 20:06:26'),
(444, 51, 'Login', 'no description', '2015-08-17 16:07:46', '2015-08-17 20:07:46'),
(445, 51, 'Login', 'no description', '2015-08-17 16:09:17', '2015-08-17 20:09:17'),
(446, 51, 'Login', 'no description', '2015-08-17 16:11:24', '2015-08-17 20:11:24'),
(447, 51, 'Login', 'no description', '2015-08-17 16:16:19', '2015-08-17 20:16:19'),
(448, 51, 'Login', 'no description', '2015-08-17 16:19:37', '2015-08-17 20:19:37'),
(449, 51, 'Login', 'no description', '2015-08-17 16:22:40', '2015-08-17 20:22:40'),
(450, 51, 'Login', 'no description', '2015-08-17 16:23:36', '2015-08-17 20:23:36'),
(451, 51, 'Login', 'no description', '2015-08-17 16:24:55', '2015-08-17 20:24:55'),
(452, 51, 'Login', 'no description', '2015-08-17 16:25:05', '2015-08-17 20:25:05'),
(453, 51, 'Login', 'no description', '2015-08-17 16:26:02', '2015-08-17 20:26:02'),
(454, 51, 'Login', 'no description', '2015-08-17 16:27:22', '2015-08-17 20:27:22'),
(455, 51, 'Login', 'no description', '2015-08-17 16:28:04', '2015-08-17 20:28:04'),
(456, 51, 'Login', 'no description', '2015-08-17 16:28:14', '2015-08-17 20:28:14'),
(457, 51, 'Login', 'no description', '2015-08-17 16:28:57', '2015-08-17 20:28:57'),
(458, 51, 'Login', 'no description', '2015-08-17 16:33:09', '2015-08-17 20:33:09'),
(459, 51, 'Login', 'no description', '2015-08-17 16:33:26', '2015-08-17 20:33:26'),
(460, 51, 'Login', 'no description', '2015-08-17 16:35:28', '2015-08-17 20:35:28'),
(461, 50, 'Login', 'no description', '2015-08-17 16:46:04', '2015-08-17 20:46:04'),
(462, 51, 'Login', 'no description', '2015-08-17 16:50:24', '2015-08-17 20:50:24'),
(463, 51, 'Login', 'no description', '2015-08-17 17:07:17', '2015-08-17 21:07:17'),
(464, 51, 'Login', 'no description', '2015-08-17 17:08:57', '2015-08-17 21:08:57'),
(465, 51, 'Login', 'no description', '2015-08-17 17:09:51', '2015-08-17 21:09:51'),
(466, 51, 'Login', 'no description', '2015-08-17 17:11:15', '2015-08-17 21:11:15'),
(467, 51, 'Login', 'no description', '2015-08-17 17:11:56', '2015-08-17 21:11:56'),
(468, 51, 'Login', 'no description', '2015-08-17 17:13:09', '2015-08-17 21:13:09'),
(469, 51, 'Logout', 'no description', '2015-08-18 12:33:06', '2015-08-18 16:33:06'),
(470, 51, 'AppointmentChange', 'no description', '2015-08-25 14:58:08', '2015-08-25 18:58:08'),
(471, 51, 'Login', 'no description', '2015-08-25 14:58:15', '2015-08-25 18:58:15'),
(472, 51, 'Login', 'no description', '2015-08-25 14:58:15', '2015-08-25 18:58:15'),
(473, 51, 'Login', 'no description', '2015-08-25 14:58:15', '2015-08-25 18:58:15'),
(474, 51, 'Login', 'no description', '2015-08-25 14:58:15', '2015-08-25 18:58:15'),
(475, 51, 'Login', 'no description', '2015-08-25 14:59:36', '2015-08-25 18:59:36'),
(476, 51, 'AppointmentChange', 'no description', '2015-08-25 15:00:54', '2015-08-25 19:00:54'),
(477, 51, 'Login', 'no description', '2015-08-25 15:04:41', '2015-08-25 19:04:41'),
(478, 51, 'Login', 'no description', '2015-08-25 15:05:34', '2015-08-25 19:05:34'),
(479, 51, 'AccountChange', 'no description', '2015-08-25 15:05:37', '2015-08-25 19:05:37'),
(480, 51, 'Refresh', 'no description', '2015-08-25 15:05:38', '2015-08-25 19:05:38'),
(481, 51, 'AccountChange', 'no description', '2015-08-25 15:06:45', '2015-08-25 19:06:45'),
(482, 51, 'Refresh', 'no description', '2015-08-25 15:06:47', '2015-08-25 19:06:47'),
(483, 51, 'AccountChange', 'no description', '2015-08-25 15:07:20', '2015-08-25 19:07:20'),
(484, 51, 'Refresh', 'no description', '2015-08-25 15:07:21', '2015-08-25 19:07:21'),
(485, 51, 'AccountChange', 'no description', '2015-08-25 15:07:22', '2015-08-25 19:07:22'),
(486, 51, 'Refresh', 'no description', '2015-08-25 15:07:24', '2015-08-25 19:07:24'),
(487, 51, 'AccountChange', 'no description', '2015-08-25 15:07:57', '2015-08-25 19:07:57'),
(488, 51, 'Refresh', 'no description', '2015-08-25 15:07:58', '2015-08-25 19:07:58'),
(489, 51, 'Login', 'no description', '2015-08-25 15:13:06', '2015-08-25 19:13:06'),
(490, 51, 'Login', 'no description', '2015-08-25 15:16:30', '2015-08-25 19:16:30'),
(491, 51, 'Login', 'no description', '2015-08-25 15:19:22', '2015-08-25 19:19:22'),
(492, 51, 'AccountChange', 'no description', '2015-08-25 15:20:32', '2015-08-25 19:20:32'),
(493, 51, 'Login', 'no description', '2015-08-25 15:23:06', '2015-08-25 19:23:06'),
(494, 51, 'Login', 'no description', '2015-08-25 15:23:35', '2015-08-25 19:23:35'),
(495, 51, 'Logout', 'no description', '2015-08-25 15:24:15', '2015-08-25 19:24:15'),
(496, 51, 'Login', 'no description', '2015-08-25 15:24:47', '2015-08-25 19:24:47'),
(497, 51, 'Logout', 'no description', '2015-08-25 15:29:11', '2015-08-25 19:29:11'),
(498, 51, 'Login', 'no description', '2015-08-25 15:29:18', '2015-08-25 19:29:18'),
(499, 51, 'Checkin', 'no description', '2015-08-25 15:29:52', '2015-08-25 19:29:52'),
(500, 51, 'Refresh', 'no description', '2015-08-25 15:30:58', '2015-08-25 19:30:58'),
(501, 51, 'Checkin', 'no description', '2015-08-25 15:31:33', '2015-08-25 19:31:33'),
(502, 51, 'Checkin', 'no description', '2015-08-25 15:31:42', '2015-08-25 19:31:42'),
(503, 51, 'Checkin', 'no description', '2015-08-25 15:34:01', '2015-08-25 19:34:01'),
(504, 51, 'Login', 'no description', '2015-08-25 15:39:11', '2015-08-25 19:39:11'),
(505, 51, 'Login', 'no description', '2015-08-25 15:40:06', '2015-08-25 19:40:06'),
(506, 51, 'Login', 'no description', '2015-08-25 15:41:55', '2015-08-25 19:41:55'),
(507, 51, 'MessageRead', 'no description', '2015-08-25 15:41:58', '2015-08-25 19:41:58'),
(508, 51, 'MessageRead', 'no description', '2015-08-25 15:41:58', '2015-08-25 19:41:58'),
(509, 51, 'MessageRead', 'no description', '2015-08-25 15:41:58', '2015-08-25 19:41:58'),
(510, 51, 'MessageRead', 'no description', '2015-08-25 15:41:58', '2015-08-25 19:41:58'),
(511, 51, 'MessageRead', 'no description', '2015-08-25 15:41:58', '2015-08-25 19:41:58'),
(512, 51, 'MessageRead', 'no description', '2015-08-25 15:41:58', '2015-08-25 19:41:58'),
(513, 51, 'MessageRead', 'no description', '2015-08-25 15:41:58', '2015-08-25 19:41:58'),
(514, 51, 'Login', 'no description', '2015-08-25 15:48:38', '2015-08-25 19:48:38'),
(515, 51, 'Login', 'no description', '2015-08-25 15:51:45', '2015-08-25 19:51:45'),
(516, 51, 'Refresh', 'no description', '2015-08-25 15:54:16', '2015-08-25 19:54:16'),
(517, 51, 'Message', 'no description', '2015-08-25 15:54:51', '2015-08-25 19:54:51'),
(518, 51, 'Message', 'no description', '2015-08-25 15:55:43', '2015-08-25 19:55:43'),
(519, 51, 'Login', 'no description', '2015-08-25 15:56:11', '2015-08-25 19:56:11'),
(520, 51, 'Message', 'no description', '2015-08-25 15:56:30', '2015-08-25 19:56:30'),
(521, 51, 'Login', 'no description', '2015-08-25 15:58:06', '2015-08-25 19:58:06'),
(522, 51, 'Message', 'no description', '2015-08-25 15:58:17', '2015-08-25 19:58:17'),
(523, 51, 'Logout', 'no description', '2015-08-25 15:58:26', '2015-08-25 19:58:26'),
(524, 51, 'Login', 'no description', '2015-08-25 15:59:10', '2015-08-25 19:59:10'),
(525, 51, 'Message', 'no description', '2015-08-25 15:59:39', '2015-08-25 19:59:39'),
(526, 51, 'Message', 'no description', '2015-08-25 16:00:50', '2015-08-25 20:00:50'),
(527, 51, 'Login', 'no description', '2015-08-25 16:01:06', '2015-08-25 20:01:06'),
(528, 51, 'Message', 'no description', '2015-08-25 16:01:28', '2015-08-25 20:01:28'),
(529, 51, 'Login', 'no description', '2015-08-25 17:27:13', '2015-08-25 21:27:13'),
(530, 51, 'Login', 'no description', '2015-08-25 17:29:09', '2015-08-25 21:29:09'),
(531, 51, 'Message', 'no description', '2015-08-27 13:17:19', '2015-08-27 17:17:19'),
(532, 51, 'Message', 'no description', '2015-08-27 13:17:19', '2015-08-27 17:17:19'),
(533, 51, 'Message', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(534, 51, 'Message', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(535, 51, 'Message', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(536, 51, 'Message', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(537, 51, 'Message', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(538, 51, 'Message', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(539, 51, 'Message', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(540, 51, 'Message', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(541, 51, 'AccountChange', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(542, 51, 'AccountChange', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(543, 51, 'Message', 'no description', '2015-08-27 13:17:20', '2015-08-27 17:17:20'),
(544, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(545, 51, 'Refresh', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(546, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(547, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(548, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(549, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(550, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(551, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(552, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(553, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(554, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(555, 51, 'Login', 'no description', '2015-08-27 13:17:40', '2015-08-27 17:17:40'),
(556, 51, 'Login', 'no description', '2015-08-27 13:25:21', '2015-08-27 17:25:21'),
(557, 51, 'Login', 'no description', '2015-08-27 13:26:10', '2015-08-27 17:26:10'),
(558, 51, 'Login', 'no description', '2015-08-27 13:27:44', '2015-08-27 17:27:44'),
(559, 51, 'Login', 'no description', '2015-08-27 13:28:21', '2015-08-27 17:28:21'),
(560, 51, 'Login', 'no description', '2015-08-27 13:33:12', '2015-08-27 17:33:12'),
(561, 51, 'Login', 'no description', '2015-08-27 13:33:25', '2015-08-27 17:33:25'),
(562, 51, 'Login', 'no description', '2015-08-27 13:34:03', '2015-08-27 17:34:03'),
(563, 51, 'Login', 'no description', '2015-08-27 13:34:28', '2015-08-27 17:34:28'),
(564, 51, 'Login', 'no description', '2015-08-27 13:35:31', '2015-08-27 17:35:31'),
(565, 51, 'Login', 'no description', '2015-08-27 13:35:49', '2015-08-27 17:35:49'),
(566, 51, 'Message', 'no description', '2015-08-27 14:49:48', '2015-08-27 18:49:48'),
(567, 51, 'Login', 'no description', '2015-08-27 17:57:14', '2015-08-27 21:57:14'),
(568, 51, 'Login', 'no description', '2015-08-27 18:00:21', '2015-08-27 22:00:21'),
(569, 51, 'Login', 'no description', '2015-08-27 18:01:46', '2015-08-27 22:01:46'),
(570, 51, 'Login', 'no description', '2015-08-27 18:22:58', '2015-08-27 22:22:58'),
(571, 51, 'Message', 'no description', '2015-08-27 18:39:51', '2015-08-27 22:39:51'),
(572, 51, 'Message', 'no description', '2015-08-27 18:40:14', '2015-08-27 22:40:14'),
(573, 51, 'AccountChange', 'no description', '2015-08-27 18:43:20', '2015-08-27 22:43:20'),
(574, 51, 'AccountChange', 'no description', '2015-08-27 18:54:35', '2015-08-27 22:54:35'),
(575, 51, 'AccountChange', 'no description', '2015-08-27 18:54:38', '2015-08-27 22:54:38'),
(576, 51, 'Refresh', 'no description', '2015-08-27 18:57:47', '2015-08-27 22:57:47'),
(577, 51, 'Refresh', 'no description', '2015-08-27 18:58:05', '2015-08-27 22:58:05'),
(578, 51, 'Refresh', 'no description', '2015-08-27 18:58:09', '2015-08-27 22:58:09'),
(579, 51, 'Refresh', 'no description', '2015-08-27 18:58:19', '2015-08-27 22:58:19'),
(580, 51, 'Refresh', 'no description', '2015-08-27 18:58:19', '2015-08-27 22:58:19'),
(581, 51, 'Refresh', 'no description', '2015-08-27 18:58:19', '2015-08-27 22:58:19'),
(582, 51, 'Logout', 'no description', '2015-08-27 19:00:23', '2015-08-27 23:00:23'),
(583, 51, 'Login', 'no description', '2015-08-27 19:14:54', '2015-08-27 23:14:54');

-- --------------------------------------------------------

--
-- Table structure for table `patientcontrol`
--

CREATE TABLE IF NOT EXISTS `patientcontrol` (
  `PatientSerNum` int(11) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT '2000-01-01 05:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `patientcontrol`
--

INSERT INTO `patientcontrol` (`PatientSerNum`, `LastUpdated`) VALUES
(51, '2015-08-11 13:51:19');

-- --------------------------------------------------------

--
-- Table structure for table `patientdoctor`
--

CREATE TABLE IF NOT EXISTS `patientdoctor` (
  `PatientDoctorSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `DoctorSerNum` int(11) NOT NULL,
  `OncologistFlag` int(11) NOT NULL,
  `PrimaryFlag` int(11) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `patientdoctor`
--

INSERT INTO `patientdoctor` (`PatientDoctorSerNum`, `PatientSerNum`, `DoctorSerNum`, `OncologistFlag`, `PrimaryFlag`, `LastUpdated`) VALUES
(1, 51, 4, 1, 1, '2015-08-11 13:23:49'),
(2, 51, 5, 0, 0, '2015-08-11 13:23:49'),
(3, 51, 6, 0, 0, '2015-08-11 13:23:49'),
(4, 51, 7, 0, 1, '2015-08-11 13:23:49'),
(5, 51, 8, 0, 0, '2015-08-11 13:23:49'),
(6, 51, 9, 0, 0, '2015-08-11 13:23:49');

-- --------------------------------------------------------

--
-- Table structure for table `patientimages`
--

CREATE TABLE IF NOT EXISTS `patientimages` (
  `ImageSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `ImagePathLocation` varchar(255) NOT NULL,
  `ImageHospitalDescription_FR` varchar(255) NOT NULL,
  `ImageHospitalDescription_EN` varchar(255) NOT NULL,
  `ImageHospitalName_FR` varchar(255) NOT NULL,
  `ImageHospitalName_EN` varchar(255) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `patientimages`
--

INSERT INTO `patientimages` (`ImageSerNum`, `PatientSerNum`, `ImagePathLocation`, `ImageHospitalDescription_FR`, `ImageHospitalDescription_EN`, `ImageHospitalName_FR`, `ImageHospitalName_EN`, `LastUpdated`) VALUES
(1, 51, '/PatientFiles/51/image1.jpg', 'plan de traitement', 'Treatment Plan', 'Physics QA 1', 'Physics QA 1', '2015-08-27 17:27:14'),
(2, 51, '/PatientFiles/51/image2.jpg', 'aucune anomalie n''a été détectée', 'no abnormality was detected', 'CT Scan', 'CT Scan', '2015-08-27 17:26:57'),
(3, 51, '/PatientFiles/51/image3.jpg', 'aucune anomalie n''a été détectée', 'no abnormality was detected', 'CT Scan', 'CT Scan', '2015-08-27 17:27:02'),
(4, 51, '/PatientFiles/51/image4.jpg', 'aucune anomalie n''a été détectée', 'no abnormality was detected', 'CT Scan', 'CT Scan', '2015-08-27 17:15:59');

-- --------------------------------------------------------

--
-- Table structure for table `patientnotifications`
--

CREATE TABLE IF NOT EXISTS `patientnotifications` (
  `NotificationSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `NotificationContent_FR` varchar(255) NOT NULL,
  `NotificationContent_EN` varchar(255) NOT NULL,
  `NotificationName_FR` text NOT NULL,
  `NotificationName_EN` text NOT NULL,
  `ResourceSerNum` int(11) NOT NULL,
  `DateTime` datetime DEFAULT NULL,
  `ReadStatus` tinyint(1) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `patientnotifications`
--

INSERT INTO `patientnotifications` (`NotificationSerNum`, `PatientSerNum`, `NotificationContent_FR`, `NotificationContent_EN`, `NotificationName_FR`, `NotificationName_EN`, `ResourceSerNum`, `DateTime`, `ReadStatus`, `LastUpdated`) VALUES
(1, 51, 'vous etes', 'you are', 'diagnostic', 'diagnosis', 4, '2015-08-11 00:00:00', 1, '2015-08-11 14:16:55'),
(2, 51, 'diagnostiqué avec', 'diagnosed with', 'diagnostic', 'diagnosis', 4, '2015-08-11 00:00:00', 1, '2015-08-11 14:17:00'),
(3, 51, 'grippe', 'flu', 'diagnostic', 'diagnosis', 4, '2015-08-11 00:00:00', 1, '2015-08-11 14:17:01');

-- --------------------------------------------------------

--
-- Table structure for table `planworkflow`
--

CREATE TABLE IF NOT EXISTS `planworkflow` (
  `PlanWorkflowSerNum` int(11) NOT NULL,
  `PlanSerNum` int(11) NOT NULL,
  `OrderNum` int(11) NOT NULL,
  `Type` varchar(255) NOT NULL,
  `TypeSerNum` int(11) NOT NULL,
  `PublishedName_EN` varchar(255) NOT NULL,
  `PublishedName_FR` varchar(255) NOT NULL,
  `PublishedDescription_EN` varchar(255) NOT NULL,
  `PublishedDescription_FR` varchar(255) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `resource`
--

CREATE TABLE IF NOT EXISTS `resource` (
  `ResourceSerNum` int(11) NOT NULL,
  `ResourceAriaSer` int(11) NOT NULL,
  `ResourceName` varchar(255) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `resource`
--

INSERT INTO `resource` (`ResourceSerNum`, `ResourceAriaSer`, `ResourceName`, `LastUpdated`) VALUES
(1, 36, 'Christine Lambert, MD', '2015-08-10 16:56:26'),
(2, 5631, 'Tarek Hijal, MD', '2015-08-10 16:56:49'),
(3, 2752, 'Fabio Cury, MD', '2015-08-10 16:57:10'),
(4, 14, 'George Shenouda, MD', '2015-08-11 13:23:49'),
(5, 5280, 'EL HAKIM MICHEL', '2015-08-11 13:23:49'),
(6, 5677, 'LOUISE QUINTAL', '2015-08-11 13:23:49'),
(7, 6699, 'BOUGANIM Nathaniel', '2015-08-11 13:23:49'),
(8, 7155, 'Medical Records MGH', '2015-08-11 13:23:49'),
(9, 7156, 'Medical Records RVH', '2015-08-11 13:23:49'),
(15, 0, 'Admin', '2015-08-25 00:06:59'),
(16, 0, 'admoon', '2015-08-25 00:07:12'),
(17, 0, 'atkinson', '2015-08-25 00:07:27');

-- --------------------------------------------------------

--
-- Table structure for table `smssurvey`
--

CREATE TABLE IF NOT EXISTS `smssurvey` (
  `SMSSerNum` int(11) NOT NULL,
  `SentToNumber` bigint(11) NOT NULL,
  `Provider` text NOT NULL,
  `ReceivedInTime` text NOT NULL,
  `SubmissionTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `smssurvey`
--

INSERT INTO `smssurvey` (`SMSSerNum`, `SentToNumber`, `Provider`, `ReceivedInTime`, `SubmissionTime`) VALUES
(16, 4389946118, '', '<1', '0000-00-00 00:00:00'),
(17, 4389946118, '', '<1', '0000-00-00 00:00:00'),
(18, 5144758943, '', '<1', '0000-00-00 00:00:00'),
(19, 5144758943, '', '<1', '0000-00-00 00:00:00'),
(20, 4389946118, '', '<1', '2015-07-10 18:47:40'),
(21, 4389946118, '', '<1', '2015-07-10 19:01:17'),
(22, 5144758943, 'bell', '<1', '2015-07-10 19:30:01'),
(23, 5144758943, 'mobilicity', '<1', '2015-07-10 19:40:23'),
(24, 4389946118, 'chatr', '1-3', '2015-07-10 20:01:25'),
(25, 5144758943, 'telus', '<1', '2015-07-10 20:07:27'),
(26, 5144758943, 'telus', '<1', '2015-07-10 20:34:04'),
(27, 4389946118, 'chatr', '3<', '2015-07-13 20:48:20');

-- --------------------------------------------------------

--
-- Table structure for table `task`
--

CREATE TABLE IF NOT EXISTS `task` (
  `TaskSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `AliasExpressionSerNum` int(11) NOT NULL,
  `TaskAriaSer` int(11) NOT NULL,
  `DueDateTime` datetime NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `task`
--

INSERT INTO `task` (`TaskSerNum`, `PatientSerNum`, `AliasExpressionSerNum`, `TaskAriaSer`, `DueDateTime`, `LastUpdated`) VALUES
(1, 51, 3, 416480, '2014-07-21 11:47:00', '2015-08-11 13:41:11'),
(2, 51, 4, 416886, '2014-08-06 08:00:00', '2015-08-11 13:41:11'),
(3, 51, 5, 416887, '2014-08-20 08:00:00', '2015-08-11 13:41:11'),
(4, 51, 6, 416917, '2014-08-06 09:05:00', '2015-08-11 13:41:11'),
(5, 51, 7, 417732, '2014-08-08 15:27:00', '2015-08-11 13:41:11'),
(6, 51, 8, 417733, '2014-08-08 15:27:00', '2015-08-11 13:41:11'),
(7, 51, 8, 417734, '2014-08-08 15:27:00', '2015-08-11 13:41:11'),
(8, 51, 9, 417776, '2014-08-11 07:31:00', '2015-08-11 13:41:11'),
(9, 51, 10, 418295, '2014-08-12 16:36:00', '2015-08-11 13:41:11'),
(10, 51, 10, 418306, '2014-08-13 07:06:00', '2015-08-11 13:41:11'),
(11, 51, 10, 418322, '2014-08-13 08:47:00', '2015-08-11 13:41:11'),
(12, 51, 10, 418323, '2014-08-19 08:47:00', '2015-08-11 13:41:11'),
(13, 51, 11, 418324, '2014-08-13 08:48:00', '2015-08-11 13:41:11'),
(14, 51, 12, 418341, '2014-08-13 09:34:00', '2015-08-11 13:41:11'),
(15, 51, 13, 418343, '2014-08-13 09:35:00', '2015-08-11 13:41:11'),
(16, 51, 14, 418349, '2014-08-13 09:51:00', '2015-08-11 13:41:11'),
(17, 51, 15, 418455, '2014-08-13 12:52:00', '2015-08-11 13:41:11'),
(18, 51, 16, 418475, '2014-09-03 09:30:00', '2015-08-11 13:41:11'),
(19, 51, 17, 420009, '2014-08-26 13:57:00', '2015-08-11 13:41:11'),
(20, 51, 18, 420770, '2014-08-25 09:14:00', '2015-08-11 13:41:11'),
(21, 51, 19, 422442, '2014-09-03 09:10:00', '2015-08-11 13:41:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`AdminSerNum`);

--
-- Indexes for table `alias`
--
ALTER TABLE `alias`
  ADD PRIMARY KEY (`AliasSerNum`);

--
-- Indexes for table `aliasexpression`
--
ALTER TABLE `aliasexpression`
  ADD PRIMARY KEY (`AliasExpressionSerNum`);

--
-- Indexes for table `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`AppointmentSerNum`);

--
-- Indexes for table `appointmentchangerequests`
--
ALTER TABLE `appointmentchangerequests`
  ADD PRIMARY KEY (`RequestSerNum`);

--
-- Indexes for table `diagnosis`
--
ALTER TABLE `diagnosis`
  ADD PRIMARY KEY (`DiagnosisSerNum`);

--
-- Indexes for table `doctor`
--
ALTER TABLE `doctor`
  ADD PRIMARY KEY (`DoctorSerNum`);

--
-- Indexes for table `document`
--
ALTER TABLE `document`
  ADD PRIMARY KEY (`DocumentSerNum`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`FeedbackSerNum`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`MessageSerNum`);

--
-- Indexes for table `patient`
--
ALTER TABLE `patient`
  ADD PRIMARY KEY (`PatientSerNum`);

--
-- Indexes for table `patientactivitylog`
--
ALTER TABLE `patientactivitylog`
  ADD PRIMARY KEY (`ActivitySerNum`);

--
-- Indexes for table `patientcontrol`
--
ALTER TABLE `patientcontrol`
  ADD PRIMARY KEY (`PatientSerNum`);

--
-- Indexes for table `patientdoctor`
--
ALTER TABLE `patientdoctor`
  ADD PRIMARY KEY (`PatientDoctorSerNum`);

--
-- Indexes for table `patientimages`
--
ALTER TABLE `patientimages`
  ADD PRIMARY KEY (`ImageSerNum`);

--
-- Indexes for table `patientnotifications`
--
ALTER TABLE `patientnotifications`
  ADD PRIMARY KEY (`NotificationSerNum`);

--
-- Indexes for table `planworkflow`
--
ALTER TABLE `planworkflow`
  ADD PRIMARY KEY (`PlanWorkflowSerNum`), ADD UNIQUE KEY `PlanSerNum` (`PlanSerNum`,`OrderNum`);

--
-- Indexes for table `resource`
--
ALTER TABLE `resource`
  ADD PRIMARY KEY (`ResourceSerNum`);

--
-- Indexes for table `smssurvey`
--
ALTER TABLE `smssurvey`
  ADD PRIMARY KEY (`SMSSerNum`);

--
-- Indexes for table `task`
--
ALTER TABLE `task`
  ADD PRIMARY KEY (`TaskSerNum`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `AdminSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `alias`
--
ALTER TABLE `alias`
  MODIFY `AliasSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `aliasexpression`
--
ALTER TABLE `aliasexpression`
  MODIFY `AliasExpressionSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=33;
--
-- AUTO_INCREMENT for table `appointment`
--
ALTER TABLE `appointment`
  MODIFY `AppointmentSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT for table `appointmentchangerequests`
--
ALTER TABLE `appointmentchangerequests`
  MODIFY `RequestSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `diagnosis`
--
ALTER TABLE `diagnosis`
  MODIFY `DiagnosisSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `doctor`
--
ALTER TABLE `doctor`
  MODIFY `DoctorSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `document`
--
ALTER TABLE `document`
  MODIFY `DocumentSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `FeedbackSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `MessageSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=95;
--
-- AUTO_INCREMENT for table `patient`
--
ALTER TABLE `patient`
  MODIFY `PatientSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=53;
--
-- AUTO_INCREMENT for table `patientactivitylog`
--
ALTER TABLE `patientactivitylog`
  MODIFY `ActivitySerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=584;
--
-- AUTO_INCREMENT for table `patientdoctor`
--
ALTER TABLE `patientdoctor`
  MODIFY `PatientDoctorSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `patientimages`
--
ALTER TABLE `patientimages`
  MODIFY `ImageSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `patientnotifications`
--
ALTER TABLE `patientnotifications`
  MODIFY `NotificationSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `planworkflow`
--
ALTER TABLE `planworkflow`
  MODIFY `PlanWorkflowSerNum` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `resource`
--
ALTER TABLE `resource`
  MODIFY `ResourceSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT for table `smssurvey`
--
ALTER TABLE `smssurvey`
  MODIFY `SMSSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=28;
--
-- AUTO_INCREMENT for table `task`
--
ALTER TABLE `task`
  MODIFY `TaskSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=22;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
