const KEY = "ttg_orders_v1";

function getOrders() {
  return wx.getStorageSync(KEY) || [];
}

function saveOrders(orders) {
  wx.setStorageSync(KEY, orders);
}

function createOrder(payload) {
  const orders = getOrders();
  const now = Date.now();
  const order = {
    id: `o_${now}`,
    orderNo: `TTG-${String(now).slice(-8)}`,
    status: "pending_review",
    createdAt: now,
    ...payload
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

module.exports = {
  getOrders,
  createOrder
};
