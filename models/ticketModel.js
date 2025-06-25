const pool = require("../config/db");

class TicketModel {
  static async deleteTicketById(ticketId) {
    await pool.query("DELETE FROM tickets WHERE ticket_id = ?", [ticketId]);
  }
}

module.exports = TicketModel;
