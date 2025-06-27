const BookingModel = require("../models/bookingModel");

class BookingController {
  static async layTatCaDatVe(req, res) {
    try {
      const bookings = await BookingModel.getAllBookings();
      res.status(200).json({
        message: "Lấy tất cả đặt vé thành công",
        data: bookings,
      });
    } catch (error) {
      console.error("Lỗi khi lấy tất cả đặt vé:", error);
      res.status(500).json({ message: "Lỗi server khi lấy danh sách đặt vé" });
    }
  }

  static async taoDatVe(req, res) {
    try {
      const {
        userId,
        departureScheduleId,
        returnScheduleId,
        numPassengers,
        totalPrice,
        passengers,
        tripType,
        selectedReturnTicket,
      } = req.body;


      if (
        !userId ||
        !departureScheduleId ||
        !numPassengers ||
        !totalPrice ||
        !passengers ||
        !Array.isArray(passengers)
      ) {
        return res.status(400).json({ message: "Thiếu các trường bắt buộc" });
      }

      const hasChildrenOrInfants = passengers.some(
        (p) => p.passenger_type === "Child" || p.passenger_type === "Infant"
      );
      const hasAdults = passengers.some((p) => p.passenger_type === "Adult");
      if (hasChildrenOrInfants && !hasAdults) {
        return res.status(400).json({
          message: "Trẻ em hoặc em bé phải có ít nhất một người lớn đi cùng",
        });
      }

  
      for (const hanhKhach of passengers) {
        if (!["Adult", "Child", "Infant"].includes(hanhKhach.passenger_type)) {
          return res.status(400).json({
            message: `Loại hành khách không hợp lệ: ${hanhKhach.passenger_type}`,
          });
        }
        if (
          hanhKhach.passenger_type === "Adult" &&
          (!hanhKhach.email || !hanhKhach.phone || !hanhKhach.cccd)
        ) {
          return res.status(400).json({
            message: "Hành khách người lớn cần email, số điện thoại và CCCD",
          });
        }
        if (
          !hanhKhach.price_id_departure ||
          (tripType === "round-trip" && !hanhKhach.price_id_return)
        ) {
          return res
            .status(400)
            .json({ message: "Price ID là bắt buộc cho mỗi hành khách" });
        }

        if (
          !hanhKhach.full_name ||
          !hanhKhach.date_of_birth ||
          !hanhKhach.gender
        ) {
          return res.status(400).json({
            message:
              "Thiếu thông tin bắt buộc: họ tên, ngày sinh, hoặc giới tính",
          });
        }
      }

   
      let extendedPassengers = passengers;
      if (tripType === "round-trip") {
        extendedPassengers = [];
        passengers.forEach((p) => {
          extendedPassengers.push({
            ...p,
            flight_direction: "departure",
            price_id: p.price_id_departure,
          });
          extendedPassengers.push({
            ...p,
            flight_direction: "return",
            price_id: p.price_id_return,
          });
        });
      } else {
        extendedPassengers = passengers.map((p) => ({
          ...p,
          flight_direction: "departure",
          price_id: p.price_id_departure,
        }));
      }


      const { bookingId, maDatVe, ticketIds } = await BookingModel.taoDatVe({
        userId,
        departureScheduleId,
        returnScheduleId,
        numPassengers,
        totalPrice,
        passengers: extendedPassengers,
        tripType,
      });


      const chiTietDatVe = await BookingModel.layDatVeTheoId(bookingId);

      res.status(201).json({
        message: "Tạo đặt vé thành công",
        bookingId,
        maDatVe,
        ticketIds,
        chiTietDatVe,
      });
    } catch (error) {
      console.error("Lỗi khi tạo đặt vé:", error);
      return res.status(400).json({
        message: error.message || "Lỗi khi tạo đặt vé server",
      });
    }
  }
  static async timKiemDatVeTheoMa(req, res) {
    try {
      const result = await BookingModel.timKiemDatVeTheoMa(req, res);
      return result;
    } catch (error) {
      console.error("Lỗi Controller:", error);
      return res.status(500).json({ message: "Lỗi khi tìm kiếm đặt vé" });
    }
  }
  static async deleteBooking(req, res) {
    try {
      const { bookingId } = req.params;
      if (!bookingId) {
        return res.status(400).json({ message: "Missing bookingId to delete" });
      }

      const result = await BookingModel.deleteBookingById(bookingId);

      res.status(200).json({
        message: "Booking deleted successfully",
        result,
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({
        message: "Server error while deleting booking",
      });
    }
  }
}

module.exports = BookingController;
