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
};

module.exports = Flight;
