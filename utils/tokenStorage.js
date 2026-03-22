import { getToken as getDbToken, saveToken, deleteToken } from '../db/sqlite';

export const storeAuthToken = async (token) => {
  try {
    await saveToken(token);
  } catch (error) {
    console.error('Error storing token to SQLite:', error);
  }
};

export const getAuthToken = async () => {
  try {
    return await getDbToken();
  } catch (error) {
    console.error('Error getting token from SQLite:', error);
    return null;
  }
};

// Backward-compatible export used by existing imports in navigation/auth bootstrap.
export const getToken = getAuthToken;

export const clearAuthToken = async () => {
  try {
    await deleteToken();
  } catch (error) {
    console.error('Error clearing token from SQLite:', error);
  }
};
