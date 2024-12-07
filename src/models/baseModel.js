import { getDb } from "../database/db.js";

export class BaseModel {
  static getDb() {
    return getDb();
  }

  static prepare(sql) {
    return this.getDb().prepare(sql);
  }

  static exec(sql) {
    return this.getDb().exec(sql);
  }
}
