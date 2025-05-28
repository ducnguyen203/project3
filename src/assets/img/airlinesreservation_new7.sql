-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 19, 2025 at 09:51 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `airlinesreservation_new`
--

-- --------------------------------------------------------

--
-- Table structure for table `airplanes`
--

CREATE TABLE `airplanes` (
  `airplane_id` int NOT NULL,
  `model` varchar(50) NOT NULL,
  `capacity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `airplanes`
--

INSERT INTO `airplanes` (`airplane_id`, `model`, `capacity`) VALUES
(1, 'Boeing 737', 180),
(2, 'Airbus A320', 160),
(3, 'Boeing 787', 250),
(4, 'Airbus A350', 300),
(5, 'Boeing 777', 350),
(6, 'Airbus A330', 280),
(7, 'Embraer E190', 120),
(8, 'Boeing 747', 400),
(9, 'Airbus A321', 190),
(10, 'Bombardier CRJ900', 90);

-- --------------------------------------------------------

--
-- Table structure for table `airports`
--

CREATE TABLE `airports` (
  `airport_id` int NOT NULL,
  `airport_name` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL,
  `airport_code` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `airports`
--

INSERT INTO `airports` (`airport_id`, `airport_name`, `city`, `country`, `airport_code`) VALUES
(1, 'Sân bay Nội Bài', 'Hà Nội', 'Việt Nam', 'HAN'),
(2, 'Sân bay Tân Sơn Nhất', 'TP. Hồ Chí Minh', 'Việt Nam', 'SGN'),
(3, 'Sân bay Đà Nẵng', 'Đà Nẵng', 'Việt Nam', 'DAD'),
(4, 'Sân bay Cam Ranh', 'Khánh Hòa', 'Việt Nam', 'CXR'),
(5, 'Sân bay Phú Quốc', 'Phú Quốc', 'Việt Nam', 'PQC'),
(6, 'Sân bay Liên Khương', 'Lâm Đồng', 'Việt Nam', 'DLI'),
(7, 'Sân bay Phú Bài', 'Huế', 'Việt Nam', 'HUI'),
(8, 'Sân bay Cát Bi', 'Hải Phòng', 'Việt Nam', 'HPH'),
(9, 'Sân bay Tuy Hòa', 'Phú Yên', 'Việt Nam', 'UIH'),
(10, 'Sân bay Vinh', 'Nghệ An', 'Việt Nam', 'VII');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int NOT NULL,
  `booking_code` varchar(20) DEFAULT NULL,
  `user_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `num_passengers` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('Pending','Confirmed','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `departure_schedule_id` int NOT NULL,
  `return_schedule_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `booking_code`, `user_id`, `schedule_id`, `num_passengers`, `total_price`, `status`, `created_at`, `departure_schedule_id`, `return_schedule_id`) VALUES
(1, NULL, 1, 1, 1, '200.00', 'Pending', '2025-04-11 13:34:37', 1, 2),
(2, NULL, 2, 2, 2, '400.00', 'Pending', '2025-04-11 13:34:37', 1, 2),
(3, 'BKG1ZBESKG', 1, 1, 2, '500.00', 'Pending', '2025-05-17 10:32:04', 1, NULL),
(4, 'BKZIMG2T2G', 1, 1, 3, '750.00', 'Pending', '2025-05-17 10:33:16', 1, 2),
(5, 'BKKVOXSHTH', 1, 1, 4, '1000.00', 'Pending', '2025-05-17 10:42:51', 1, 2),
(6, 'BKC5MQLOUP', 1, 24, 2, '1560.00', 'Pending', '2025-05-17 11:16:43', 24, 18),
(7, 'BK4HW84WCJ', 1, 24, 1, '780.00', 'Pending', '2025-05-17 11:47:14', 24, 18),
(8, 'BK9XKDPM01', 1, 24, 1, '780.00', 'Pending', '2025-05-17 18:19:15', 24, 18),
(11, 'BKCTAML6RS', 1, 24, 3, '600.00', 'Pending', '2025-05-17 18:51:50', 24, NULL),
(14, 'BK6H4KQVMB', 1, 24, 2, '540.00', 'Pending', '2025-05-17 19:37:06', 24, NULL),
(15, 'BKSQALNU68', 1, 24, 4, '2020.00', 'Pending', '2025-05-18 17:42:11', 24, 19),
(16, 'BKO6T8O93K', 1, 24, 2, '400.00', 'Pending', '2025-05-18 17:44:23', 24, NULL),
(17, 'BKISBFDE1J', 1, 24, 2, '400.00', 'Pending', '2025-05-18 17:46:13', 24, NULL),
(18, 'BKRG460NIC', 1, 24, 3, '1500.00', 'Pending', '2025-05-18 18:09:56', 24, NULL),
(19, 'BKHBTI1PAA', 1, 24, 1, '270.00', 'Pending', '2025-05-18 18:18:33', 24, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `flights`
--

CREATE TABLE `flights` (
  `flight_id` int NOT NULL,
  `flight_code` varchar(20) NOT NULL,
  `airplane_id` int NOT NULL,
  `departure_airport_id` int NOT NULL,
  `arrival_airport_id` int NOT NULL,
  `status` enum('On Time','Delayed','Cancelled') DEFAULT 'On Time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `flights`
--

INSERT INTO `flights` (`flight_id`, `flight_code`, `airplane_id`, `departure_airport_id`, `arrival_airport_id`, `status`) VALUES
(1, 'VN101', 1, 1, 2, 'On Time'),
(2, 'VN202', 2, 3, 4, 'Delayed'),
(3, 'VN201', 1, 1, 2, 'On Time'),
(4, 'VN203', 1, 2, 1, 'On Time'),
(10, 'VN306', 3, 1, 10, 'On Time'),
(11, 'VN307', 4, 2, 9, 'Delayed'),
(12, 'VN308', 5, 3, 8, 'On Time'),
(13, 'VN309', 1, 10, 1, 'Cancelled'),
(14, 'VN310', 2, 8, 3, 'On Time');

-- --------------------------------------------------------

--
-- Table structure for table `flight_prices`
--

CREATE TABLE `flight_prices` (
  `price_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `ticket_type_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `flight_prices`
--

INSERT INTO `flight_prices` (`price_id`, `schedule_id`, `ticket_type_id`, `price`) VALUES
(1, 1, 1, '150.00'),
(2, 2, 2, '300.00'),
(9, 8, 1, '250.00'),
(10, 9, 2, '400.00'),
(11, 10, 1, '200.00'),
(12, 11, 2, '450.00'),
(13, 12, 1, '300.00'),
(23, 1, 2, '250.00'),
(24, 1, 3, '450.00'),
(25, 2, 1, '250.00'),
(26, 2, 3, '450.00'),
(27, 8, 2, '350.00'),
(28, 8, 3, '450.00'),
(29, 9, 1, '250.00'),
(30, 9, 2, '300.00'),
(31, 10, 2, '250.00'),
(32, 10, 3, '450.00'),
(33, 11, 1, '350.00'),
(34, 11, 2, '400.00'),
(35, 12, 2, '350.00'),
(36, 12, 3, '450.00'),
(37, 4, 1, '250.00'),
(38, 4, 2, '250.00'),
(39, 4, 3, '450.00'),
(40, 2, 1, '250.00'),
(41, 3, 2, '450.00'),
(42, 3, 3, '650.00'),
(43, 3, 1, '250.00'),
(44, 13, 1, '200.00'),
(45, 13, 2, '350.00'),
(46, 13, 3, '500.00'),
(47, 14, 1, '200.00'),
(48, 14, 2, '350.00'),
(49, 14, 3, '500.00'),
(50, 15, 1, '220.00'),
(51, 15, 2, '370.00'),
(52, 15, 3, '520.00'),
(53, 16, 1, '220.00'),
(54, 16, 2, '370.00'),
(55, 16, 3, '520.00'),
(56, 17, 1, '220.00'),
(57, 17, 2, '370.00'),
(58, 17, 3, '520.00'),
(59, 18, 1, '220.00'),
(60, 18, 2, '370.00'),
(61, 18, 3, '510.00'),
(62, 19, 1, '220.00'),
(63, 19, 2, '370.00'),
(64, 19, 3, '510.00'),
(65, 20, 1, '200.00'),
(66, 20, 2, '270.00'),
(67, 20, 3, '500.00'),
(68, 21, 1, '200.00'),
(69, 21, 2, '270.00'),
(70, 21, 3, '500.00'),
(71, 22, 1, '200.00'),
(72, 22, 2, '270.00'),
(73, 22, 3, '500.00'),
(74, 23, 1, '200.00'),
(75, 23, 2, '270.00'),
(76, 23, 3, '500.00'),
(77, 24, 1, '200.00'),
(78, 24, 2, '270.00'),
(79, 24, 3, '500.00'),
(80, 25, 1, '200.00'),
(81, 25, 2, '270.00'),
(82, 25, 3, '500.00'),
(83, 26, 1, '200.00'),
(84, 26, 2, '270.00'),
(85, 26, 3, '500.00'),
(86, 27, 1, '200.00'),
(87, 27, 2, '270.00'),
(88, 27, 3, '500.00'),
(89, 28, 1, '200.00'),
(90, 28, 2, '270.00'),
(91, 28, 3, '500.00'),
(92, 29, 1, '200.00'),
(93, 29, 2, '270.00'),
(94, 29, 3, '500.00'),
(95, 30, 1, '200.00'),
(96, 30, 2, '270.00'),
(97, 30, 3, '500.00'),
(98, 31, 1, '200.00'),
(99, 31, 2, '270.00'),
(100, 31, 3, '500.00'),
(101, 32, 1, '200.00'),
(102, 32, 2, '270.00'),
(103, 32, 3, '500.00'),
(104, 33, 1, '200.00'),
(105, 33, 2, '270.00'),
(106, 33, 3, '500.00'),
(107, 34, 1, '200.00'),
(108, 34, 2, '270.00'),
(109, 34, 3, '500.00'),
(110, 35, 1, '200.00'),
(111, 35, 2, '270.00'),
(112, 35, 3, '500.00'),
(113, 36, 1, '200.00'),
(114, 36, 2, '270.00'),
(115, 36, 3, '500.00'),
(116, 37, 1, '200.00'),
(117, 37, 2, '270.00'),
(118, 37, 3, '500.00'),
(119, 38, 1, '200.00'),
(120, 38, 2, '270.00'),
(121, 38, 3, '500.00'),
(122, 39, 1, '200.00'),
(123, 39, 2, '270.00'),
(124, 39, 3, '500.00'),
(125, 40, 1, '200.00'),
(126, 40, 2, '270.00'),
(127, 40, 3, '500.00'),
(128, 41, 1, '200.00'),
(129, 41, 2, '270.00'),
(130, 41, 3, '500.00'),
(131, 42, 1, '200.00'),
(132, 42, 2, '270.00'),
(133, 42, 3, '500.00'),
(134, 43, 1, '200.00'),
(135, 43, 2, '270.00'),
(136, 43, 3, '500.00'),
(137, 44, 1, '200.00'),
(138, 44, 2, '270.00'),
(139, 44, 3, '500.00'),
(140, 45, 1, '200.00'),
(141, 45, 2, '270.00'),
(142, 45, 3, '500.00'),
(143, 46, 1, '200.00'),
(144, 46, 2, '270.00'),
(145, 46, 3, '500.00'),
(146, 47, 1, '200.00'),
(147, 47, 2, '270.00'),
(148, 47, 3, '500.00'),
(149, 48, 1, '200.00'),
(150, 48, 2, '270.00'),
(151, 48, 3, '500.00'),
(152, 49, 1, '200.00'),
(153, 49, 2, '270.00'),
(154, 49, 3, '500.00'),
(155, 50, 1, '200.00'),
(156, 50, 2, '270.00'),
(157, 50, 3, '500.00'),
(158, 51, 1, '200.00'),
(159, 51, 2, '270.00'),
(160, 51, 3, '500.00'),
(161, 52, 1, '200.00'),
(162, 52, 2, '270.00'),
(163, 52, 3, '500.00'),
(164, 53, 1, '200.00'),
(165, 53, 2, '270.00'),
(166, 53, 3, '500.00'),
(167, 54, 1, '200.00'),
(168, 54, 2, '270.00'),
(169, 54, 3, '500.00'),
(170, 55, 1, '200.00'),
(171, 55, 2, '270.00'),
(172, 55, 3, '500.00'),
(173, 56, 1, '200.00'),
(174, 56, 2, '270.00'),
(175, 56, 3, '500.00'),
(176, 57, 1, '200.00'),
(177, 57, 2, '270.00'),
(178, 57, 3, '500.00'),
(179, 58, 1, '200.00'),
(180, 58, 2, '270.00'),
(181, 58, 3, '500.00'),
(182, 59, 1, '200.00'),
(183, 59, 2, '270.00'),
(184, 59, 3, '500.00'),
(185, 60, 1, '200.00'),
(186, 60, 2, '270.00'),
(187, 60, 3, '500.00'),
(188, 61, 1, '200.00'),
(189, 61, 2, '270.00'),
(190, 61, 3, '500.00'),
(191, 62, 1, '200.00'),
(192, 62, 2, '270.00'),
(193, 62, 3, '500.00'),
(194, 63, 1, '200.00'),
(195, 63, 2, '270.00'),
(196, 63, 3, '500.00'),
(197, 64, 1, '200.00'),
(198, 64, 2, '270.00'),
(199, 64, 3, '500.00'),
(200, 65, 1, '200.00'),
(201, 65, 2, '270.00'),
(202, 65, 3, '500.00'),
(203, 66, 1, '200.00'),
(204, 66, 2, '270.00'),
(205, 66, 3, '500.00'),
(206, 67, 1, '200.00'),
(207, 67, 2, '270.00'),
(208, 67, 3, '500.00'),
(209, 68, 1, '200.00'),
(210, 68, 2, '270.00'),
(211, 68, 3, '500.00'),
(212, 69, 1, '200.00'),
(213, 69, 2, '270.00'),
(214, 69, 3, '500.00');

-- --------------------------------------------------------

--
-- Table structure for table `loyaltypoints`
--

CREATE TABLE `loyaltypoints` (
  `user_id` int NOT NULL,
  `total_points` int DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `loyaltypoints`
--

INSERT INTO `loyaltypoints` (`user_id`, `total_points`, `last_updated`) VALUES
(1, 1000, '2025-03-30 10:16:51'),
(2, 500, '2025-03-30 10:16:51');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `amount` decimal(10,2) NOT NULL,
  `payment_status` enum('Pending','Completed','Failed') DEFAULT 'Pending',
  `payment_method` enum('VNPAY','Momo','PayPal','Stripe') NOT NULL,
  `transaction_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedule_id` int NOT NULL,
  `flight_id` int NOT NULL,
  `departure_date` date NOT NULL,
  `departure_time` time NOT NULL,
  `arrival_time` time NOT NULL,
  `duration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `flight_id`, `departure_date`, `departure_time`, `arrival_time`, `duration`) VALUES
(1, 1, '2025-05-01', '10:00:00', '12:00:00', 120),
(2, 2, '2025-05-02', '14:00:00', '13:00:00', 150),
(3, 3, '2025-05-01', '10:00:00', '11:30:00', 120),
(4, 4, '2025-05-05', '14:00:00', '14:20:00', 120),
(8, 10, '2025-06-10', '09:00:00', '11:00:00', 120),
(9, 11, '2025-06-11', '10:00:00', '12:00:00', 120),
(10, 12, '2025-06-12', '11:00:00', '13:00:00', 120),
(11, 13, '2025-06-13', '12:00:00', '14:00:00', 120),
(12, 14, '2025-06-14', '13:00:00', '15:00:00', 120),
(13, 1, '2025-06-15', '08:00:00', '10:00:00', 120),
(14, 1, '2025-06-15', '08:00:00', '10:00:00', 120),
(15, 4, '2025-06-20', '14:00:00', '16:00:00', 120),
(16, 1, '2025-06-21', '14:00:00', '16:00:00', 120),
(17, 1, '2025-06-21', '13:00:00', '16:00:00', 120),
(18, 4, '2025-06-22', '13:00:00', '16:00:00', 120),
(19, 4, '2025-06-22', '20:00:00', '23:00:00', 120),
(20, 4, '2025-06-22', '06:00:00', '08:00:00', 120),
(21, 4, '2025-06-22', '02:00:00', '04:00:00', 120),
(22, 4, '2025-06-22', '00:00:00', '04:00:00', 120),
(23, 4, '2025-06-22', '12:00:00', '13:00:00', 120),
(24, 1, '2025-06-22', '12:00:00', '13:00:00', 120),
(25, 1, '2025-06-22', '14:00:00', '16:00:00', 120),
(26, 1, '2025-06-22', '00:00:00', '01:00:00', 120),
(27, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(28, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(29, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(30, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(31, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(32, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(33, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(34, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(35, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(36, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(37, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(38, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(39, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(40, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(41, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(42, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(43, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(44, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(45, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(46, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(47, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(48, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(49, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(50, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(51, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(52, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(53, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(54, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(55, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(56, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(57, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(58, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(59, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(60, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(61, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(62, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(63, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(64, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(65, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(66, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(67, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(68, 1, '2025-06-22', '02:00:00', '02:30:00', 120),
(69, 1, '2025-06-22', '02:00:00', '02:30:00', 120);

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `ticket_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cccd` varchar(20) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `passenger_type` enum('Adult','Child','Infant') NOT NULL,
  `accompanying_adult_ticket_id` int DEFAULT NULL,
  `seat_number` varchar(10) DEFAULT NULL,
  `price_id` int NOT NULL,
  `baggage_allowance` varchar(50) DEFAULT NULL,
  `status` enum('Active','Cancelled','Changed','Refunded') DEFAULT 'Active',
  `flight_direction` enum('departure','return') DEFAULT 'departure'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`ticket_id`, `booking_id`, `full_name`, `email`, `phone`, `cccd`, `date_of_birth`, `gender`, `passenger_type`, `accompanying_adult_ticket_id`, `seat_number`, `price_id`, `baggage_allowance`, `status`, `flight_direction`) VALUES
(1, 1, 'Nguyễn Văn A', NULL, NULL, NULL, '1990-01-01', 'Male', 'Adult', NULL, '1A', 1, '20kg', 'Active', 'departure'),
(2, 2, 'Nguyễn Văn B', NULL, NULL, NULL, '1995-05-05', 'Female', 'Adult', NULL, '1B', 2, '20kg', 'Active', 'departure'),
(3, 3, 'Nguyen Van A', 'vana@gmail.com', '+84987654321', '123456789012', '1990-01-01', 'Male', 'Adult', NULL, NULL, 1, '20kg', 'Active', 'departure'),
(4, 3, 'Nguyen Thi B', NULL, NULL, NULL, '2015-01-01', 'Female', 'Child', NULL, NULL, 25, '15kg', 'Active', 'departure'),
(5, 4, 'Nguyen Van A', 'vana@gmail.com', '+84987654321', '123456789012', '1990-01-01', 'Male', 'Adult', NULL, NULL, 1, '20kg', 'Active', 'departure'),
(6, 4, 'Nguyen Thi B', NULL, NULL, NULL, '2015-01-01', 'Female', 'Child', NULL, NULL, 25, '15kg', 'Active', 'departure'),
(7, 4, 'Nguyen Van C', NULL, NULL, NULL, '2023-01-01', 'Male', 'Infant', NULL, NULL, 26, '10kg', 'Active', 'return'),
(8, 5, 'Nguyen Van A', 'vana@gmail.com', '+84987654321', '123456789012', '1990-01-01', 'Male', 'Adult', NULL, NULL, 1, '20kg', 'Active', 'departure'),
(9, 5, 'Nguyen Van A', 'vana@gmail.com', '+84987654321', '123456789012', '1990-01-01', 'Male', 'Adult', NULL, NULL, 2, '20kg', 'Active', 'return'),
(10, 5, 'Nguyen Thi B', NULL, NULL, NULL, '2015-01-01', 'Female', 'Child', NULL, NULL, 25, '15kg', 'Active', 'departure'),
(11, 5, 'Nguyen Thi B', NULL, NULL, NULL, '2015-01-01', 'Female', 'Child', NULL, NULL, 26, '15kg', 'Active', 'return'),
(12, 6, 'dfdsfdsfsdfsdfsd', 'sadasdas@gmail.com', '868995002', '02162656', '2013-05-01', 'Male', 'Adult', NULL, NULL, 78, '20kg', 'Active', 'departure'),
(13, 6, 'sonnguegeda', NULL, NULL, NULL, '2023-05-10', 'Male', 'Child', NULL, NULL, 61, '15kg', 'Active', 'return'),
(14, 7, 'nguyen anh duc', 'ducnguyen@gmail.com', '0868995003', '001203021590', '2013-05-15', 'Male', 'Adult', NULL, NULL, 78, '20kg', 'Active', 'departure'),
(15, 8, 'nguyenanhduc', 'sonxi2k3@gmail.com', '0868995003', '001203021590', '2009-05-05', 'Male', 'Adult', NULL, NULL, 78, '20kg', 'Active', 'departure'),
(18, 11, 'Nguyen Van D', 'nguyenvand@gmail.com', '0868995002', '001203021896', '1984-02-15', 'Male', 'Adult', NULL, NULL, 77, '20kg', 'Active', 'departure'),
(19, 11, 'Nguyen Van S', NULL, NULL, NULL, '2019-01-03', 'Male', 'Child', 18, NULL, 77, '15kg', 'Active', 'departure'),
(20, 11, 'Nguyen Thi C', NULL, NULL, NULL, '2024-09-17', 'Female', 'Infant', 18, NULL, 77, '10kg', 'Active', 'departure'),
(23, 14, 'Nguyen Truong Son', 'Son@gmail.com', '0868995001', '001203021569', '2013-05-08', 'Male', 'Adult', NULL, NULL, 78, '20kg', 'Active', 'departure'),
(24, 14, 'Nguyen Thi Ngoc ANh', NULL, NULL, NULL, '2023-05-11', 'Female', 'Child', 23, NULL, 78, '15kg', 'Active', 'departure'),
(25, 15, 'Nguyen Truong Son', 'sonxi@gmail.com', '0868995003', '001203021456', '2013-04-30', 'Male', 'Adult', NULL, NULL, 79, '20kg', 'Active', 'departure'),
(26, 15, 'Nguyen Truong Son', 'sonxi@gmail.com', '0868995003', '001203021456', '2013-04-30', 'Male', 'Adult', NULL, NULL, 64, '20kg', 'Active', 'return'),
(27, 15, 'NGuyen Ngoc Anh', NULL, NULL, NULL, '2023-05-03', 'Female', 'Child', 25, NULL, 79, '15kg', 'Active', 'departure'),
(28, 15, 'NGuyen Ngoc Anh', NULL, NULL, NULL, '2023-05-03', 'Female', 'Child', 26, NULL, 64, '15kg', 'Active', 'return'),
(29, 16, 'Nguyen ANh Duc', 'ducnguyen@gmail.com', '0868995001', '00212003256', '2013-05-01', 'Male', 'Adult', NULL, NULL, 77, '20kg', 'Active', 'departure'),
(30, 16, 'Phung Gia Han', NULL, NULL, NULL, '2025-05-05', 'Female', 'Infant', 29, NULL, 77, '10kg', 'Active', 'departure'),
(31, 17, 'duc', 'ducke@gmail.com', '0868995001', '00120302156', '2013-05-16', 'Male', 'Adult', NULL, NULL, 77, '20kg', 'Active', 'departure'),
(32, 17, 'Phung Gia Han', NULL, NULL, NULL, '2024-01-16', 'Female', 'Infant', 31, NULL, 77, '10kg', 'Active', 'departure'),
(33, 18, 'NGuyen Van Em', 'em@gmail.com', '08986235', '001203021456', '2013-05-01', 'Male', 'Adult', NULL, NULL, 79, '20kg', 'Active', 'departure'),
(34, 18, 'Nguyen Van A', NULL, NULL, NULL, '2023-05-10', 'Male', 'Child', 33, NULL, 79, '15kg', 'Active', 'departure'),
(35, 18, 'NGuyen Thi B', NULL, NULL, NULL, '2025-05-14', 'Female', 'Infant', 33, NULL, 79, '10kg', 'Active', 'departure'),
(36, 19, 'dsadasdasd', 'sdasdasdas@gmail.com', '542543242', '542452452424', '2013-05-14', 'Male', 'Adult', NULL, NULL, 78, '20kg', 'Active', 'departure');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_changes`
--

CREATE TABLE `ticket_changes` (
  `change_id` int NOT NULL,
  `ticket_id` int NOT NULL,
  `old_schedule_id` int NOT NULL,
  `new_schedule_id` int DEFAULT NULL,
  `change_type` enum('Cancelled','Changed','Refunded') NOT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `change_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticket_changes`
--

INSERT INTO `ticket_changes` (`change_id`, `ticket_id`, `old_schedule_id`, `new_schedule_id`, `change_type`, `refund_amount`, `change_date`) VALUES
(1, 1, 1, NULL, 'Changed', NULL, '2025-04-11 13:35:14'),
(2, 2, 2, NULL, 'Cancelled', NULL, '2025-04-11 13:35:14');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_types`
--

CREATE TABLE `ticket_types` (
  `ticket_type_id` int NOT NULL,
  `ticket_type` enum('Economy','Business','First Class') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticket_types`
--

INSERT INTO `ticket_types` (`ticket_type_id`, `ticket_type`) VALUES
(1, 'Economy'),
(2, 'Business'),
(3, 'First Class');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `dob` date DEFAULT NULL,
  `skymiles` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` enum('admin','user') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `dob`, `skymiles`, `created_at`, `role`) VALUES
(1, 'Nguyễn Văn A', 'vana@example.com', 'passwordA', '0123456789', '123 Đường ABC, Hà Nội', '1990-01-01', 1000, '2023-01-01 03:00:00', 'user'),
(2, 'Nguyen Van Anh ', 'nguyenvananhduc@example.com', '$2b$10$UDq2WzpNCBsXSkgLa4UdQeRiFYcOD63z6hoiQ0OlBxH9GpyxJjvem', '0123456789', NULL, NULL, 0, '2025-03-30 08:54:29', 'admin'),
(3, 'Nguyen anh duc', 'duc123@gmail.com', '$2b$10$B7y9WCkxJDId8/zeIhcIGOHXY2Me/05lfTrKwCY0SM9VtUTNs01j2', '0987654321', NULL, NULL, 0, '2025-04-12 08:43:25', 'user'),
(4, 'nguyen van c', 'nguyenc@gmail.com', '$2b$10$F3/2Wk1vgRw1eG.O7zQnH.V.mFZ3XPvsWgI1QVHWbX000S9lXyCLy', '02345678', NULL, NULL, 0, '2025-04-12 08:48:01', 'user'),
(5, 'nguyen van d', 'nguyend@gmail.com', '$2b$10$xH5FBcibszytTHs6htQ7sOgB95uPnRcr1EJEf5cKI.X70XGRy2Kia', '02314568', NULL, NULL, 0, '2025-04-12 08:53:15', 'user'),
(6, 'nguyenvanv', 'nguyenv@gmail.com', '$2b$10$WV6zICxX9BqTmxvUweW4U.K2y6TU6Onil2Qx0MLpVXu9uOx6uA7Ra', '0868995003', NULL, NULL, 0, '2025-04-12 08:53:52', 'user'),
(7, 'nguyen aaaa', 'nguyendd@gmail.com', '$2b$10$so/Ezx9JXQ32BXnfflljW./k27Plhz5PfEj9JH4SCkXIIawrJvPku', '02345678', NULL, NULL, 0, '2025-04-12 08:54:47', 'user'),
(8, 'nguyen anh duc', 'toidenday@gmail.com', '$2b$10$WQqHkKh/Xw9SpMpKEgkUYePmVkfKlJIljuaZU2URytYWdefBNj.rO', '02314568', NULL, NULL, 0, '2025-04-18 15:54:11', 'user'),
(9, 'thang dan', 'thangdan@gmail.com', '$2b$10$LYr0cpgH8klUGxnggzPxAO.IB4WXhdyoK60uyDTRc7I6nlRJaMFf.', '02314568', NULL, NULL, 0, '2025-04-22 07:24:42', 'user'),
(10, 'NGuyen van D', 'nguyenvand@gmail.com', '$2b$10$rnNPsQLgeHiyADd0BWwnJeA6DWnAJ3S2o6YAesi5kA2ReKPWdooci', '0868995223', NULL, NULL, 0, '2025-05-17 18:42:30', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `airplanes`
--
ALTER TABLE `airplanes`
  ADD PRIMARY KEY (`airplane_id`);

--
-- Indexes for table `airports`
--
ALTER TABLE `airports`
  ADD PRIMARY KEY (`airport_id`),
  ADD UNIQUE KEY `airport_code` (`airport_code`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `departure_schedule_id` (`departure_schedule_id`),
  ADD KEY `return_schedule_id` (`return_schedule_id`);

--
-- Indexes for table `flights`
--
ALTER TABLE `flights`
  ADD PRIMARY KEY (`flight_id`),
  ADD UNIQUE KEY `flight_code` (`flight_code`),
  ADD KEY `airplane_id` (`airplane_id`),
  ADD KEY `departure_airport_id` (`departure_airport_id`),
  ADD KEY `arrival_airport_id` (`arrival_airport_id`);

--
-- Indexes for table `flight_prices`
--
ALTER TABLE `flight_prices`
  ADD PRIMARY KEY (`price_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `ticket_type_id` (`ticket_type_id`);

--
-- Indexes for table `loyaltypoints`
--
ALTER TABLE `loyaltypoints`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `flight_id` (`flight_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`ticket_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `price_id` (`price_id`),
  ADD KEY `fk_accompanying_adult` (`accompanying_adult_ticket_id`);

--
-- Indexes for table `ticket_changes`
--
ALTER TABLE `ticket_changes`
  ADD PRIMARY KEY (`change_id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Indexes for table `ticket_types`
--
ALTER TABLE `ticket_types`
  ADD PRIMARY KEY (`ticket_type_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `airplanes`
--
ALTER TABLE `airplanes`
  MODIFY `airplane_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `airports`
--
ALTER TABLE `airports`
  MODIFY `airport_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `flights`
--
ALTER TABLE `flights`
  MODIFY `flight_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `flight_prices`
--
ALTER TABLE `flight_prices`
  MODIFY `price_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=215;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `ticket_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `ticket_changes`
--
ALTER TABLE `ticket_changes`
  MODIFY `change_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ticket_types`
--
ALTER TABLE `ticket_types`
  MODIFY `ticket_type_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`departure_schedule_id`) REFERENCES `schedules` (`schedule_id`),
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`return_schedule_id`) REFERENCES `schedules` (`schedule_id`);

--
-- Constraints for table `flights`
--
ALTER TABLE `flights`
  ADD CONSTRAINT `flights_ibfk_1` FOREIGN KEY (`airplane_id`) REFERENCES `airplanes` (`airplane_id`),
  ADD CONSTRAINT `flights_ibfk_2` FOREIGN KEY (`departure_airport_id`) REFERENCES `airports` (`airport_id`),
  ADD CONSTRAINT `flights_ibfk_3` FOREIGN KEY (`arrival_airport_id`) REFERENCES `airports` (`airport_id`);

--
-- Constraints for table `flight_prices`
--
ALTER TABLE `flight_prices`
  ADD CONSTRAINT `flight_prices_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `flight_prices_ibfk_2` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`ticket_type_id`);

--
-- Constraints for table `loyaltypoints`
--
ALTER TABLE `loyaltypoints`
  ADD CONSTRAINT `loyaltypoints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`flight_id`) REFERENCES `flights` (`flight_id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_accompanying_adult` FOREIGN KEY (`accompanying_adult_ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`price_id`) REFERENCES `flight_prices` (`price_id`);

--
-- Constraints for table `ticket_changes`
--
ALTER TABLE `ticket_changes`
  ADD CONSTRAINT `ticket_changes_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
