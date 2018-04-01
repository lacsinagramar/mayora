CREATE DATABASE  IF NOT EXISTS `mayora` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `mayora`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mayora
-- ------------------------------------------------------
-- Server version	5.7.19-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_bills`
--

DROP TABLE IF EXISTS `tbl_bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_bills` (
  `intBillID` int(11) NOT NULL AUTO_INCREMENT,
  `intBillInfoID` int(11) NOT NULL,
  `dblTotalAmountDue` double NOT NULL,
  `datDueDate` date NOT NULL,
  `datPaymentDate` date NOT NULL,
  PRIMARY KEY (`intBillID`),
  KEY `biilInfo_FK_idx` (`intBillInfoID`),
  CONSTRAINT `biilInfo_FK` FOREIGN KEY (`intBillInfoID`) REFERENCES `tbl_own_meter` (`intOwnMeterID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `billInfo2_FK` FOREIGN KEY (`intBillInfoID`) REFERENCES `tbl_with_submeter` (`intWithSubmeterID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_inspection`
--

DROP TABLE IF EXISTS `tbl_inspection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_inspection` (
  `intInspectionID` int(11) NOT NULL AUTO_INCREMENT,
  `intRoomID` int(11) NOT NULL,
  `strTenantID` varchar(10) NOT NULL,
  `datInspectionDate` date NOT NULL,
  PRIMARY KEY (`intInspectionID`),
  KEY `room_FK_idx` (`intRoomID`),
  KEY `tenant_FK_idx` (`strTenantID`),
  CONSTRAINT `room_FK` FOREIGN KEY (`intRoomID`) REFERENCES `tbl_rooms` (`intRoomID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tenant_FK` FOREIGN KEY (`strTenantID`) REFERENCES `tbl_tenant_accounts` (`strTenantId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_landlord_account_payment`
--

DROP TABLE IF EXISTS `tbl_landlord_account_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_landlord_account_payment` (
  `intAccountPaymentID` int(11) NOT NULL AUTO_INCREMENT,
  `strLandlordID` varchar(10) NOT NULL,
  `strDepositSlip` longtext NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intAccountPaymentID`),
  KEY `landlordPayment_FK_idx` (`strLandlordID`),
  CONSTRAINT `landlordPayment_FK` FOREIGN KEY (`strLandlordID`) REFERENCES `tbl_landlord_accounts` (`strLandlordID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_landlord_accounts`
--

DROP TABLE IF EXISTS `tbl_landlord_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_landlord_accounts` (
  `strLandlordID` varchar(10) NOT NULL,
  `strFirstName` varchar(20) NOT NULL,
  `strMiddleName` varchar(20) DEFAULT NULL,
  `strLastName` varchar(20) NOT NULL,
  `strValidID` longtext NOT NULL,
  `strBIRPermit` longtext NOT NULL,
  `strLandTitle` longtext NOT NULL,
  `strAddress` varchar(20) NOT NULL,
  `strUsername` varchar(15) NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  `strEmail` varchar(30) NOT NULL,
  `strPassword` varchar(20) NOT NULL,
  `jsonContract` json NOT NULL,
  `strContactNumber` varchar(11) NOT NULL,
  `booPlan` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`strLandlordID`),
  UNIQUE KEY `strUsername_UNIQUE` (`strUsername`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_notifications`
--

DROP TABLE IF EXISTS `tbl_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_notifications` (
  `intNotificationID` int(11) NOT NULL AUTO_INCREMENT,
  `strAccountID` varchar(10) NOT NULL,
  `strNotifDesc` longtext NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intNotificationID`),
  KEY `notifTenant_FK_idx` (`strAccountID`),
  CONSTRAINT `notifLandlord_FK` FOREIGN KEY (`strAccountID`) REFERENCES `tbl_landlord_accounts` (`strLandlordID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notifTenant_FK` FOREIGN KEY (`strAccountID`) REFERENCES `tbl_tenant_accounts` (`strTenantId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_own_meter`
--

DROP TABLE IF EXISTS `tbl_own_meter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_own_meter` (
  `intOwnMeterID` int(11) NOT NULL AUTO_INCREMENT,
  `intRoomTenantID` int(11) NOT NULL,
  `EBillStatus` tinyint(1) NOT NULL DEFAULT '0',
  `WBillStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intOwnMeterID`),
  KEY `roomInfo_FK_idx` (`intRoomTenantID`),
  CONSTRAINT `roomInfo_FK` FOREIGN KEY (`intRoomTenantID`) REFERENCES `tbl_room_tenant` (`intRoomTenantID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_penalty`
--

DROP TABLE IF EXISTS `tbl_penalty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_penalty` (
  `intPenaltyID` int(11) NOT NULL AUTO_INCREMENT,
  `intBillID` int(11) NOT NULL,
  `dblPenalty` double NOT NULL,
  PRIMARY KEY (`intPenaltyID`),
  KEY `billID_FK_idx` (`intBillID`),
  CONSTRAINT `billID_FK` FOREIGN KEY (`intBillID`) REFERENCES `tbl_bills` (`intBillID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_room_tenant`
--

DROP TABLE IF EXISTS `tbl_room_tenant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_room_tenant` (
  `intRoomTenantID` int(11) NOT NULL AUTO_INCREMENT,
  `intRoomID` int(11) NOT NULL,
  `strTenantID` varchar(10) NOT NULL,
  `dblDeposit` double NOT NULL,
  `strSignedContract` longtext NOT NULL,
  `datDateRented` date NOT NULL,
  PRIMARY KEY (`intRoomTenantID`),
  KEY `roomTenantRoomID_FK_idx` (`intRoomID`),
  KEY `roomTenantTenantID_FK_idx` (`strTenantID`),
  CONSTRAINT `roomTenantRoomID_FK` FOREIGN KEY (`intRoomID`) REFERENCES `tbl_rooms` (`intRoomID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `roomTenantTenantID_FK` FOREIGN KEY (`strTenantID`) REFERENCES `tbl_tenant_accounts` (`strTenantId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_rooms`
--

DROP TABLE IF EXISTS `tbl_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_rooms` (
  `intRoomID` int(11) NOT NULL AUTO_INCREMENT,
  `intLandlordID` int(11) NOT NULL,
  `strLocation` varchar(200) NOT NULL,
  `dblMonthlyFee` double NOT NULL,
  `intPaxCapacity` int(11) NOT NULL,
  `booCR` tinyint(1) NOT NULL DEFAULT '0',
  `booKitchen` tinyint(1) NOT NULL DEFAULT '0',
  `booGarage` tinyint(1) NOT NULL DEFAULT '0',
  `intBedrooms` int(11) NOT NULL,
  `strDownPaymentRule` varchar(200) NOT NULL,
  `booOwnMeter` tinyint(1) NOT NULL DEFAULT '0',
  `booStatus` tinyint(1) NOT NULL,
  PRIMARY KEY (`intRoomID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_rooms_picture`
--

DROP TABLE IF EXISTS `tbl_rooms_picture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_rooms_picture` (
  `intRoomPictureID` int(11) NOT NULL AUTO_INCREMENT,
  `intRoomID` int(11) NOT NULL,
  `strPicture` longtext NOT NULL,
  `strPictureDesc` varchar(200) NOT NULL,
  PRIMARY KEY (`intRoomPictureID`),
  KEY `RoomPicture_FK_idx` (`intRoomID`),
  CONSTRAINT `RoomPicture_FK` FOREIGN KEY (`intRoomID`) REFERENCES `tbl_rooms` (`intRoomID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_tenant_accounts`
--

DROP TABLE IF EXISTS `tbl_tenant_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_tenant_accounts` (
  `strTenantId` varchar(10) NOT NULL,
  `strFirstName` varchar(20) NOT NULL,
  `strMiddleName` varchar(20) DEFAULT NULL,
  `strLastName` varchar(20) NOT NULL,
  `strValidID` longtext NOT NULL,
  `strContactNo` varchar(20) NOT NULL,
  `strEmail` varchar(30) NOT NULL,
  `strUsername` varchar(15) NOT NULL,
  `strPassword` varchar(20) NOT NULL,
  `strAddress` varchar(50) NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`strTenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tbl_with_submeter`
--

DROP TABLE IF EXISTS `tbl_with_submeter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_with_submeter` (
  `intWithSubmeterID` int(11) NOT NULL AUTO_INCREMENT,
  `intRoomTenantID` int(11) NOT NULL,
  `intEPrevRead` int(11) NOT NULL,
  `intECurrRead` int(11) NOT NULL,
  `intKwhUsage` int(11) NOT NULL,
  `intWPrevRead` int(11) NOT NULL,
  `intWCurrRead` int(11) NOT NULL,
  `intCubicMeterUsage` int(11) NOT NULL,
  PRIMARY KEY (`intWithSubmeterID`),
  KEY `roomTenantInfo_FK_idx` (`intRoomTenantID`),
  CONSTRAINT `roomTenantInfo_FK` FOREIGN KEY (`intRoomTenantID`) REFERENCES `tbl_room_tenant` (`intRoomTenantID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'mayora'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-04-01 23:31:52
