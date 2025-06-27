const db = require("../config/db");

class PassengerService {
  static async getSeatMap(scheduleId) {
    try {
      console.log(`Lấy bản đồ ghế cho scheduleId: ${scheduleId}`);
      const scheduleQuery = `
        SELECT f.airplane_id
        FROM schedules s
        JOIN flights f ON s.flight_id = f.flight_id
        WHERE s.schedule_id = ?
      `;
      const [scheduleResult] = await db.query(scheduleQuery, [scheduleId]);
      console.log("Schedule result:", scheduleResult);
      if (!scheduleResult.length) {
        throw new Error("Không tìm thấy lịch trình");
      }

      const airplaneId = scheduleResult[0].airplane_id;

      const seatQuery = `
        SELECT s.seat_id, s.seat_number, s.seat_type, sa.check_status
        FROM seats s
        LEFT JOIN seat_availability sa ON s.seat_id = sa.seat_id AND sa.schedule_id = ?
        WHERE s.airplane_id = ?
        ORDER BY CAST(REGEXP_REPLACE(s.seat_number, '[^0-9]', '') AS UNSIGNED), s.seat_number
      `;

      const [seats] = await db.query(seatQuery, [scheduleId, airplaneId]);

      if (!seats.length) {
        throw new Error("Không tìm thấy ghế cho máy bay này");
      }

      const seatMap = [];
      let currentRow = [];
      let currentRowNumber = null;

      seats.forEach((seat) => {
        const rowNumber = parseInt(seat.seat_number.match(/\d+/)[0], 10);
        if (currentRowNumber !== rowNumber) {
          if (currentRow.length) seatMap.push(currentRow);
          currentRow = [];
          currentRowNumber = rowNumber;
        }
        currentRow.push({
          seatId: seat.seat_id,
          seat: seat.seat_number,
          seatType: seat.seat_type,
          available: seat.check_status === 1, 
        });
      });
      if (currentRow.length) seatMap.push(currentRow);

      return seatMap;
    } catch (error) {
      console.error("Lỗi trong getSeatMap:", error);
      throw new Error(`Lỗi khi lấy bản đồ ghế: ${error.message}`);
    }
  }

  static async assignSeat(
    bookingId,
    passengerId,
    fullName,
    flightDirection,
    seatNumber,
    scheduleId,
    passengerTicketType
  ) {
    const connection = await db.getConnection();
    try {
      console.log("Gán ghế:", {
        bookingId,
        passengerId,
        fullName,
        flightDirection,
        seatNumber,
        scheduleId,
      });
      await connection.beginTransaction();

      
      const ticketQuery = `
        SELECT t.ticket_id
        FROM tickets t
        JOIN bookings b ON t.booking_id = b.booking_id
        WHERE b.booking_id = ? AND t.full_name = ? AND t.flight_direction = ?
      `;
      const [ticketResult] = await connection.query(ticketQuery, [
        bookingId,
        fullName,
        flightDirection,
      ]);
      if (!ticketResult.length) {
        console.error("Không tìm thấy vé với:", {
          bookingId,
          fullName,
          flightDirection,
        });
        throw new Error("Không tìm thấy vé");
      }

      const ticketId = ticketResult[0].ticket_id;


      const seatQuery = `
        SELECT seat_id
        FROM seats
        WHERE seat_number = ?
      `;
      const [seatResult] = await connection.query(seatQuery, [seatNumber]);
      if (!seatResult.length) {
        throw new Error("Ghế không tồn tại");
      }
      const seatId = seatResult[0].seat_id;

      
      const insertAvailabilityQuery = `
        INSERT IGNORE INTO seat_availability (schedule_id, seat_id, check_status)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE check_status = check_status
      `;
      await connection.query(insertAvailabilityQuery, [scheduleId, seatId]);

      
      const availabilityQuery = `
        SELECT check_status
        FROM seat_availability
        WHERE schedule_id = ? AND seat_id = ?
      `;
      const [availabilityResult] = await connection.query(availabilityQuery, [
        scheduleId,
        seatId,
      ]);
      if (
        !availabilityResult.length ||
        availabilityResult[0].check_status === 0 ||
        availabilityResult[0].check_status === null
      ) {
        throw new Error("Ghế đã được đặt");
      }

      const seatTypeQuery = `SELECT seat_type FROM seats WHERE seat_id = ?`;
      const [seatTypeResult] = await connection.query(seatTypeQuery, [seatId]);
      const seatType = seatTypeResult[0]?.seat_type;

      if (seatType !== passengerTicketType) {
        throw new Error(
          `Ghế ${seatNumber} không phù hợp với loại vé ${passengerTicketType}`
        );
      }

     
      const updateTicketQuery = `
        UPDATE tickets
        SET seat_id = ?
        WHERE ticket_id = ?
      `;
      await connection.query(updateTicketQuery, [seatId, ticketId]);

  
      const updateAvailabilityQuery = `
        UPDATE seat_availability
        SET check_status = 0
        WHERE schedule_id = ? AND seat_id = ?
      `;
      await connection.query(updateAvailabilityQuery, [scheduleId, seatId]);

      await connection.commit();
      return { seatNumber };
    } catch (error) {
      await connection.rollback();
      console.error("Lỗi trong assignSeat:", error);
      throw new Error(`Lỗi khi gán ghế: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = PassengerService;
