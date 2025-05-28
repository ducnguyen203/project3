const PassengerService = require("../models/PassengerService");

class PassengerServiceController {
  static async getSeatMap(req, res) {
    try {
      const { schedule_id } = req.query;
      if (!schedule_id) {
        return res.status(400).json({ message: "Yêu cầu ID lịch trình" });
      }
      const seatMap = await PassengerService.getSeatMap(schedule_id);
      res.json({ seatMap });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async assignSeat(req, res) {
    try {
      const { bookingId, passengerId, flightDirection, seatNumber } = req.body;
      if (!bookingId || !passengerId || !flightDirection || !seatNumber) {
        return res.status(400).json({ message: "Thiếu các trường bắt buộc" });
      }
      // Lấy schedule_id từ booking
      const scheduleQuery = `
        SELECT ${
          flightDirection === "departure"
            ? "departure_schedule_id"
            : "return_schedule_id"
        } AS schedule_id
        FROM bookings
        WHERE booking_id = ?
      `;
      const [scheduleResult] = await db.pool.query(scheduleQuery, [bookingId]);
      if (!scheduleResult.length) throw new Error("Không tìm thấy booking");
      const scheduleId = scheduleResult[0].schedule_id;

      const result = await PassengerService.assignSeat(
        bookingId,
        passengerId,
        flightDirection,
        seatNumber,
        scheduleId
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = PassengerServiceController;
