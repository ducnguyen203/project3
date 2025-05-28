const BookingModel = require("../models/bookingModel");

class BookingController {
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

      // Kiểm tra đầu vào
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

      // Kiểm tra số lượng hành khách
      const expectedPassengers =
        tripType === "round-trip" ? passengers.length * 2 : passengers.length;
      if (expectedPassengers !== numPassengers) {
        return res
          .status(400)
          .json({ message: "Số lượng hành khách không khớp" });
      }

      // Kiểm tra có ít nhất một người lớn nếu có trẻ em hoặc em bé
      const hasChildrenOrInfants = passengers.some(
        (p) => p.passenger_type === "Child" || p.passenger_type === "Infant"
      );
      const hasAdults = passengers.some((p) => p.passenger_type === "Adult");
      if (hasChildrenOrInfants && !hasAdults) {
        return res.status(400).json({
          message: "Trẻ em hoặc em bé phải có ít nhất một người lớn đi cùng",
        });
      }

      // Kiểm tra dữ liệu hành khách
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
        if (!hanhKhach.price_id) {
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

      // Tạo danh sách hành khách mở rộng cho round-trip
      let extendedPassengers = passengers;
      if (tripType === "round-trip") {
        extendedPassengers = [];
        passengers.forEach((p) => {
          extendedPassengers.push({
            ...p,
            flight_direction: "departure",
            price_id: p.price_id,
          });
          extendedPassengers.push({
            ...p,
            flight_direction: "return",
            price_id: selectedReturnTicket?.price_id || p.price_id,
          });
        });
      }

      // Tạo đặt vé
      const { bookingId, maDatVe, ticketIds } = await BookingModel.taoDatVe({
        userId,
        departureScheduleId,
        returnScheduleId,
        numPassengers,
        totalPrice,
        passengers: extendedPassengers,
        tripType,
      });

      // Lấy chi tiết đặt vé để phản hồi
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
        message: error.message || "Lỗi khi tạo đặt vé",
      });
    }
  }
}

module.exports = BookingController;
