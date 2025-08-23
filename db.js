import * as SQLite from 'expo-sqlite';

// This promise will resolve with the database connection object.
// We open it once and reuse the connection.
const dbPromise = (async () => {
  const db = await SQLite.openDatabaseAsync('jewelry.db');

  // The new API is more promise-based, so we can run setup queries directly.
  await db.execAsync(`
    PRAGMA journal_mode = 'wal';
    CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS prices (date TEXT PRIMARY KEY NOT NULL, gold_24k_price REAL NOT NULL, silver_price REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_name TEXT, mobile TEXT, date TEXT NOT NULL, total_amount REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS invoice_items (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_id INTEGER NOT NULL, item_name TEXT NOT NULL, metal TEXT NOT NULL, purity TEXT NOT NULL, weight REAL NOT NULL, rate REAL NOT NULL, mc REAL NOT NULL, discount REAL NOT NULL, total REAL NOT NULL, FOREIGN KEY (invoice_id) REFERENCES invoices (id));
  `);

  return db;
})();

// The init function is no longer strictly necessary if we await the promise,
// but we can keep it for semantic clarity in App.js.
export const init = async () => {
  await dbPromise;
};

export const saveSettings = async (storeName, pin) => {
    const db = await dbPromise;
    // Use a transaction to insert both settings at once.
    await db.withTransactionAsync(async () => {
        // Since we can't have duplicate keys, we should remove old ones first or use INSERT OR REPLACE.
        // For settings, let's just insert. A proper app might use UPDATE.
        await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', 'storeName', storeName);
        await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', 'pin', pin);
    });
};

export const getSetting = async (key) => {
  const db = await dbPromise;
  // Get the first row, as key should be unique.
  const result = await db.getFirstAsync('SELECT value FROM settings WHERE key = ? ORDER BY id DESC', key);
  return result ? result.value : null;
};

export const getPricesByDate = async (date) => {
  const db = await dbPromise;
  const result = await db.getFirstAsync('SELECT * FROM prices WHERE date = ?', date);
  return result;
};

export const savePrices = async (date, gold_24k_price, silver_price) => {
  const db = await dbPromise;
  await db.runAsync('INSERT OR REPLACE INTO prices (date, gold_24k_price, silver_price) VALUES (?, ?, ?)', date, gold_24k_price, silver_price);
};

export const saveInvoice = async (invoice, items) => {
  const db = await dbPromise;
  let invoiceId = 0;
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO invoices (customer_name, mobile, date, total_amount) VALUES (?, ?, ?, ?)',
      invoice.customerName, invoice.mobile, invoice.date, invoice.totalAmount
    );
    invoiceId = result.lastInsertRowId;

    for (const item of items) {
      await db.runAsync(
        'INSERT INTO invoice_items (invoice_id, item_name, metal, purity, weight, rate, mc, discount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        invoiceId,
        item.name,
        item.metal,
        item.purity,
        item.grossWeight,
        item.metalValue / item.netWeight,
        item.makingCharge,
        item.discount,
        item.finalTotal
      );
    }
  });
  return invoiceId;
};
