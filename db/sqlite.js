import * as SQLite from 'expo-sqlite';

let db = null;

const initDbConnection = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('himighub.db');
  }
};

export const initDB = async () => {
  await initDbConnection();

  // Migrate cart table to support product variants (same productId with different sizes).
  await db.execAsync('DROP TABLE IF EXISTS cart_migrated;');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT NOT NULL,
      name TEXT,
      image TEXT,
      price REAL,
      quantity INTEGER,
      size TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE cart_migrated (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT NOT NULL,
      name TEXT,
      image TEXT,
      price REAL,
      quantity INTEGER,
      size TEXT DEFAULT '',
      UNIQUE(productId, size)
    );
  `);

  await db.execAsync(`
    INSERT OR IGNORE INTO cart_migrated (productId, name, image, price, quantity, size)
    SELECT productId, name, image, price, quantity, COALESCE(size, '') FROM cart;
  `);

  await db.execAsync('DROP TABLE cart;');
  await db.execAsync('ALTER TABLE cart_migrated RENAME TO cart;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY,
      jwt TEXT NOT NULL
    );
  `);
};

// --- Cart Helpers ---

export const getCartItems = async () => {
  await initDbConnection();
  const allRows = await db.getAllAsync('SELECT * FROM cart');
  return allRows;
};

export const insertCartItem = async (item) => {
  await initDbConnection();
  const size = item.size || '';
  const result = await db.runAsync(
    `INSERT INTO cart (productId, name, image, price, quantity, size)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(productId, size)
     DO UPDATE SET
       name = excluded.name,
       image = excluded.image,
       price = excluded.price,
       quantity = cart.quantity + excluded.quantity`,
    item.productId,
    item.name,
    item.image,
    item.price,
    item.quantity,
    size
  );
  return result;
};

export const updateCartItem = async (productId, size, quantity) => {
  await initDbConnection();
  const result = await db.runAsync(
    'UPDATE cart SET quantity = ? WHERE productId = ? AND size = ?',
    quantity, productId, size || ''
  );
  return result;
};

export const deleteCartItem = async (productId, size) => {
  await initDbConnection();
  const result = await db.runAsync(
    'DELETE FROM cart WHERE productId = ? AND size = ?',
    productId, size || ''
  );
  return result;
};

export const clearCart = async () => {
  await initDbConnection();
  const result = await db.runAsync('DELETE FROM cart');
  return result;
};

// --- Token Helpers ---

export const saveToken = async (jwt) => {
  await initDbConnection();
  const result = await db.runAsync(
    'INSERT OR REPLACE INTO tokens (id, jwt) VALUES (1, ?)',
    jwt
  );
  return result;
};

export const getToken = async () => {
  await initDbConnection();
  const row = await db.getFirstAsync('SELECT jwt FROM tokens WHERE id = 1');
  return row ? row.jwt : null;
};

export const deleteToken = async () => {
  await initDbConnection();
  const result = await db.runAsync('DELETE FROM tokens WHERE id = 1');
  return result;
};
