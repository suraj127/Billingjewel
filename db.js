import { openDatabase } from 'expo-sqlite';

const db = openDatabase('jewelry.db');

export const init = () => {
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL);',
        [],
        () => {},
        (_, err) => {
          reject(err);
          return true; // Stop transaction
        }
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS prices (date TEXT PRIMARY KEY NOT NULL, gold_24k_price REAL NOT NULL, silver_price REAL NOT NULL);',
        [],
        () => {},
        (_, err) => {
          reject(err);
          return true;
        }
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_name TEXT, mobile TEXT, date TEXT NOT NULL, total_amount REAL NOT NULL);',
        [],
        () => {},
        (_, err) => {
          reject(err);
          return true;
        }
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS invoice_items (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_id INTEGER NOT NULL, item_name TEXT NOT NULL, metal TEXT NOT NULL, purity TEXT NOT NULL, weight REAL NOT NULL, rate REAL NOT NULL, mc REAL NOT NULL, discount REAL NOT NULL, total REAL NOT NULL, FOREIGN KEY (invoice_id) REFERENCES invoices (id));',
        [],
        () => {
          resolve();
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
  return promise;
};

export const getSetting = (key) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT value FROM settings WHERE key = ?;',
                [key],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        resolve(rows._array[0].value);
                    } else {
                        resolve(null);
                    }
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
    return promise;
}


export const getPricesByDate = (date) => {
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM prices WHERE date = ?;',
        [date],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows._array[0]);
          } else {
            resolve(null);
          }
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
  return promise;
};

export const savePrices = (date, gold_24k_price, silver_price) => {
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO prices (date, gold_24k_price, silver_price) VALUES (?, ?, ?);',
        [date, gold_24k_price, silver_price],
        () => {
          resolve();
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
  return promise;
};

export const saveInvoice = (invoice, items) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Insert into invoices table
        tx.executeSql(
          'INSERT INTO invoices (customer_name, mobile, date, total_amount) VALUES (?, ?, ?, ?);',
          [invoice.customerName, invoice.mobile, invoice.date, invoice.totalAmount],
          (_, { insertId }) => {
            // Insert each item into invoice_items table
            const itemPromises = items.map((item) => {
              return new Promise((resolveItem, rejectItem) => {
                tx.executeSql(
                  'INSERT INTO invoice_items (invoice_id, item_name, metal, purity, weight, rate, mc, discount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                  [
                    insertId,
                    item.name,
                    item.metal,
                    item.purity,
                    item.grossWeight,
                    item.metalValue / item.netWeight, // rate
                    item.makingCharge,
                    item.discount,
                    item.finalTotal,
                  ],
                  () => resolveItem(),
                  (_, err) => rejectItem(err)
                );
              });
            });
            // Resolve with the new invoice ID when all items are inserted
            Promise.all(itemPromises).then(() => resolve(insertId)).catch(reject);
          },
          (_, err) => {
            reject(err);
            return true; // Stop transaction
          }
        );
      }
    );
  });
};

export default db;
