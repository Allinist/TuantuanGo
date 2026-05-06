const { getOrders } = require("../../stores/order-store");

Page({
  data: {
    orders: []
  },
  onShow() {
    const orders = getOrders().map((o) => ({
      ...o,
      statusLabel: o.status === "pending_review" ? "待团长审核" : "已确认",
      amountLabel: `¥${o.amount ? o.amount.totalAmount : 0}`
    }));
    this.setData({ orders });
  }
});
