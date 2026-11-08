const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './courts.db';
let db = null;
let SQL = null;

async function initDB() {
  SQL = await initSqlJs();

  let fileBuffer = null;
  if (fs.existsSync(dbPath)) {
    fileBuffer = fs.readFileSync(dbPath);
  }

  db = new SQL.Database(fileBuffer);
  db.run('PRAGMA foreign_keys = ON');

  const schemaPath = path.join(__dirname, 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const statements = schema.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    try {
      db.run(stmt);
    } catch (e) {
      // Table might already exist
    }
  }

  saveDB();
  console.log('Database initialized at', dbPath);
}

function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function prepare(sql) {
  return {
    run: (...params) => {
      try {
        db.run(sql, params);
        saveDB();
        return { changes: db.getRowsModified() };
      } catch (e) {
        throw e;
      }
    },
    get: (...params) => {
      try {
        const result = db.exec(sql, params);
        if (result.length === 0) return null;
        const columns = result[0].columns;
        const values = result[0].values;
        if (values.length === 0) return null;
        const row = {};
        columns.forEach((col, i) => {
          row[col] = values[0][i];
        });
        return row;
      } catch (e) {
        throw e;
      }
    },
    all: (...params) => {
      try {
        const result = db.exec(sql, params);
        if (result.length === 0) return [];
        const columns = result[0].columns;
        const values = result[0].values;
        return values.map(row => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      } catch (e) {
        throw e;
      }
    }
  };
}

module.exports = {
  initDB,
  prepare,
  saveDB,
  exec: (sql) => db.run(sql)
};
