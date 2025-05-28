const ScheduleModel = require("../models/ScheduleModel");

const getAllSchedules = async (req, res) => {
  try {
    const rows = await ScheduleModel.getAllSchedulesWithPrices();

    // Gom theo schedule_id
    const schedules = {};

    rows.forEach((row) => {
      if (!schedules[row.schedule_id]) {
        schedules[row.schedule_id] = {
          schedule_id: row.schedule_id,
          flight_code: row.flight_code,
          departure_airport: row.departure_airport,
          arrival_airport: row.arrival_airport,
          departure_date: row.departure_date,
          departure_time: row.departure_time,
          arrival_time: row.arrival_time,
          duration: row.duration,
          prices: [],
        };
      }

      schedules[row.schedule_id].prices.push({
        ticket_type: row.ticket_type,
        price: row.price,
      });
    });

    res.status(200).json(Object.values(schedules));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chuyến bay:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const createSchedule = async (req, res) => {
  try {
    const {
      flight_code,
      departure_airport,
      arrival_airport,
      departure_date,
      departure_time,
      arrival_time,
      duration,
      prices,
    } = req.body;

    // Validate required fields
    if (
      !flight_code ||
      !departure_airport ||
      !arrival_airport ||
      !departure_date ||
      !departure_time ||
      !arrival_time ||
      !duration ||
      !prices ||
      !Array.isArray(prices)
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu hoặc dữ liệu không hợp lệ" });
    }

    // Validate prices array
    for (const price of prices) {
      if (!price.ticket_type || !price.price) {
        return res.status(400).json({ message: "Dữ liệu giá vé không hợp lệ" });
      }
    }

    // Create new schedule
    const newSchedule = {
      flight_code,
      departure_airport,
      arrival_airport,
      departure_date,
      departure_time,
      arrival_time,
      duration,
      prices,
    };

    const result = await ScheduleModel.createSchedule(newSchedule);

    res.status(201).json({
      message: "Tạo lịch trình thành công",
      schedule: result,
    });
  } catch (error) {
    console.error("Lỗi khi tạo lịch trình:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = { getAllSchedules, createSchedule };
