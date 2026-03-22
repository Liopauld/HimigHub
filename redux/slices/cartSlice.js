import { createSlice } from '@reduxjs/toolkit';

const normalizeCartItems = (items = []) =>
  (Array.isArray(items) ? items : [])
    .filter((item) => item && item.productId)
    .map((item) => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      size: item.size || null,
    }));

const calculateTotal = (items = []) =>
  items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalPrice: 0,
  },
  reducers: {
    setCartFromSQLite: (state, action) => {
      state.items = normalizeCartItems(action.payload);
      state.totalPrice = calculateTotal(state.items);
    },
    addItem: (state, action) => {
      const item = normalizeCartItems([action.payload])[0];
      if (!item) return;
      const existingItem = state.items.find(i => i.productId === item.productId && i.size === item.size);
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
      state.totalPrice = calculateTotal(state.items);
    },
    removeItem: (state, action) => {
      const { productId, size = null } = action.payload;
      state.items = state.items.filter(
        (i) => !(i.productId === productId && (i.size || null) === (size || null))
      );
      state.totalPrice = calculateTotal(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, size = null, quantity } = action.payload;
      const existingItem = state.items.find(
        (i) => i.productId === productId && (i.size || null) === (size || null)
      );
      if (existingItem) {
        existingItem.quantity = Math.max(1, Number(quantity) || 1);
      }
      state.totalPrice = calculateTotal(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

export const { setCartFromSQLite, addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
