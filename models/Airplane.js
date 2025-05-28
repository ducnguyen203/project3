const db = require('../config/db');

class Airplane {
    static async getAllAirplanes() {
        const [rows] = await db.execute('SELECT * FROM airplanes');
        return rows;
    }

    static async getAirplaneById(airplane_id) {
        const [rows] = await db.execute('SELECT * FROM airplanes WHERE airplane_id = ?', [airplane_id]);
        return rows[0];
    }

    static async createAirplane({ model, capacity }) {
        const [result] = await db.execute(
            'INSERT INTO airplanes (model, capacity) VALUES (?, ?)',
            [model, capacity]
        );
        return result.insertId;
    }

    static async updateAirplane(airplane_id, data) {
        const { model, capacity } = data;
        await db.execute(
            'UPDATE airplanes SET model = ?, capacity = ? WHERE airplane_id = ?',
            [model, capacity, airplane_id]
        );
        return true;
    }

    static async deleteAirplane(airplane_id) {
        await db.execute('DELETE FROM airplanes WHERE airplane_id = ?', [airplane_id]);
        return true;
    }
}

module.exports = Airplane;
