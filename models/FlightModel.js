const db = require("../config/db");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

// Format thời gian bay
const formatFlightTimes = (flight) => {
  const departureDate = dayjs(flight.departure_date).format("YYYY-MM-DD");
  const fullDeparture = `${departureDate} ${flight.departure_time}`;
  const fullArrival = `${departureDate} ${flight.arrival_time}`;

  return {
    ...flight,
    departure_date: departureDate,
    departure_time: dayjs(fullDeparture).tz().format("HH:mm:ss"),
    arrival_time: dayjs(fullArrival).tz().format("HH:mm:ss"),
  };
};
const updateFlight = async (
  flight_id,
  { flight_code, departure_airport_id, arrival_airport_id, status, airplane_id }
) => {
  await db.execute(
    `UPDATE flights 
   SET flight_code = ?, departure_airport_id = ?, arrival_airport_id = ?, status = ?, airplane_id = ?
   WHERE flight_id = ?`,
    [
      flight_code,
      departure_airport_id,
      arrival_airport_id,
      status,
      airplane_id,
      flight_id,
    ]
  );
};
const getAllFlights = async () => {
  const [flights] = await db.execute(`
    SELECT 
      f.flight_id, f.flight_code, f.status,
      f.airplane_id, ap.model AS airplane_name,
      dep.airport_name AS departure_airport,
      dep.airport_code AS departure_airport_code,
      arr.airport_name AS arrival_airport,
      arr.airport_code AS arrival_airport_code
    FROM flights f
    JOIN airports dep ON f.departure_airport_id = dep.airport_id
    JOIN airports arr ON f.arrival_airport_id = arr.airport_id
    LEFT JOIN airplanes ap ON f.airplane_id = ap.airplane_id
    ORDER BY f.flight_id DESC
  `);
  return flights;
};

// Lấy giá vé theo schedule
const getFlightPrices = async (scheduleId) => {
  const [prices] = await db.execute(
    `SELECT t.ticket_type, fp.price ,fp.price_id
     FROM flight_prices fp
     JOIN ticket_types t ON fp.ticket_type_id = t.ticket_type_id
     WHERE fp.schedule_id = ?`,
    [scheduleId]
  );
  return prices;
};

// Truy vấn các chuyến bay
const queryFlights = async (from, to, date) => {
  const query = `
    SELECT 
      f.flight_id, f.flight_code, f.status, 
      s.schedule_id, s.departure_date, s.departure_time, s.arrival_time, s.duration,
      dep_airport.airport_name AS departure_airport,
      dep_airport.airport_code AS departure_airport_code,
      arr_airport.airport_name AS arrival_airport,
       arr_airport.airport_code AS arrival_airport_code
    FROM flights f
    JOIN schedules s ON f.flight_id = s.flight_id
    JOIN airports dep_airport ON f.departure_airport_id = dep_airport.airport_id
    JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.airport_id
    WHERE dep_airport.airport_code = ? 
      AND arr_airport.airport_code = ? 
      AND DATE(s.departure_date) = DATE(?)
  `;

  const [flights] = await db.execute(query, [from, to, date]);

  for (let i = 0; i < flights.length; i++) {
    flights[i] = formatFlightTimes(flights[i]);
    flights[i].prices = await getFlightPrices(flights[i].schedule_id);
  }

  return flights;
};
const findAirportIdByCode = async (code) => {
  const [rows] = await db.execute(
    "SELECT airport_id FROM airports WHERE airport_code = ?",
    [code]
  );
  return rows.length > 0 ? rows[0].airport_id : null;
};

// Model chính
const Flight = {
  searchFlights: async (
    departure,
    destination,
    departureDate,
    returnDate,
    tripType
  ) => {
    try {
      const departureFlights = await queryFlights(
        departure,
        destination,
        departureDate
      );

      let returnFlights = [];
      if (tripType === "round-trip" && returnDate) {
        returnFlights = await queryFlights(destination, departure, returnDate);
      }

      return {
        departureFlights,
        returnFlights,
      };
    } catch (error) {
      console.error("Error in searchFlights:", error);
      throw error;
    }
  },
  getAllFlights,
  updateFlight,
  findAirportIdByCode,
};

module.exports = Flight;
