let orderNavigationHandler = null;

export const setOrderNavigationHandler = (handler) => {
  orderNavigationHandler = handler;
};

export const navigateToOrderFromNotification = (orderId) => {
  if (!orderId || !orderNavigationHandler) return;
  orderNavigationHandler(orderId);
};
