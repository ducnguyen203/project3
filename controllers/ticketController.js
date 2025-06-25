const TicketModel = require("../models/ticketModel");

exports.deleteTicket = async (req, res) => {
  const { ticketId } = req.params;

  try {
    await TicketModel.deleteTicketById(ticketId);
    res.status(200).json({ message: "Xoá vé thành công" });
  } catch (err) {
    console.error("Lỗi xoá vé:", err);
    res.status(500).json({ message: "Lỗi server khi xoá vé" });
  }
};
