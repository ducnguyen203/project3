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
    if (!rows || rows.length === 0) {
      throw new Error("Không tìm thấy đặt vé với ID này");
    }
    return rows;
  }
  static async timKiemDatVeTheoMa(req, res) {
    try {
      const { bookingCode } = req.params;
      if (!bookingCode) {
        return res.status(400).json({ message: "Mã đặt vé là bắt buộc" });
      }

      const [bookings] = await pool.query(
        `SELECT b.*, t.*, 
                f1.flight_code as departure_flight_code,
                f2.flight_code as return_flight_code,
                a1.airport_name as departure_airport,
                a1.airport_code as departure_airport_code,
                a2.airport_name as arrival_airport,
                a2.airport_code as arrival_airport_code,
                a3.airport_name as return_departure_airport,
                a3.airport_code as return_departure_airport_code,
                a4.airport_name as return_arrival_airport,
                a4.airport_code as return_arrival_airport_code,
                s.seat_number AS seat_number,
                s1.departure_date as departure_date,
                s1.departure_time as departure_time,
                s1.arrival_time as arrival_time,
                s2.departure_date as return_date,
                s2.departure_time as return_time,
                s2.arrival_time as return_arrival_time
         FROM bookings b
         LEFT JOIN tickets t ON b.booking_id = t.booking_id
         LEFT JOIN schedules s1 ON b.departure_schedule_id = s1.schedule_id
         LEFT JOIN schedules s2 ON b.return_schedule_id = s2.schedule_id
         LEFT JOIN flights f1 ON s1.flight_id = f1.flight_id
         LEFT JOIN flights f2 ON s2.flight_id = f2.flight_id
         LEFT JOIN airports a1 ON f1.departure_airport_id = a1.airport_id
         LEFT JOIN airports a2 ON f1.arrival_airport_id = a2.airport_id
         LEFT JOIN airports a3 ON f2.departure_airport_id = a3.airport_id
         LEFT JOIN airports a4 ON f2.arrival_airport_id = a4.airport_id
         LEFT JOIN seats s ON t.seat_id = s.seat_id
         WHERE b.booking_code = ?`,
        [bookingCode]
      );

      if (!bookings || bookings.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy đặt vé" });
      }

      // Nhóm vé theo booking
      const bookingDetails = {
        booking_id: bookings[0].booking_id,
        booking_code: bookings[0].booking_code,
        user_id: bookings[0].user_id,
        num_passengers: bookings[0].num_passengers,
        total_price: bookings[0].total_price,
        status: bookings[0].status,
        created_at: bookings[0].created_at,
        departure_flight: {
          flight_code: bookings[0].departure_flight_code,
          departure_airport: {
            name: bookings[0].departure_airport,
            code: bookings[0].departure_airport_code,
          },
          arrival_airport: {
            name: bookings[0].arrival_airport,
            code: bookings[0].arrival_airport_code,
          },
          departure_date: bookings[0].departure_date,
          departure_time: bookings[0].departure_time,
          arrival_time: bookings[0].arrival_time,
        },

        return_flight: bookings[0].return_schedule_id
          ? {
              flight_code: bookings[0].return_flight_code,
              departure_airport: {
                name: bookings[0].return_departure_airport,
                code: bookings[0].return_departure_airport_code,
              },
              arrival_airport: {
                name: bookings[0].return_arrival_airport,
                code: bookings[0].return_arrival_airport_code,
              },
              departure_date: bookings[0].return_date,
              departure_time: bookings[0].return_time,
              arrival_time: bookings[0].return_arrival_time,
            }
          : null,

        tickets: bookings.map((ticket) => ({
          ticket_id: ticket.ticket_id,
          full_name: ticket.full_name,
          email: ticket.email,
          phone: ticket.phone,
          cccd: ticket.cccd,
          date_of_birth: ticket.date_of_birth,
          gender: ticket.gender,
          passenger_type: ticket.passenger_type,
          price_id: ticket.price_id,
          baggage_allowance: ticket.baggage_allowance,
          status: ticket.status,
          flight_direction: ticket.flight_direction,
          seat_number: ticket.seat_number,
        })),
      };

      res.status(200).json({
        message: "Tìm kiếm đặt vé thành công",
        bookingDetails,
      });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm đặt vé:", error);
      return res.status(500).json({
        message: "Lỗi server khi tìm kiếm đặt vé",
      });
    }
  }
}

module.exports = BookingModel;
