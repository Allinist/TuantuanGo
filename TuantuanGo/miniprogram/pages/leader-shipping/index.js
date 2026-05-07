const { getOrders, markShipped } = require("../../stores/order-store");

Page({
  data: {
    confirmedOrders: [],
    logisticsCompany: "顺丰速运",
    trackingNo: "",
    noLogistics: false,
    noLogisticsReason: "同城面交"
  },
  onShow() {
    const confirmedOrders = getOrders().filter((o) => o.status === "confirmed");
    this.setData({ confirmedOrders });
  },
  onCompanyInput(e) {
    this.setData({ logisticsCompany: e.detail.value });
  },
  onTrackingInput(e) {
    this.setData({ trackingNo: e.detail.value });
  },
  onReasonInput(e) {
    this.setData({ noLogisticsReason: e.detail.value });
  },
  toggleNoLogistics() {
    this.setData({ noLogistics: !this.data.noLogistics });
  },
  ship(e) {
    const orderId = e.currentTarget.dataset.orderId;
    if (!this.data.noLogistics && !this.data.trackingNo) {
      wx.showToast({ title: "请填写物流单号", icon: "none" });
      return;
    }
    markShipped(orderId, {
      logisticsCompany: this.data.logisticsCompany,
      trackingNo: this.data.trackingNo,
      noLogistics: this.data.noLogistics,
      noLogisticsReason: this.data.noLogisticsReason
    });
    wx.showToast({ title: "已标记发货", icon: "success" });
    this.setData({ trackingNo: "" });
    this.onShow();
  }
});
