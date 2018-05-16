-- phpMyAdmin SQL Dump
-- version 4.5.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 01, 2018 at 04:17 AM
-- Server version: 10.1.16-MariaDB
-- PHP Version: 7.0.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `QuestionnaireDB_StringKeys`
--

-- --------------------------------------------------------

DROP TABLE IF EXISTS `feedback_answer`;

CREATE TABLE `feedback_answer` (
  `ser_num` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `questionnaire_answer_ser_num` int(11) NOT NULL,
  `feedback_answeroption_sernum` int(11) DEFAULT NULL,
  `feedback_text` text,
  PRIMARY KEY (`ser_num`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table feedback_answeroption
# ------------------------------------------------------------

DROP TABLE IF EXISTS `feedback_answeroption`;

CREATE TABLE `feedback_answeroption` (
  `ser_num` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `text_en` varchar(256) NOT NULL DEFAULT '',
  `text_fr` varchar(256) NOT NULL DEFAULT '',
  `caption_en` varchar(256) NOT NULL,
  `caption_fr` varchar(256) NOT NULL,
  `display_img` varchar(256) NOT NULL DEFAULT '',
  `category` enum('QUESTION_EMOTION','QUESTION_THUMBS_UPDOWN','SIMILAR_YESNO','SKIP_REASONS') NOT NULL DEFAULT 'QUESTION_EMOTION',
  PRIMARY KEY (`ser_num`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `feedback_answeroption` (`ser_num`, `text_en`, `text_fr`, `caption_en`, `caption_fr`, `display_img`, `category`)
VALUES
	(1,'This question confuses me','Je suis confus(e) par rapport ? cette question','Confused','Confus','','QUESTION_EMOTION'),
	(2,'This question makes me angry','Cette question me rends furieux','Angry','Furieux','','QUESTION_EMOTION'),
	(3,'This question scares me','Cette question me fait peur','Scared','Peur','','QUESTION_EMOTION'),
	(4,'This question makes me anxious','Cette question me rends anxieux','Anxious','Anxieux','','QUESTION_EMOTION'),
	(5,'This question makes me sad','Cette question me rends triste','Sad','Triste','','QUESTION_EMOTION'),
	(6,'I do not feel comfortable answering this question','Je ne me sens pas ? l\'aise de r?pondre ? cette question','Not comfortable','Pas ? l\'aise','','SKIP_REASONS'),
	(7,'Ambiguous or unclear question','Question ambigue','Ambiguous','Ambigue','','SKIP_REASONS'),
	(8,'No valid answer choice','Aucun choix de r?ponse valide','No answer choice','Pas de choix de r?ponse','','QUESTION_EMOTION'),
	(9,'Yes','Yes','Yes','Yes','','SIMILAR_YESNO'),
	(10,'No','No','No','No','','SIMILAR_YESNO'),
	(11,'Thumbs up','J\'aime','Thumbs Up','J\'aime','','QUESTION_THUMBS_UPDOWN'),
	(12,'Thumbs down','Je n\'aime pas','Thumbs Up','Je n\'aime pas','','QUESTION_THUMBS_UPDOWN');

--
-- Table structure for table `questionnaire_answer`
--

CREATE TABLE `questionnaire_answer` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `questionnaire_patient_rel_ser_num` int(11) UNSIGNED NOT NULL,
  `question_ser_num` int(11) UNSIGNED NOT NULL,
  `answeroption_ser_num` int(11) UNSIGNED DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `skipped` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `questionnaire_answer`
--

INSERT INTO `questionnaire_answer` (`ser_num`, `questionnaire_patient_rel_ser_num`, `question_ser_num`, `answeroption_ser_num`, `created`, `last_updated`, `skipped`) VALUES
(25, 1, 1, 21, '2017-11-21 16:58:23', '2017-11-21 17:10:32', 0),
(26, 1, 2, 22, '2017-11-21 16:58:28', '2017-11-21 17:16:23', 0),
(27, 1, 4, 21, '2017-11-21 16:58:31', '2017-11-21 16:59:39', 0),
(28, 1, 3, 20, '2017-11-21 17:17:42', '2017-11-21 17:17:42', 0),
(29, 1, 5, 23, '2017-11-21 17:17:51', '2017-11-21 17:17:51', 0),
(32, 2, 39, 50, '2017-11-30 20:58:07', '2017-11-30 20:58:07', 0),
(33, 2, 40, 51, '2017-11-30 20:58:09', '2017-11-30 23:16:27', 0),
(36, 2, 43, 48, '2017-11-30 20:58:16', '2017-11-30 20:58:16', 0),
(37, 2, 44, 48, '2017-11-30 20:58:17', '2017-11-30 20:58:17', 0),
(49, 2, 38, 48, '2017-11-30 23:16:14', '2017-11-30 23:16:14', 0),
(66, 2, 41, 48, '2017-12-20 18:35:01', '2017-12-20 18:35:01', 0),
(67, 2, 42, NULL, '2017-12-20 18:35:03', '2017-12-20 18:35:03', 1),
(68, 2, 45, 49, '2017-12-20 18:35:21', '2017-12-20 18:35:21', 0),
(69, 2, 46, 6, '2017-12-20 19:12:06', '2017-12-20 19:12:06', 0),
(70, 2, 47, NULL, '2017-12-20 19:14:39', '2017-12-20 19:14:39', 1),
(74, 3, 48, NULL, '2018-01-30 23:50:47', '2018-01-30 23:50:47', 1);

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_answertext`
--

CREATE TABLE `questionnaire_answertext` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `answer_ser_num` int(11) UNSIGNED NOT NULL,
  `answer_text` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_entity`
--

CREATE TABLE `questionnaire_entity` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `title_key` varchar(256) NOT NULL,
  `nickname_key` varchar(256) DEFAULT NULL,
  `instructions_key` varchar(256) DEFAULT NULL,
  `version` int(4) UNSIGNED DEFAULT NULL,
  `feedback_type_ser_num` int(11) UNSIGNED DEFAULT NULL,
  `private` tinyint(1) NOT NULL,
  `final` tinyint(1) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `questionnaire_entity`
--

INSERT INTO `questionnaire_entity` (`ser_num`, `title_key`, `nickname_key`, `instructions_key`, `version`, `feedback_type_ser_num`, `private`, `final`, `created`, `last_updated`, `created_by`, `last_updated_by`) VALUES
(1, 'FACT-B', NULL, 'FACT-B_Instructions', NULL, NULL, 0, 1, '2017-11-09 22:33:57', '2017-11-09 22:33:57', NULL, NULL),
(2, 'Breast_Radiotherapy_Symptom_Questionnaire', NULL, NULL, NULL, NULL, 0, 1, '2017-11-09 23:19:33', '2017-11-09 23:19:33', NULL, NULL),
(3, 'Test_Checkbox_Questionnaire', NULL, NULL, NULL, NULL, 1, 1, '2017-11-21 17:27:44', '2017-11-21 17:27:44', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_entity_patient_rel`
--

CREATE TABLE `questionnaire_entity_patient_rel` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `questionnaire_ser_num` int(11) UNSIGNED NOT NULL,
  `patient_ser_num` int(11) UNSIGNED NOT NULL,
  `status` varchar(128) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `questionnaire_entity_patient_rel`
--

INSERT INTO `questionnaire_entity_patient_rel` (`ser_num`, `questionnaire_ser_num`, `patient_ser_num`, `status`, `created`, `last_updated`) VALUES
(1, 1, 1, 'In progress', '2017-11-09 22:34:21', '2017-12-20 14:54:06'),
(2, 2, 1, 'In progress', '2017-11-09 23:19:53', '2017-12-20 14:48:48'),
(3, 3, 1, 'In progress', '2017-11-21 17:28:01', '2018-01-30 23:50:46'),
(4, 1, 1, 'Completed', '2017-12-20 14:57:52', '2018-01-10 12:37:21'),
(5, 2, 1, 'Completed', '2017-12-20 15:40:36', '2018-01-10 12:37:24');

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_scoring_rubric`
--

CREATE TABLE `questionnaire_scoring_rubric` (
  `questionnaire_ser_num` int(11) UNSIGNED NOT NULL,
  `algorithm_ser_num` varchar(256) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_section`
--

CREATE TABLE `questionnaire_section` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `title_key` varchar(256) NOT NULL,
  `instructions_key` varchar(256) DEFAULT NULL,
  `questionnaire_ser_num` int(11) UNSIGNED NOT NULL,
  `position` int(4) UNSIGNED DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `questionnaire_section`
--

INSERT INTO `questionnaire_section` (`ser_num`, `title_key`, `instructions_key`, `questionnaire_ser_num`, `position`, `created`, `last_updated`, `created_by`, `last_updated_by`) VALUES
(1, 'Physical_Well_Being', NULL, 1, 0, '2017-11-09 22:39:03', '2017-11-09 22:39:03', NULL, NULL),
(2, 'Social_Family_Well_Being', NULL, 1, 1, '2017-11-09 22:39:03', '2017-11-09 22:39:03', NULL, NULL),
(3, 'Emotional_Well_Being', NULL, 1, 2, '2017-11-09 22:39:35', '2017-11-09 22:39:35', NULL, NULL),
(4, 'Functional_Well_Being', NULL, 1, 3, '2017-11-09 22:39:35', '2017-11-09 22:39:35', NULL, NULL),
(5, 'Additional_Concerns', NULL, 1, 4, '2017-11-09 22:39:49', '2017-11-09 22:39:49', NULL, NULL),
(6, 'Arm_Breast_Symptoms', 'Breast_Radiotherapy_Instructions', 2, 1, '2017-11-09 23:22:09', '2017-11-15 17:27:53', NULL, NULL),
(7, 'Quality_Of_Life', NULL, 2, 0, '2017-11-09 23:22:09', '2017-11-15 17:27:56', NULL, NULL),
(8, 'Test_Checkbox_Section', NULL, 3, 1, '2017-11-21 17:28:49', '2017-11-21 17:28:49', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_section_question_rel`
--

CREATE TABLE `questionnaire_section_question_rel` (
  `section_ser_num` int(11) UNSIGNED NOT NULL,
  `question_ser_num` int(11) UNSIGNED NOT NULL,
  `position` int(4) UNSIGNED DEFAULT NULL,
  `optional` tinyint(1) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `questionnaire_section_question_rel`
--

INSERT INTO `questionnaire_section_question_rel` (`section_ser_num`, `question_ser_num`, `position`, `optional`, `created`, `last_updated`, `created_by`, `last_updated_by`) VALUES
(1, 1, 0, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(1, 2, 1, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(1, 3, 2, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(1, 4, 3, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(1, 5, 4, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(1, 6, 5, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(1, 7, 6, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(2, 8, 0, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(2, 9, 1, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(2, 10, 2, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(2, 11, 3, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(2, 12, 4, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(2, 13, 5, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(2, 14, 6, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(3, 15, 0, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(3, 16, 1, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(3, 17, 2, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(3, 18, 3, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(3, 19, 4, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(3, 20, 5, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(4, 21, 0, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(4, 22, 1, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(4, 23, 2, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(4, 24, 3, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(4, 25, 4, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(4, 26, 5, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(4, 27, 6, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 28, 0, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 29, 1, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 30, 2, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 31, 3, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 32, 4, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 33, 5, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 34, 6, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 35, 7, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 36, 8, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(5, 37, 9, 0, '2017-11-09 22:44:17', '2017-11-09 22:44:17', NULL, NULL),
(6, 38, 0, 1, '2017-11-09 23:46:21', '2017-11-09 23:46:21', NULL, NULL),
(6, 39, 1, 1, '2017-11-09 23:46:21', '2017-11-09 23:46:21', NULL, NULL),
(6, 40, 2, 1, '2017-11-09 23:46:50', '2017-11-09 23:46:50', NULL, NULL),
(6, 41, 3, 1, '2017-11-09 23:46:50', '2017-11-09 23:46:50', NULL, NULL),
(6, 42, 4, 1, '2017-11-09 23:47:24', '2017-11-09 23:47:24', NULL, NULL),
(6, 43, 5, 1, '2017-11-09 23:47:24', '2017-11-09 23:47:24', NULL, NULL),
(6, 44, 6, 1, '2017-11-09 23:47:51', '2017-11-09 23:47:51', NULL, NULL),
(6, 45, 7, 1, '2017-11-09 23:47:51', '2017-11-09 23:47:51', NULL, NULL),
(7, 46, 0, 0, '2017-11-09 23:48:22', '2017-11-09 23:48:22', NULL, NULL),
(7, 47, 1, 1, '2017-11-09 23:48:22', '2017-11-30 22:47:55', NULL, NULL),
(8, 48, 1, 1, '2017-11-21 17:29:22', '2017-12-20 18:13:42', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_strings`
--

CREATE TABLE `questionnaire_strings` (
  `string_key` varchar(256) NOT NULL,
  `string` varchar(512) NOT NULL,
  `language` varchar(128) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `questionnaire_strings`
--

INSERT INTO `questionnaire_strings` (`string_key`, `string`, `language`, `created`, `last_updated`, `created_by`, `last_updated_by`) VALUES
('1', '1', 'en', '2017-11-09 23:02:40', '2017-11-09 23:02:40', NULL, NULL),
('7', '7', 'en', '2017-11-09 23:02:40', '2017-11-09 23:02:40', NULL, NULL),
('Additional_Concerns', 'Additional Concerns', 'en', '2017-11-09 22:38:09', '2017-11-09 22:38:09', NULL, NULL),
('Almost_constantly', 'Almost constantly', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Amount', 'Amount', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Anna_Library', 'Anna''s Library', 'en', '2017-11-21 17:23:02', '2017-11-21 17:23:02', NULL, NULL),
('Arm_Breast_Symptoms', 'Arm & Breast Symptoms', 'en', '2017-11-09 23:17:59', '2017-11-09 23:17:59', NULL, NULL),
('A_little', 'A little', 'en', '2017-11-09 23:07:10', '2017-11-09 23:07:10', NULL, NULL),
('A_little_bit', 'A little bit', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Blue', 'Blue', 'en', '2017-11-21 17:30:15', '2017-11-21 17:30:15', NULL, NULL),
('Blue', 'Bleu', 'fr', '2017-11-21 17:30:15', '2017-11-21 17:30:15', NULL, NULL),
('Boolean', 'Boolean', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('BooleanNA', 'BooleanNA', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('BooleanS', 'BooleanS', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Breast_Radiotherapy_1', 'Did you have any pain in your arm or shoulder?', 'en', '2017-11-09 23:38:48', '2017-11-09 23:38:48', NULL, NULL),
('Breast_Radiotherapy_10', 'How would you rate your overall quality of life during the past week?', 'en', '2017-11-09 23:41:32', '2017-11-09 23:41:32', NULL, NULL),
('Breast_Radiotherapy_2', 'Did you have a swollen arm or hand?', 'en', '2017-11-09 23:38:48', '2017-11-09 23:38:48', NULL, NULL),
('Breast_Radiotherapy_3', 'Was it difficult to raise your arm or to move it sideways?', 'en', '2017-11-09 23:39:55', '2017-11-09 23:39:55', NULL, NULL),
('Breast_Radiotherapy_4', 'Have you had any pain in your radiated area?', 'en', '2017-11-09 23:39:55', '2017-11-09 23:39:55', NULL, NULL),
('Breast_Radiotherapy_5', 'Have you had any swelling in your radiated area?', 'en', '2017-11-09 23:40:34', '2017-11-09 23:40:34', NULL, NULL),
('Breast_Radiotherapy_6', 'Has your radiated area been oversensitive?', 'en', '2017-11-09 23:40:34', '2017-11-09 23:40:34', NULL, NULL),
('Breast_Radiotherapy_7', 'Have you had skin problems in the area that was radiated (e.g. itchy, dry, flaky)?', 'en', '2017-11-09 23:41:05', '2017-11-09 23:41:05', NULL, NULL),
('Breast_Radiotherapy_8', 'Were you tired?', 'en', '2017-11-09 23:41:05', '2017-11-09 23:41:05', NULL, NULL),
('Breast_Radiotherapy_9', 'How would you rate your overall health during the past week?', 'en', '2017-11-09 23:41:32', '2017-11-09 23:41:32', NULL, NULL),
('Breast_Radiotherapy_Instructions', 'Patients sometimes report that they have the following symptoms or problems. Please indicate the extent to which you have experienced these symptoms or problems during the past week.', 'en', '2017-11-09 23:21:26', '2017-11-14 21:20:45', NULL, NULL),
('Breast_Radiotherapy_Symptom_Questionnaire', 'Breast Radiotherapy Symptom Questionnaire', 'en', '2017-11-09 23:18:49', '2017-11-09 23:18:49', NULL, NULL),
('Checkbox', 'Checkbox', 'en', '2017-11-21 17:20:38', '2017-11-21 17:20:38', NULL, NULL),
('Colors', 'Colors', 'en', '2017-11-21 17:19:25', '2017-11-21 17:19:25', NULL, NULL),
('Colors', 'Couleurs', 'fr', '2017-11-21 17:19:25', '2017-11-21 17:19:25', NULL, NULL),
('Colors_Question', 'Which of the following colors do you like?', 'en', '2017-11-21 17:22:38', '2017-11-21 17:22:38', NULL, NULL),
('Colors_Question', 'Lesquelles des couleurs suivantes aimez-vous?', 'fr', '2017-11-21 17:22:38', '2017-11-21 17:22:38', NULL, NULL),
('Emotional_Well_Being', 'Emotional Well-Being', 'en', '2017-11-09 22:37:27', '2017-11-09 22:37:27', NULL, NULL),
('EORTC_QLQ-30', 'EORTC QLQ-30', 'en', '2017-11-09 23:16:06', '2017-11-09 23:16:06', NULL, NULL),
('Excellent', 'Excellent', 'en', '2017-11-09 23:03:46', '2017-11-09 23:03:46', NULL, NULL),
('FACT-B', 'FACT-B', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACT-B_Instructions', 'Please answer all sections of the questionnaire.', 'en', '2017-11-09 22:33:23', '2017-11-09 22:33:23', NULL, NULL),
('FACTB_0', 'I have a lack of energy', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_1', 'I have nausea', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_10', 'My family has accepted my illness', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_11', 'I am satisfied with family communication about my illness', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_12', 'I feel close to my partner (or the person who is my main support)', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_13', 'I am satisfied with my sex life', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_14', 'I feel sad', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_15', 'I am satisfied with how I am coping with my illness', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_16', 'I am losing hope in the fight against my illness', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_17', 'I feel nervous', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_18', 'I worry about dying', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_19', 'I worry that my condition will get worse', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_2', 'Because of my physical condition, I have trouble meeting the needs of my family', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_20', 'I am able to work (include work at home)', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_21', 'My work (include work at home) is fulfilling', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_22', 'I am able to enjoy life', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_23', 'I have accepted my illness', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_24', 'I am sleeping well', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_25', 'I am enjoying the things I usually do for fun', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_26', 'I am content with the quality of my life right now', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_27', 'I have been short of breath', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_28', 'I am self-conscious about the way I dress', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_29', 'One of both of my arms are swollen or tender', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_3', 'I have pain', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_30', 'I feel sexually attractive', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_31', 'I am bothered by hair loss', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_32', 'I worry that other members of my family might someday get the same illness I have', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_33', 'I worry about the effect of stress on my illness', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_34', 'I am bothered by a change in weight', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_35', 'I am able to feel like a woman', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_36', 'I have certain parts of my body where I experience pain', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_4', 'I am bothered by side effects of treatment', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_5', 'I feel ill', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_6', 'I am forced to spend time in bed', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_7', 'I feel close to my friends', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_8', 'I get emotional support from my family', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('FACTB_9', 'I get support from my friends', 'en', '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
('Frequency', 'Frequency', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('FrequencyS', 'FrequencyS', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Frequently', 'Frequently', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Functional_Well_Being', 'Functional Well-Being', 'en', '2017-11-09 22:38:09', '2017-11-09 22:38:09', NULL, NULL),
('Green', 'Green', 'en', '2017-11-21 17:30:37', '2017-11-21 17:30:37', NULL, NULL),
('Green', 'Vert', 'fr', '2017-11-21 17:30:37', '2017-11-21 17:30:37', NULL, NULL),
('martina_amount', 'Martina Amount', 'en', '2017-11-09 23:08:21', '2017-11-09 23:08:21', NULL, NULL),
('Mild', 'Mild', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Moderate', 'Moderate', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('MultipleChoice', 'Multiple Choice', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Never', 'Never', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('No', 'No', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('None', 'None', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Not_applicable', 'Not applicable', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Not_at_all', 'Not at all', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Not_sexually_active', 'Not sexually active', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Occasionally', 'Occasionally', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Physical_Well_Being', 'Physical Well-Being', 'en', '2017-11-09 22:36:53', '2017-11-09 22:36:53', NULL, NULL),
('Prefer_not_to_answer', 'Prefer not to answer', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('QLQ-BR-23', 'QLQ-BR-23', 'en', '2017-11-09 23:13:48', '2017-11-09 23:13:48', NULL, NULL),
('Quality_Of_Life', 'Quality Of Life', 'en', '2017-11-09 23:17:59', '2017-11-09 23:17:59', NULL, NULL),
('Quite_a_bit', 'Quite a bit', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Rarely', 'Rarely', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Red', 'Red', 'en', '2017-11-21 17:30:01', '2017-11-21 17:30:01', NULL, NULL),
('Red', 'Rouge', 'fr', '2017-11-21 17:30:01', '2017-11-21 17:30:01', NULL, NULL),
('Scale', 'Scale', 'en', '2017-11-09 22:59:51', '2017-11-09 22:59:51', NULL, NULL),
('Scale_1_7', 'Scale (1 to 7)', 'en', '2017-11-09 22:58:41', '2017-11-09 22:58:41', NULL, NULL),
('Severe', 'Severe', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Severity', 'Severity', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('SeverityNA', 'SeverityNA', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('SeverityS', 'SeverityS', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Social_Family_Well_Being', 'Social/Family Well-Being', 'en', '2017-11-09 22:36:53', '2017-11-09 22:36:53', NULL, NULL),
('Somewhat', 'Somewhat', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Test_Checkbox_Questionnaire', 'Test Checkbox Questionnaire', 'en', '2017-11-21 17:27:19', '2017-11-21 17:27:19', NULL, NULL),
('Test_Checkbox_Section', 'Test Checkbox Section', 'en', '2017-11-21 17:28:33', '2017-11-21 17:28:33', NULL, NULL),
('Very_much', 'Very much', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Very_Poor', 'Very Poor', 'en', '2017-11-09 23:03:46', '2017-11-09 23:03:46', NULL, NULL),
('Very_severe', 'Very severe', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
('Yes', 'Yes', 'en', '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `question_bank_answeroption`
--

CREATE TABLE `question_bank_answeroption` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `text_key` varchar(256) NOT NULL,
  `caption_key` varchar(256) DEFAULT NULL,
  `questiontype_ser_num` int(11) UNSIGNED DEFAULT NULL,
  `position` int(4) UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `question_bank_answeroption`
--

INSERT INTO `question_bank_answeroption` (`ser_num`, `text_key`, `caption_key`, `questiontype_ser_num`, `position`, `created`, `last_updated`, `created_by`, `last_updated_by`) VALUES
(1, 'None', NULL, 1, 1, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(2, 'Mild', NULL, 1, 2, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(3, 'Moderate', NULL, 1, 3, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(4, 'Severe', NULL, 1, 4, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(5, 'Very_severe', NULL, 1, 5, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(6, 'None', NULL, 2, 1, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(7, 'Mild', NULL, 2, 2, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(8, 'Moderate', NULL, 2, 3, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(9, 'Severe', NULL, 2, 4, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(10, 'Very_severe', NULL, 2, 5, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(11, 'Not_applicable', NULL, 2, 6, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(12, 'None', NULL, 3, 1, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(13, 'Mild', NULL, 3, 2, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(14, 'Moderate', NULL, 3, 3, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(15, 'Severe', NULL, 3, 4, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(16, 'Very_severe', NULL, 3, 5, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(17, 'Not_sexually_active', NULL, 3, 6, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(18, 'Prefer_not_to_answer', NULL, 3, 7, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(19, 'Not_at_all', NULL, 4, 1, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(20, 'A_little_bit', NULL, 4, 2, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(21, 'Somewhat', NULL, 4, 3, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(22, 'Quite_a_bit', NULL, 4, 4, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(23, 'Very_much', NULL, 4, 5, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(24, 'Yes', NULL, 5, 1, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(25, 'No', NULL, 5, 2, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(26, 'Yes', NULL, 6, 1, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(27, 'No', NULL, 6, 2, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(28, 'Not_applicable', NULL, 6, 3, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(29, 'Yes', NULL, 7, 1, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(30, 'No', NULL, 7, 2, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(31, 'Not_sexually_active', NULL, 7, 3, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(32, 'Prefer_not_to_answer', NULL, 7, 4, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(33, 'Never', NULL, 8, 1, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(34, 'Rarely', NULL, 8, 2, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(35, 'Occasionally', NULL, 8, 3, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(36, 'Frequently', NULL, 8, 4, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(37, 'Almost_constantly', NULL, 8, 5, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(38, 'Never', NULL, 9, 1, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(39, 'Rarely', NULL, 9, 2, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(40, 'Occasionally', NULL, 9, 3, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(41, 'Frequently', NULL, 9, 4, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(42, 'Almost_constantly', NULL, 9, 5, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(43, 'Not_sexually_active', NULL, 9, 6, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(44, 'Prefer_not_to_answer', NULL, 9, 7, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(46, '1', 'Very_Poor', 10, 0, '2017-11-09 23:05:06', '2017-11-09 23:05:06', NULL, NULL),
(47, '7', 'Excellent', 10, 1, '2017-11-09 23:05:06', '2017-11-09 23:05:06', NULL, NULL),
(48, 'Not_at_all', NULL, 11, 0, '2017-11-09 23:09:22', '2017-11-09 23:09:22', NULL, NULL),
(49, 'A_little', NULL, 11, 1, '2017-11-09 23:09:58', '2017-11-09 23:09:58', NULL, NULL),
(50, 'Quite_a_bit', NULL, 11, 2, '2017-11-09 23:09:58', '2017-11-09 23:09:58', NULL, NULL),
(51, 'Very_much', NULL, 11, 3, '2017-11-09 23:10:17', '2017-11-09 23:10:17', NULL, NULL),
(52, 'Green', NULL, 12, 2, '2017-11-21 17:31:48', '2017-11-21 17:31:48', NULL, NULL),
(53, 'Red', NULL, 12, 1, '2017-11-21 17:32:06', '2017-11-21 17:32:06', NULL, NULL),
(54, 'Blue', NULL, 12, 3, '2017-11-21 17:32:06', '2017-11-21 17:32:06', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `question_bank_library`
--

CREATE TABLE `question_bank_library` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `name_key` varchar(256) NOT NULL,
  `private` tinyint(1) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `question_bank_library`
--

INSERT INTO `question_bank_library` (`ser_num`, `name_key`, `private`, `created`, `last_updated`, `created_by`, `last_updated_by`) VALUES
(1, 'FACT-B', 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL),
(2, 'QLQ-BR-23', 0, '2017-11-09 23:14:19', '2017-11-09 23:14:19', NULL, NULL),
(3, 'EORTC_QLQ-30', 0, '2017-11-09 23:14:19', '2017-11-09 23:16:17', NULL, NULL),
(4, 'Anna_Library', 1, '2017-11-21 17:23:20', '2017-11-21 17:23:20', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `question_bank_library_tag_rel`
--

CREATE TABLE `question_bank_library_tag_rel` (
  `library_ser_num` int(11) UNSIGNED NOT NULL,
  `tag_ser_num` int(11) UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `question_bank_question`
--

CREATE TABLE `question_bank_question` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `text_key` varchar(256) NOT NULL,
  `library_ser_num` int(11) UNSIGNED NOT NULL,
  `questiontype_ser_num` int(11) UNSIGNED DEFAULT NULL,
  `final` tinyint(1) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL,
  `polarity` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `question_bank_question`
--

INSERT INTO `question_bank_question` (`ser_num`, `text_key`, `library_ser_num`, `questiontype_ser_num`, `final`, `active`, `created`, `last_updated`, `created_by`, `last_updated_by`, `polarity`) VALUES
(1, 'FACTB_0', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(2, 'FACTB_1', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(3, 'FACTB_2', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(4, 'FACTB_3', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(5, 'FACTB_4', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(6, 'FACTB_5', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(7, 'FACTB_6', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(8, 'FACTB_7', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:20:40', NULL, NULL, 'highGood'),
(9, 'FACTB_8', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:20:49', NULL, NULL, 'highGood'),
(10, 'FACTB_9', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:20:52', NULL, NULL, 'highGood'),
(11, 'FACTB_10', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:20:59', NULL, NULL, 'highGood'),
(12, 'FACTB_11', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:03', NULL, NULL, 'highGood'),
(13, 'FACTB_12', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:07', NULL, NULL, 'highGood'),
(14, 'FACTB_13', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:10', NULL, NULL, 'highGood'),
(15, 'FACTB_14', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(16, 'FACTB_15', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:16', NULL, NULL, 'highGood'),
(17, 'FACTB_16', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(18, 'FACTB_17', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(19, 'FACTB_18', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(20, 'FACTB_19', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(21, 'FACTB_20', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:24', NULL, NULL, 'highGood'),
(22, 'FACTB_21', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:29', NULL, NULL, 'highGood'),
(23, 'FACTB_22', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:34', NULL, NULL, 'highGood'),
(24, 'FACTB_23', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:36', NULL, NULL, 'highGood'),
(25, 'FACTB_24', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:39', NULL, NULL, 'highGood'),
(26, 'FACTB_25', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:48', NULL, NULL, 'highGood'),
(27, 'FACTB_26', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:52', NULL, NULL, 'highGood'),
(28, 'FACTB_27', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(29, 'FACTB_28', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(30, 'FACTB_29', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(31, 'FACTB_30', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:21:59', NULL, NULL, 'highGood'),
(32, 'FACTB_31', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(33, 'FACTB_32', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(34, 'FACTB_33', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(35, 'FACTB_34', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(36, 'FACTB_35', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-15 19:22:04', NULL, NULL, 'highGood'),
(37, 'FACTB_36', 1, 4, 0, 0, '2017-11-09 22:29:01', '2017-11-09 22:29:01', NULL, NULL, 'lowGood'),
(38, 'Breast_Radiotherapy_1', 2, 11, 1, 1, '2017-11-09 23:43:10', '2017-11-09 23:43:10', NULL, NULL, 'lowGood'),
(39, 'Breast_Radiotherapy_2', 2, 11, 1, 1, '2017-11-09 23:43:10', '2017-11-09 23:43:10', NULL, NULL, 'lowGood'),
(40, 'Breast_Radiotherapy_3', 2, 11, 1, 1, '2017-11-09 23:43:36', '2017-11-09 23:43:36', NULL, NULL, 'lowGood'),
(41, 'Breast_Radiotherapy_4', 2, 11, 1, 1, '2017-11-09 23:43:36', '2017-11-09 23:43:36', NULL, NULL, 'lowGood'),
(42, 'Breast_Radiotherapy_5', 2, 11, 1, 1, '2017-11-09 23:44:02', '2017-11-09 23:44:02', NULL, NULL, 'lowGood'),
(43, 'Breast_Radiotherapy_6', 2, 11, 1, 1, '2017-11-09 23:44:02', '2017-11-09 23:44:02', NULL, NULL, 'lowGood'),
(44, 'Breast_Radiotherapy_7', 2, 11, 1, 1, '2017-11-09 23:44:25', '2017-11-09 23:44:25', NULL, NULL, 'lowGood'),
(45, 'Breast_Radiotherapy_8', 3, 11, 1, 1, '2017-11-09 23:44:25', '2017-11-09 23:44:25', NULL, NULL, 'lowGood'),
(46, 'Breast_Radiotherapy_9', 3, 10, 1, 1, '2017-11-09 23:44:49', '2017-11-21 17:26:17', NULL, NULL, ''),
(47, 'Breast_Radiotherapy_10', 3, 10, 1, 1, '2017-11-09 23:44:49', '2017-11-21 17:26:14', NULL, NULL, ''),
(48, 'Colors_Question', 4, 12, 1, 1, '2017-11-21 17:24:00', '2017-11-21 17:26:06', NULL, NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `question_bank_questiontype`
--

CREATE TABLE `question_bank_questiontype` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `name_key` varchar(256) DEFAULT NULL,
  `category_key` varchar(256) NOT NULL,
  `private` tinyint(1) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `question_bank_questiontype`
--

INSERT INTO `question_bank_questiontype` (`ser_num`, `name_key`, `category_key`, `private`, `created`, `last_updated`, `created_by`, `last_updated_by`) VALUES
(1, 'Severity', 'MultipleChoice', 0, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(2, 'SeverityNA', 'MultipleChoice', 0, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(3, 'SeverityS', 'MultipleChoice', 0, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(4, 'Amount', 'MultipleChoice', 0, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(5, 'Boolean', 'MultipleChoice', 0, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(6, 'BooleanNA', 'MultipleChoice', 0, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(7, 'BooleanS', 'MultipleChoice', 0, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(8, 'Frequency', 'MultipleChoice', 0, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(9, 'FrequencyS', 'MultipleChoice', 0, '2017-11-09 22:26:08', '2017-11-09 22:26:08', NULL, NULL),
(10, 'Scale_1_7', 'Scale', 1, '2017-11-09 23:00:13', '2017-11-09 23:00:13', NULL, NULL),
(11, 'martina_amount', 'MultipleChoice', 1, '2017-11-09 23:09:00', '2017-11-09 23:09:00', NULL, NULL),
(12, 'Colors', 'Checkbox', 1, '2017-11-21 17:20:56', '2017-11-21 17:20:56', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `question_bank_question_tag_rel`
--

CREATE TABLE `question_bank_question_tag_rel` (
  `question_ser_num` int(11) UNSIGNED NOT NULL,
  `tag_ser_num` int(11) UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `question_bank_tag`
--

CREATE TABLE `question_bank_tag` (
  `ser_num` int(11) UNSIGNED NOT NULL,
  `name` varchar(256) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `questionnaire_answer`
--
ALTER TABLE `questionnaire_answer`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `questionnaire_patient_rel_ser_num` (`questionnaire_patient_rel_ser_num`),
  ADD KEY `question_ser_num` (`question_ser_num`),
  ADD KEY `answeroption_ser_num` (`answeroption_ser_num`);

--
-- Indexes for table `questionnaire_answertext`
--
ALTER TABLE `questionnaire_answertext`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `answer_ser_num` (`answer_ser_num`);

--
-- Indexes for table `questionnaire_entity`
--
ALTER TABLE `questionnaire_entity`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `title_key` (`title_key`),
  ADD KEY `nickname_key` (`nickname_key`),
  ADD KEY `instructions_key` (`instructions_key`);

--
-- Indexes for table `questionnaire_entity_patient_rel`
--
ALTER TABLE `questionnaire_entity_patient_rel`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `questionnaire_ser_num` (`questionnaire_ser_num`);

--
-- Indexes for table `questionnaire_scoring_rubric`
--
ALTER TABLE `questionnaire_scoring_rubric`
  ADD PRIMARY KEY (`questionnaire_ser_num`,`algorithm_ser_num`);

--
-- Indexes for table `questionnaire_section`
--
ALTER TABLE `questionnaire_section`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `questionnaire_ser_num` (`questionnaire_ser_num`),
  ADD KEY `title_key` (`title_key`),
  ADD KEY `instructions_key` (`instructions_key`);

--
-- Indexes for table `questionnaire_section_question_rel`
--
ALTER TABLE `questionnaire_section_question_rel`
  ADD PRIMARY KEY (`section_ser_num`,`question_ser_num`),
  ADD KEY `question_ser_num` (`question_ser_num`);

--
-- Indexes for table `questionnaire_strings`
--
ALTER TABLE `questionnaire_strings`
  ADD PRIMARY KEY (`string_key`,`language`);

--
-- Indexes for table `question_bank_answeroption`
--
ALTER TABLE `question_bank_answeroption`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `questiontype_ser_num` (`questiontype_ser_num`),
  ADD KEY `text_key` (`text_key`),
  ADD KEY `caption_key` (`caption_key`);

--
-- Indexes for table `question_bank_library`
--
ALTER TABLE `question_bank_library`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `name_key` (`name_key`);

--
-- Indexes for table `question_bank_library_tag_rel`
--
ALTER TABLE `question_bank_library_tag_rel`
  ADD PRIMARY KEY (`library_ser_num`,`tag_ser_num`),
  ADD KEY `tag_ser_num` (`tag_ser_num`);

--
-- Indexes for table `question_bank_question`
--
ALTER TABLE `question_bank_question`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `library_ser_num` (`library_ser_num`),
  ADD KEY `questiontype_ser_num` (`questiontype_ser_num`),
  ADD KEY `text_key` (`text_key`);

--
-- Indexes for table `question_bank_questiontype`
--
ALTER TABLE `question_bank_questiontype`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `name_key` (`name_key`),
  ADD KEY `category_key` (`category_key`);

--
-- Indexes for table `question_bank_question_tag_rel`
--
ALTER TABLE `question_bank_question_tag_rel`
  ADD PRIMARY KEY (`question_ser_num`,`tag_ser_num`),
  ADD KEY `tag_ser_num` (`tag_ser_num`);

--
-- Indexes for table `question_bank_tag`
--
ALTER TABLE `question_bank_tag`
  ADD PRIMARY KEY (`ser_num`),
  ADD KEY `name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `questionnaire_answer`
--
ALTER TABLE `questionnaire_answer`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;
--
-- AUTO_INCREMENT for table `questionnaire_answertext`
--
ALTER TABLE `questionnaire_answertext`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `questionnaire_entity`
--
ALTER TABLE `questionnaire_entity`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `questionnaire_entity_patient_rel`
--
ALTER TABLE `questionnaire_entity_patient_rel`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `questionnaire_section`
--
ALTER TABLE `questionnaire_section`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `question_bank_answeroption`
--
ALTER TABLE `question_bank_answeroption`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;
--
-- AUTO_INCREMENT for table `question_bank_library`
--
ALTER TABLE `question_bank_library`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `question_bank_question`
--
ALTER TABLE `question_bank_question`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;
--
-- AUTO_INCREMENT for table `question_bank_questiontype`
--
ALTER TABLE `question_bank_questiontype`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT for table `question_bank_tag`
--
ALTER TABLE `question_bank_tag`
  MODIFY `ser_num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `questionnaire_answer`
--
ALTER TABLE `questionnaire_answer`
  ADD CONSTRAINT `questionnaire_answer_ibfk_1` FOREIGN KEY (`questionnaire_patient_rel_ser_num`) REFERENCES `questionnaire_entity_patient_rel` (`ser_num`),
  ADD CONSTRAINT `questionnaire_answer_ibfk_2` FOREIGN KEY (`question_ser_num`) REFERENCES `question_bank_question` (`ser_num`),
  ADD CONSTRAINT `questionnaire_answer_ibfk_3` FOREIGN KEY (`answeroption_ser_num`) REFERENCES `question_bank_answeroption` (`ser_num`);

--
-- Constraints for table `questionnaire_answertext`
--
ALTER TABLE `questionnaire_answertext`
  ADD CONSTRAINT `questionnaire_answertext_ibfk_1` FOREIGN KEY (`answer_ser_num`) REFERENCES `questionnaire_answer` (`ser_num`);

--
-- Constraints for table `questionnaire_entity`
--
ALTER TABLE `questionnaire_entity`
  ADD CONSTRAINT `questionnaire_entity_ibfk_1` FOREIGN KEY (`title_key`) REFERENCES `questionnaire_strings` (`string_key`),
  ADD CONSTRAINT `questionnaire_entity_ibfk_2` FOREIGN KEY (`nickname_key`) REFERENCES `questionnaire_strings` (`string_key`),
  ADD CONSTRAINT `questionnaire_entity_ibfk_3` FOREIGN KEY (`instructions_key`) REFERENCES `questionnaire_strings` (`string_key`);

--
-- Constraints for table `questionnaire_entity_patient_rel`
--
ALTER TABLE `questionnaire_entity_patient_rel`
  ADD CONSTRAINT `questionnaire_entity_patient_rel_ibfk_1` FOREIGN KEY (`questionnaire_ser_num`) REFERENCES `questionnaire_entity` (`ser_num`);

--
-- Constraints for table `questionnaire_scoring_rubric`
--
ALTER TABLE `questionnaire_scoring_rubric`
  ADD CONSTRAINT `questionnaire_scoring_rubric_ibfk_1` FOREIGN KEY (`questionnaire_ser_num`) REFERENCES `questionnaire_entity` (`ser_num`);

--
-- Constraints for table `questionnaire_section`
--
ALTER TABLE `questionnaire_section`
  ADD CONSTRAINT `questionnaire_section_ibfk_1` FOREIGN KEY (`questionnaire_ser_num`) REFERENCES `questionnaire_entity` (`ser_num`),
  ADD CONSTRAINT `questionnaire_section_ibfk_2` FOREIGN KEY (`title_key`) REFERENCES `questionnaire_strings` (`string_key`),
  ADD CONSTRAINT `questionnaire_section_ibfk_3` FOREIGN KEY (`instructions_key`) REFERENCES `questionnaire_strings` (`string_key`);

--
-- Constraints for table `questionnaire_section_question_rel`
--
ALTER TABLE `questionnaire_section_question_rel`
  ADD CONSTRAINT `questionnaire_section_question_rel_ibfk_1` FOREIGN KEY (`section_ser_num`) REFERENCES `questionnaire_section` (`ser_num`),
  ADD CONSTRAINT `questionnaire_section_question_rel_ibfk_2` FOREIGN KEY (`question_ser_num`) REFERENCES `question_bank_question` (`ser_num`);

--
-- Constraints for table `question_bank_answeroption`
--
ALTER TABLE `question_bank_answeroption`
  ADD CONSTRAINT `question_bank_answeroption_ibfk_1` FOREIGN KEY (`questiontype_ser_num`) REFERENCES `question_bank_questiontype` (`ser_num`),
  ADD CONSTRAINT `question_bank_answeroption_ibfk_2` FOREIGN KEY (`text_key`) REFERENCES `questionnaire_strings` (`string_key`),
  ADD CONSTRAINT `question_bank_answeroption_ibfk_3` FOREIGN KEY (`caption_key`) REFERENCES `questionnaire_strings` (`string_key`);

--
-- Constraints for table `question_bank_library`
--
ALTER TABLE `question_bank_library`
  ADD CONSTRAINT `question_bank_library_ibfk_1` FOREIGN KEY (`name_key`) REFERENCES `questionnaire_strings` (`string_key`);

--
-- Constraints for table `question_bank_library_tag_rel`
--
ALTER TABLE `question_bank_library_tag_rel`
  ADD CONSTRAINT `question_bank_library_tag_rel_ibfk_1` FOREIGN KEY (`library_ser_num`) REFERENCES `question_bank_library` (`ser_num`),
  ADD CONSTRAINT `question_bank_library_tag_rel_ibfk_2` FOREIGN KEY (`tag_ser_num`) REFERENCES `question_bank_tag` (`ser_num`);

--
-- Constraints for table `question_bank_question`
--
ALTER TABLE `question_bank_question`
  ADD CONSTRAINT `question_bank_question_ibfk_1` FOREIGN KEY (`library_ser_num`) REFERENCES `question_bank_library` (`ser_num`),
  ADD CONSTRAINT `question_bank_question_ibfk_2` FOREIGN KEY (`questiontype_ser_num`) REFERENCES `question_bank_questiontype` (`ser_num`),
  ADD CONSTRAINT `question_bank_question_ibfk_3` FOREIGN KEY (`text_key`) REFERENCES `questionnaire_strings` (`string_key`);

--
-- Constraints for table `question_bank_questiontype`
--
ALTER TABLE `question_bank_questiontype`
  ADD CONSTRAINT `question_bank_questiontype_ibfk_1` FOREIGN KEY (`name_key`) REFERENCES `questionnaire_strings` (`string_key`),
  ADD CONSTRAINT `question_bank_questiontype_ibfk_2` FOREIGN KEY (`category_key`) REFERENCES `questionnaire_strings` (`string_key`);

--
-- Constraints for table `question_bank_question_tag_rel`
--
ALTER TABLE `question_bank_question_tag_rel`
  ADD CONSTRAINT `question_bank_question_tag_rel_ibfk_1` FOREIGN KEY (`question_ser_num`) REFERENCES `question_bank_question` (`ser_num`),
  ADD CONSTRAINT `question_bank_question_tag_rel_ibfk_2` FOREIGN KEY (`tag_ser_num`) REFERENCES `question_bank_tag` (`ser_num`);

--
-- Constraints for table `question_bank_tag`
--
ALTER TABLE `question_bank_tag`
  ADD CONSTRAINT `question_bank_tag_ibfk_1` FOREIGN KEY (`name`) REFERENCES `questionnaire_strings` (`string_key`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;