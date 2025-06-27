const db = require("../config/db");
const Flight = require("../models/FlightModel");
const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.getAllFlights();
    res.status(200).json(flights);
  } catch (error) {
    console.error("Lỗi lấy danh sách chuyến bay:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};
const searchFlights = async (req, res) => {
  const { departure, destination, departureDate, returnDate, tripType } =
    req.query;
  try {
    const flights = await require("../models/FlightModel").searchFlights(
      departure,
      destination,
      departureDate,
      returnDate,
      tripType
    );
    const { departureFlights = [], returnFlights = [] } = flights;
    if (departureFlights.length === 0 && returnFlights.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chuyến bay phù hợp" });
    }
    res.status(200).json(flights);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm chuyến bay:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};


const createFlight = async (req, res) => {
  const {
    flight_code,
    departure_airport,
    arrival_airport,
    status,
    airplane_id,
  } = req.body;

  try {
    const [dep] = await db.execute(
      "SELECT airport_id FROM airports WHERE airport_code = ?",
      [departure_airport]
    );
    const [arr] = await db.execute(
      "SELECT airport_id FROM airports WHERE airport_code = ?",
      [arrival_airport]
    );

    if (dep.length === 0 || arr.length === 0) {
      return res.status(400).json({ message: "Mã sân bay không hợp lệ!" });
    }

    const [result] = await db.execute(
      "INSERT INTO flights (flight_code, departure_airport_id, arrival_airport_id, status, airplane_id) VALUES (?, ?, ?, ?, ?)",
      [flight_code, dep[0].airport_id, arr[0].airport_id, status, airplane_id]
    );

    res
      .status(201)
      .json({ message: "Đã tạo chuyến bay mới!", flightId: result.insertId });
  } catch (error) {
    console.error("Lỗi tạo chuyến bay:", error);
    res.status(500).json({ message: "Lỗi server!", error });
  }
};


const deleteFlight = async (req, res) => {
  const { flightId } = req.params;

  try {

    const [check] = await db.execute(
      "SELECT * FROM flights WHERE flight_id = ?",
      [flightId]
    );
    if (check.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy chuyến bay" });
    }

    await db.execute("DELETE FROM flights WHERE flight_id = ?", [flightId]);
    res.status(200).json({ message: "Đã xoá chuyến bay!" });
  } catch (error) {
    console.error("Lỗi xoá chuyến bay:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};
const updateFlight = async (req, res) => {
  const { flightId } = req.params;
  const {
    flight_code,
    departure_airport,
    arrival_airport,
    status,
    airplane_id,
  } = req.body;

  try {
    const depId = await Flight.findAirportIdByCode(departure_airport);
    const arrId = await Flight.findAirportIdByCode(arrival_airport);

    if (!depId || !arrId) {
      return res.status(400).json({ message: "Mã sân bay không hợp lệ!" });
    }

    await Flight.updateFlight(flightId, {
      flight_code,
      departure_airport_id: depId,
      arrival_airport_id: arrId,
      status,
      airplane_id,
    });

    res.status(200).json({ message: "Đã cập nhật chuyến bay!" });
  } catch (error) {
    console.error("Lỗi cập nhật chuyến bay:", error);
    res.status(500).json({ message: "Lỗi server!", error });
  }
};

module.exports = {
  searchFlights,
  createFlight,
  deleteFlight,
  getAllFlights,
  updateFlight,
};
