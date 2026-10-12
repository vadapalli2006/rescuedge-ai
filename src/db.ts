import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./rescuedge_queue.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export const enqueueAction = (command: string, payload: object): Promise<number> => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO queue (command, payload) VALUES (?, ?)');
    stmt.run(command, JSON.stringify(payload), function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
    stmt.finalize();
  });
};

export const getPendingActions = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM queue WHERE status = 'PENDING' ORDER BY created_at ASC", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const markCompleted = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run("UPDATE queue SET status = 'COMPLETED' WHERE id = ?", [id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};