import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('jewelry.db');

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

export default db;
