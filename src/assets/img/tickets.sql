-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 17, 2025 at 06:59 PM
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
(20, 11, 'Nguyen Thi C', NULL, NULL, NULL, '2024-09-17', 'Female', 'Infant', 18, NULL, 77, '10kg', 'Active', 'departure');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`ticket_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `price_id` (`price_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `ticket_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`price_id`) REFERENCES `flight_prices` (`price_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
