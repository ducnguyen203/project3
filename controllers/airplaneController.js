const Airplane = require("../models/Airplane");

exports.getAllAirplanes = async (req, res) => {
  try {
    const airplanes = await Airplane.getAllAirplanes();
    res.json(airplanes);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách máy bay" });
  }
};

exports.getAirplaneById = async (req, res) => {
  try {
    const airplane = await Airplane.getAirplaneById(req.params.id);
    if (!airplane) {
      return res.status(404).json({ error: "Không tìm thấy máy bay" });
    }
    res.json(airplane);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin máy bay" });
  }
};

exports.createAirplane = async (req, res) => {
  try {
    const airplaneId = await Airplane.createAirplane(req.body);
    res
      .status(201)
      .json({ message: "Tạo máy bay thành công", airplane_id: airplaneId });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tạo máy bay" });
  }
};

exports.updateAirplane = async (req, res) => {
  try {
    await Airplane.updateAirplane(req.params.id, req.body);
    res.json({ message: "Cập nhật máy bay thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật máy bay" });
  }
};

exports.deleteAirplane = async (req, res) => {
  try {
    await Airplane.deleteAirplane(req.params.id);
    res.json({ message: "Xóa máy bay thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa máy bay" });
  }
};
