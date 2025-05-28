const db = require("../config/db");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const formatScheduleTime = (schedule) => {
  const departureDate = dayjs(schedule.departure_date).format("YYYY-MM-DD");
  const fullDepartureUTC = dayjs.utc(
    `${departureDate} ${schedule.departure_time}`
  );
  const fullArrivalUTC = dayjs.utc(`${departureDate} ${schedule.arrival_time}`);

  return {
    ...schedule,
    departure_date: departureDate,
    departure_time: fullDepartureUTC.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss"),
    arrival_time: fullArrivalUTC.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss"),
  };
};

const ScheduleModel = {
  getAllSchedulesWithPrices: async () => {
    const query = `
      SELECT 
        s.schedule_id, s.departure_date, s.departure_time, s.arrival_time, s.duration,
        f.flight_code,
        dep_airport.airport_name AS departure_airport,
        arr_airport.airport_name AS arrival_airport,
        tp.ticket_type,
        fp.price
      FROM schedules s
      JOIN flights f ON s.flight_id = f.flight_id
      JOIN airports dep_airport ON f.departure_airport_id = dep_airport.airport_id
      JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.airport_id
      JOIN flight_prices fp ON s.schedule_id = fp.schedule_id
      JOIN ticket_types tp ON fp.ticket_type_id = tp.ticket_type_id
      ORDER BY s.schedule_id, fp.ticket_type_id
    `;

    const [rows] = await db.execute(query);

    const formattedRows = rows.map(formatScheduleTime);
    return formattedRows;
  },

  createSchedule: async (newSchedule) => {
    const {
      flight_code,
      departure_airport,
      arrival_airport,
      departure_date,
      departure_time,
      arrival_time,
      duration,
      prices,
    } = newSchedule;

    // Bắt đầu giao dịch
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Tìm flight_id dựa trên flight_code và mã sân bay
      const [flightRows] = await connection.query(
        `SELECT f.flight_id 
         FROM flights f 
         JOIN airports dep ON f.departure_airport_id = dep.airport_id 
         JOIN airports arr ON f.arrival_airport_id = arr.airport_id 
         WHERE f.flight_code = ? AND dep.airport_code = ? AND arr.airport_code = ?`,
        [flight_code, departure_airport, arrival_airport]
      );

      if (flightRows.length === 0) {
        throw new Error(
          "Chuyến bay không tồn tại hoặc thông tin sân bay không hợp lệ"
        );
      }

      const flight_id = flightRows[0].flight_id;

      // Thêm lịch trình mới
      const [scheduleResult] = await connection.query(
        `INSERT INTO schedules (flight_id, departure_date, departure_time, arrival_time, duration) 
         VALUES (?, ?, ?, ?, ?)`,
        [flight_id, departure_date, departure_time, arrival_time, duration]
      );

      const schedule_id = scheduleResult.insertId;

      // Thêm giá vé
      for (const price of prices) {
        const [ticketTypeRows] = await connection.query(
          `SELECT ticket_type_id FROM ticket_types WHERE ticket_type = ?`,
          [price.ticket_type]
        );

        if (ticketTypeRows.length === 0) {
          throw new Error(`Loại vé ${price.ticket_type} không tồn tại`);
        }

        const ticket_type_id = ticketTypeRows[0].ticket_type_id;

        await connection.query(
          `INSERT INTO flight_prices (schedule_id, ticket_type_id, price) 
           VALUES (?, ?, ?)`,
          [schedule_id, ticket_type_id, price.price]
        );
      }

      // Hoàn tất giao dịch
      await connection.commit();

      // Trả về thông tin lịch trình vừa tạo
      return {
        schedule_id,
        flight_code,
        departure_airport,
        arrival_airport,
        departure_date,
        departure_time,
        arrival_time,
        duration,
        prices,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = ScheduleModel;
