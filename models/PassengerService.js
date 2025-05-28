const db = require("../config/db");

class PassengerService {
  static async getSeatMap(scheduleId) {
    try {
      // Lấy airplane_id từ schedules và flights
      const scheduleQuery = `
        SELECT f.airplane_id
        FROM schedules s
        JOIN flights f ON s.flight_id = f.flight_id
        WHERE s.schedule_id = ?
      `;
      const [scheduleResult] = await db.pool.query(scheduleQuery, [scheduleId]);
      if (!scheduleResult.length) throw new Error("Không tìm thấy lịch trình");

      const airplaneId = scheduleResult[0].airplane_id;

      // Lấy danh sách ghế từ seats và trạng thái từ seat_availability
      const seatQuery = `
        SELECT s.seat_id, s.seat_number, s.seat_type, sa.is_available
        FROM seats s
        LEFT JOIN seat_availability sa ON s.seat_id = sa.seat_id AND sa.schedule_id = ?
        WHERE s.airplane_id = ?
        ORDER BY s.seat_number
      `;
      const [seats] = await db.pool.query(seatQuery, [scheduleId, airplaneId]);

      // Tạo bản đồ ghế (6 cột: A-F)
      const seatMap = [];
      let currentRow = [];
      seats.forEach((seat, index) => {
        if (index % 6 === 0 && index !== 0) {
          seatMap.push(currentRow);
          currentRow = [];
        }
        currentRow.push({
          seatId: seat.seat_id,
          seat: seat.seat_number,
          seatType: seat.seat_type,
          available: seat.is_available ?? true,
        });
      });
      if (currentRow.length) seatMap.push(currentRow);

      return seatMap;
    } catch (error) {
      throw new Error(`Lỗi khi lấy bản đồ ghế: ${error.message}`);
    }
  }

  static async assignSeat(
    bookingId,
    passengerId,
    flightDirection,
    seatNumber,
    scheduleId
  ) {
    try {
      // Lấy ticket_id dựa trên booking_id và passenger_id
      const ticketQuery = `
      SELECT t.ticket_id
      FROM tickets t
      JOIN bookings b ON t.booking_id = b.booking_id
      WHERE b.booking_id = ? AND t.full_name = ?
      AND t.flight_direction = ?
    `;
      const passengerName = passengerId.startsWith("adult")
        ? `Người lớn ${parseInt(passengerId.split("_")[1]) + 1}`
        : passengerId.startsWith("child")
        ? `Trẻ em ${parseInt(passengerId.split("_")[1]) + 1}`
        : `Em bé ${parseInt(passengerId.split("_")[1]) + 1}`;
      const [ticketResult] = await db.pool.query(ticketQuery, [
        bookingId,
        passengerName,
        flightDirection,
      ]);
      if (!ticketResult.length) throw new Error("Không tìm thấy vé");

      const ticketId = ticketResult[0].ticket_id;

      // Lấy seat_id từ seat_number
      const seatQuery = `
      SELECT seat_id
      FROM seats
      WHERE seat_number = ?
    `;
      const [seatResult] = await db.pool.query(seatQuery, [seatNumber]);
      if (!seatResult.length) throw new Error("Ghế không tồn tại");
      const seatId = seatResult[0].seat_id;

      // Kiểm tra ghế đã được đặt chưa
      const availabilityQuery = `
      SELECT is_available
      FROM seat_availability
      WHERE schedule_id = ? AND seat_id = ?
    `;
      const [availabilityResult] = await db.pool.query(availabilityQuery, [
        scheduleId,
        seatId,
      ]);
      if (!availabilityResult.length || !availabilityResult[0].is_available) {
        throw new Error("Ghế đã được đặt");
      }

      // Cập nhật ticket với seat_id
      const updateTicketQuery = `
      UPDATE tickets
      SET seat_id = ?
      WHERE ticket_id = ?
    `;
      await db.pool.query(updateTicketQuery, [seatId, ticketId]);

      // Cập nhật trạng thái ghế trong seat_availability
      const updateAvailabilityQuery = `
      UPDATE seat_availability
      SET is_available = FALSE
      WHERE schedule_id = ? AND seat_id = ?
    `;
      await db.pool.query(updateAvailabilityQuery, [scheduleId, seatId]);

      return { success: true, seatNumber };
    } catch (error) {
      throw new Error(`Lỗi khi gán ghế: ${error.message}`);
    }
  }
}
