"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeRepository = void 0;
const database_1 = require("../db/database");
class HomeRepository {
    static saveData(data) {
        const stmt = database_1.db.prepare('INSERT INTO home_data (data) VALUES (?)');
        const result = stmt.run(data);
        const selectStmt = database_1.db.prepare('SELECT * FROM home_data WHERE id = ?');
        const savedData = selectStmt.get(result.lastInsertRowid);
        return savedData;
    }
    static getAllData() {
        const stmt = database_1.db.prepare('SELECT * FROM home_data ORDER BY created_at DESC');
        return stmt.all();
    }
    static getById(id) {
        const stmt = database_1.db.prepare('SELECT * FROM home_data WHERE id = ?');
        return stmt.get(id);
    }
    static updateData(id, data) {
        const stmt = database_1.db.prepare('UPDATE home_data SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        const result = stmt.run(data, id);
        if (result.changes > 0) {
            return this.getById(id);
        }
        return undefined;
    }
    static deleteData(id) {
        const stmt = database_1.db.prepare('DELETE FROM home_data WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
}
exports.HomeRepository = HomeRepository;
//# sourceMappingURL=HomeRepository.js.map