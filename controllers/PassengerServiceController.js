const PassengerService = require("../models/PassengerService");

class PassengerServiceController {
  static async getSeatMap(req, res) {
    try {
      const { schedule_id } = req.query;
      if (!schedule_id) {
        return res.status(400).json({ message: "Yêu cầu ID lịch trình" });
      }
      const seatMap = await PassengerService.getSeatMap(schedule_id);
      res.set("Cache-Control", "no-store");
      res.status(200).json({ seatMap });
    } catch (error) {
      console.error("Lỗi trong getSeatMap:", error);
      res.status(500).json({ message: error.message || "Lỗi server" });
    }
  }

  static async assignSeat(req, res) {
    try {
      const {
        bookingId,
        passengerId,
        fullName,
        flightDirection,
        seatNumber,
        scheduleId,
        passengerTicketType,
      } = req.body;
      if (
        !bookingId ||
        !passengerId ||
        !fullName ||
        !flightDirection ||
        !seatNumber ||
        !scheduleId
      ) {
        return res.status(400).json({ message: "Thiếu các trường bắt buộc" });
      }
      const result = await PassengerService.assignSeat(
        bookingId,
        passengerId,
        fullName,
        flightDirection,
        seatNumber,
        scheduleId,
        passengerTicketType
      );
      res
        .status(200)
        .json({ seatNumber: result.seatNumber, message: "Gán ghế thành công" });
    } catch (error) {
      console.error("Lỗi trong assignSeat:", error);
      res.status(409).json({ message: error.message || "Không thể gán ghế" });
    }
  }
}

module.exports = PassengerServiceController;
