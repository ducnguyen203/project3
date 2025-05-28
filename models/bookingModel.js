const pool = require("../config/db");

class BookingModel {
  static taoMaDatVe() {
    return "BK" + Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  static async taoDatVe({
    userId,
    departureScheduleId,
    returnScheduleId,
    numPassengers,
    totalPrice,
    passengers,
    tripType,
  }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const maDatVe = this.taoMaDatVe();
      const [ketQuaDatVe] = await connection.query(
        `INSERT INTO bookings (booking_code, user_id, num_passengers, total_price, status, departure_schedule_id, return_schedule_id)
   VALUES (?, ?, ?, ?, 'Pending', ?, ?)`,
        [
          maDatVe,
          userId,
          numPassengers,
          totalPrice,
          departureScheduleId,
          returnScheduleId || null,
        ]
      );

      const bookingId = ketQuaDatVe.insertId;

      const firstAdultTicketIds = { departure: null, return: null };
      const ticketIds = [];

      // Vòng lặp 1: Xử lý vé người lớn trước
      for (const hanhKhach of passengers) {
        if (hanhKhach.passenger_type !== "Adult") continue;

        const {
          full_name,
          email,
          phone,
          cccd,
          date_of_birth,
          gender,
          passenger_type,
          price_id,
          flight_direction = "departure",
        } = hanhKhach;

        if (
          !full_name ||
          !date_of_birth ||
          !gender ||
          !passenger_type ||
          !price_id
        ) {
          throw new Error("Thiếu các trường bắt buộc của hành khách");
        }

        const dob = new Date(date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < dob.getDate())
        ) {
          age--;
        }
        if (age < 12 && passenger_type === "Adult") {
          throw new Error(
            `Hành khách người lớn ${full_name} phải từ 12 tuổi trở lên`
          );
        }

        const hanhLyChoPhep = "20kg";

        console.log(
          `Creating ticket for Adult: ${full_name}, flight_direction: ${flight_direction}`
        );

        const [ketQuaVe] = await connection.query(
          `INSERT INTO tickets (booking_id, full_name, email, phone, cccd, date_of_birth, gender, passenger_type, price_id, baggage_allowance, status, flight_direction, accompanying_adult_ticket_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)`,
          [
            bookingId,
            full_name,
            email || null,
            phone || null,
            cccd || null,
            date_of_birth,
            gender,
            passenger_type,
            price_id,
            hanhLyChoPhep,
            flight_direction,
            null,
          ]
        );

        const ticketId = ketQuaVe.insertId;
        ticketIds.push(ticketId);

        if (!firstAdultTicketIds[flight_direction]) {
          firstAdultTicketIds[flight_direction] = ticketId;
        }
      }

      // Vòng lặp 2: Xử lý vé trẻ em và em bé
      for (const hanhKhach of passengers) {
        if (hanhKhach.passenger_type === "Adult") continue;

        const {
          full_name,
          email,
          phone,
          cccd,
          date_of_birth,
          gender,
          passenger_type,
          price_id,
          flight_direction = "departure",
        } = hanhKhach;

        if (
          !full_name ||
          !date_of_birth ||
          !gender ||
          !passenger_type ||
          !price_id
        ) {
          throw new Error(
            `Thiếu các trường bắt buộc của hành khách: ${
              full_name || passenger_type
            }`
          );
        }

        const dob = new Date(date_of_birth);
        const today = new Date();
        if (dob > today) {
          throw new Error(
            `Ngày sinh của ${passenger_type} ${full_name} không được trong tương lai`
          );
        }

        let accompanyingAdultTicketId = null;
        if (passenger_type === "Child" || passenger_type === "Infant") {
          accompanyingAdultTicketId =
            firstAdultTicketIds[flight_direction] ||
            firstAdultTicketIds.departure ||
            firstAdultTicketIds.return;
          // Không throw error, để accompanying_adult_ticket_id là null nếu không tìm thấy
          console.log(
            `Processing ${passenger_type}: ${full_name}, accompanying_adult_ticket_id: ${accompanyingAdultTicketId}`
          );
        }

        const hanhLyChoPhep = passenger_type === "Child" ? "15kg" : "10kg";

        console.log(
          `Creating ticket for ${passenger_type}: ${full_name}, flight_direction: ${flight_direction}`
        );

        const [ketQuaVe] = await connection.query(
          `INSERT INTO tickets (booking_id, full_name, email, phone, cccd, date_of_birth, gender, passenger_type, price_id, baggage_allowance, status, flight_direction, accompanying_adult_ticket_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)`,
          [
            bookingId,
            full_name,
            email || null,
            phone || null,
            cccd || null,
            date_of_birth,
            gender,
            passenger_type,
            price_id,
            hanhLyChoPhep,
            flight_direction,
            accompanyingAdultTicketId,
          ]
        );

        const ticketId = ketQuaVe.insertId;
        ticketIds.push(ticketId);
      }

      await connection.commit();
      return { bookingId, maDatVe, ticketIds };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async layDatVeTheoId(bookingId) {
    const [rows] = await pool.query(
      `SELECT b.*, t.*
       FROM bookings b
       LEFT JOIN tickets t ON b.booking_id = t.booking_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );
    return rows;
  }
}

module.exports = BookingModel;
