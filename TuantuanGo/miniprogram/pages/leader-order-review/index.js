const { getOrders, updateOrderStatus } = require("../../stores/order-store");

Page({
  data: {
    pendingOrders: [],
    reviewRemark: ""
  },
  onShow() {
    const pendingOrders = getOrders().filter((o) => o.status === "pending_review");
    this.setData({ pendingOrders });
  },
  onRemarkInput(e) {
    this.setData({ reviewRemark: e.detail.value });
  },
  approve(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const updated = updateOrderStatus(orderId, "approve", this.data.reviewRemark);
    if (!updated) return;
    wx.showToast({ title: "审核通过", icon: "success" });
    this.setData({ reviewRemark: "" });
    this.onShow();
  },
  reject(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const remark = this.data.reviewRemark || "支付截图不完整";
    const updated = updateOrderStatus(orderId, "reject", remark);
    if (!updated) return;
    wx.showToast({ title: "已驳回", icon: "none" });
    this.setData({ reviewRemark: "" });
    this.onShow();
  },
  openOrder(e) {
    const orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({ url: `/pages/order-detail/index?orderId=${orderId}` });
  }
});
