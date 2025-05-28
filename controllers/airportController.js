const Airport = require("../models/Airport");

exports.getAllAirports = async (req, res) => {
  try {
    const airports = await Airport.getAllAirports();
    res.json(airports);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách sân bay" });
  }
};

exports.getAirportById = async (req, res) => {
  try {
    const airport = await Airport.getAirportById(req.params.id);
    if (!airport) {
      return res.status(404).json({ error: "Không tìm thấy sân bay" });
    }
    res.json(airport);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin sân bay" });
  }
};

exports.createAirport = async (req, res) => {
  try {
    const { airport_name, airport_code, city, country } = req.body;

    if (!airport_name || !airport_code || !city || !country) {
      return res.status(400).json({ error: "Thiếu thông tin sân bay" });
    }

    const airportId = await Airport.createAirport(req.body);
    res
      .status(201)
      .json({ message: "Tạo sân bay thành công", airport_id: airportId });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tạo sân bay" });
  }
};

exports.updateAirport = async (req, res) => {
  try {
    const { airport_name, airport_code, city, country } = req.body;

    if (!airport_name || !airport_code || !city || !country) {
      return res.status(400).json({ error: "Thiếu thông tin cập nhật" });
    }

    await Airport.updateAirport(req.params.id, req.body);
    res.json({ message: "Cập nhật sân bay thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật sân bay" });
  }
};

exports.deleteAirport = async (req, res) => {
  try {
    await Airport.deleteAirport(req.params.id);
    res.json({ message: "Xóa sân bay thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa sân bay" });
  }
};

const searchFlights = (req, res) => {
  const { departure, destination, departureDate, returnDate, tripType } =
    req.query;

  // Kiểm tra dữ liệu đầu vào
  if (
    !departure ||
    !destination ||
    !departureDate ||
    (tripType === "round-trip" && !returnDate)
  ) {
    return res.status(400).json({
      message:
        "Cần cung cấp đầy đủ thông tin: điểm đi, điểm đến, ngày đi và (ngày về nếu là khứ hồi)",
    });
  }

  // Lấy ngày đi và ngày về
  const departureDateFormatted = new Date(departureDate);
  const returnDateFormatted = returnDate ? new Date(returnDate) : null;

  // Gọi hàm tìm kiếm sân bay
  Airport.searchAirports(departure, destination, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Lỗi hệ thống khi tìm kiếm sân bay", error: err });
    }

    // Nếu là chuyến khứ hồi, kiểm tra ngày đi và ngày về
    if (tripType === "round-trip" && returnDateFormatted) {
      // Kiểm tra ngày về hợp lệ
      if (returnDateFormatted <= departureDateFormatted) {
        return res
          .status(400)
          .json({ message: "Ngày về không thể trước ngày đi!" });
      }
    }

    // Trả về kết quả tìm kiếm
    return res.status(200).json(results);
  });
};
