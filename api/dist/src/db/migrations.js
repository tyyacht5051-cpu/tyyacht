"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const database_1 = require("./database");
const migrations = [
    {
        id: 1,
        name: 'add_cruise_application_columns',
        up: () => {
            const columns = [
                `ALTER TABLE cruise_applications ADD COLUMN experience_type VARCHAR(50) DEFAULT '크루즈요트'`,
                `ALTER TABLE cruise_applications ADD COLUMN desired_date DATE`,
                `ALTER TABLE cruise_applications ADD COLUMN address_do VARCHAR(50)`,
                `ALTER TABLE cruise_applications ADD COLUMN address_sigungu VARCHAR(50)`,
                `ALTER TABLE cruise_applications ADD COLUMN adult_male INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN adult_female INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN adult_total INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN youth_male INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN youth_female INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN youth_total INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN total_participants INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN infant_male INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN infant_female INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN teens_male INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN teens_female INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN twenties_male INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN twenties_female INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN thirties_male INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN thirties_female INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN forties_male INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN forties_female INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN fifties_plus_male INTEGER DEFAULT 0`,
                `ALTER TABLE cruise_applications ADD COLUMN fifties_plus_female INTEGER DEFAULT 0`,
            ];
            for (const sql of columns) {
                try {
                    database_1.db.exec(sql);
                }
                catch (e) {
                    if (!e.message.includes('duplicate column name'))
                        throw e;
                }
            }
        },
    },
    {
        id: 2,
        name: 'add_notices_published',
        up: () => {
            try {
                database_1.db.exec(`ALTER TABLE notices ADD COLUMN published BOOLEAN DEFAULT 1`);
            }
            catch (e) {
                if (!e.message.includes('duplicate column name'))
                    throw e;
            }
        },
    },
    {
        id: 3,
        name: 'add_exemption_applications_columns',
        up: () => {
            const columns = [
                `ALTER TABLE exemption_applications ADD COLUMN gender VARCHAR(10)`,
                `ALTER TABLE exemption_applications ADD COLUMN preferred_date TEXT`,
                `ALTER TABLE exemption_applications ADD COLUMN course_type VARCHAR(50) DEFAULT 'general'`,
                `ALTER TABLE exemption_applications ADD COLUMN license VARCHAR(50)`,
                `ALTER TABLE exemption_applications ADD COLUMN discount_eligibility VARCHAR(50)`,
                `ALTER TABLE exemption_applications ADD COLUMN preferred_dates TEXT`,
                `ALTER TABLE exemption_applications ADD COLUMN education_type VARCHAR(50) DEFAULT 'general'`,
            ];
            for (const sql of columns) {
                try {
                    database_1.db.exec(sql);
                }
                catch (e) {
                    if (!e.message.includes('duplicate column name'))
                        throw e;
                }
            }
        },
    },
    {
        id: 4,
        name: 'add_exemption_schedules_is_closed',
        up: () => {
            try {
                database_1.db.exec(`ALTER TABLE exemption_schedules ADD COLUMN is_closed BOOLEAN DEFAULT 0`);
            }
            catch (e) {
                if (!e.message.includes('duplicate column name'))
                    throw e;
            }
        },
    },
    {
        id: 5,
        name: 'create_popups_table',
        up: () => {
            database_1.db.exec(`
        CREATE TABLE IF NOT EXISTS popups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          image_url TEXT,
          link_url TEXT,
          is_active INTEGER DEFAULT 1,
          display_order INTEGER DEFAULT 0,
          start_date DATETIME,
          end_date DATETIME,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);
        },
    },
    {
        id: 6,
        name: 'add_payment_status',
        up: () => {
            const columns = [
                `ALTER TABLE exemption_applications ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending'`,
                `ALTER TABLE education_applications ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending'`,
            ];
            for (const sql of columns) {
                try {
                    database_1.db.exec(sql);
                }
                catch (e) {
                    if (!e.message.includes('duplicate column name'))
                        throw e;
                }
            }
        },
    },
];
function runMigrations() {
    database_1.db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    const applied = database_1.db.prepare('SELECT id FROM schema_migrations').all();
    const appliedIds = new Set(applied.map(m => m.id));
    for (const migration of migrations) {
        if (appliedIds.has(migration.id))
            continue;
        try {
            migration.up();
            database_1.db.prepare('INSERT INTO schema_migrations (id, name) VALUES (?, ?)').run(migration.id, migration.name);
            console.log(`✅ Migration ${migration.id} applied: ${migration.name}`);
        }
        catch (error) {
            console.error(`❌ Migration ${migration.id} failed: ${error.message}`);
        }
    }
}
//# sourceMappingURL=migrations.js.map