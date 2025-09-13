import { db } from '../db/database';

export interface HomeData {
  id?: number;
  data: string;
  created_at?: string;
  updated_at?: string;
}

export class HomeRepository {
  static saveData(data: string): HomeData {
    const stmt = db.prepare('INSERT INTO home_data (data) VALUES (?)');
    const result = stmt.run(data);
    
    const selectStmt = db.prepare('SELECT * FROM home_data WHERE id = ?');
    const savedData = selectStmt.get(result.lastInsertRowid) as HomeData;
    
    return savedData;
  }
  
  static getAllData(): HomeData[] {
    const stmt = db.prepare('SELECT * FROM home_data ORDER BY created_at DESC');
    return stmt.all() as HomeData[];
  }
  
  static getById(id: number): HomeData | undefined {
    const stmt = db.prepare('SELECT * FROM home_data WHERE id = ?');
    return stmt.get(id) as HomeData | undefined;
  }
  
  static updateData(id: number, data: string): HomeData | undefined {
    const stmt = db.prepare('UPDATE home_data SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(data, id);
    
    if (result.changes > 0) {
      return this.getById(id);
    }
    
    return undefined;
  }
  
  static deleteData(id: number): boolean {
    const stmt = db.prepare('DELETE FROM home_data WHERE id = ?');
    const result = stmt.run(id);
    
    return result.changes > 0;
  }
}