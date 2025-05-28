const FlightModel = require("../models/FlightModel");

const searchFlights = async (req, res) => {
  const { departure, destination, departureDate, returnDate, tripType } =
    req.query;

  try {
    const flights = await FlightModel.searchFlights(
      departure,
      destination,
      departureDate,
      returnDate,
      tripType
    );

    const { departureFlights = [], returnFlights = [] } = flights;

    if (departureFlights.length === 0 && returnFlights.length === 0) {
      console.log("Không tìm thấy chuyến bay phù hợp");
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

module.exports = { searchFlights };
