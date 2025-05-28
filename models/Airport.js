const db = require("../config/db");

class Airport {
  static async getAllAirports() {
    const [rows] = await db.execute("SELECT * FROM airports");
    return rows;
  }

  static async getAirportById(airport_id) {
    const [rows] = await db.execute(
      "SELECT * FROM airports WHERE airport_id = ?",
      [airport_id]
    );
    return rows[0];
  }

  static async createAirport({ airport_name, airport_code, city, country }) {
    const [result] = await db.execute(
      "INSERT INTO airports (airport_name, airport_code, city, country) VALUES (?, ?, ?, ?)",
      [airport_name, airport_code, city, country]
    );
    return result.insertId;
  }

  static async updateAirport(airport_id, data) {
    const { airport_name, airport_code, city, country } = data;
    await db.execute(
      "UPDATE airports SET airport_name = ?, airport_code = ?, city = ?, country = ? WHERE airport_id = ?",
      [airport_name, airport_code, city, country, airport_id]
    );
    return true;
  }

  static async deleteAirport(airport_id) {
    await db.execute("DELETE FROM airports WHERE airport_id = ?", [airport_id]);
    return true;
  }
}

module.exports = Airport;
