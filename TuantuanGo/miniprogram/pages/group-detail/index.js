const { groups } = require("../../stores/mock-data");

Page({
  data: {
    group: null
  },
  onLoad(options) {
    const groupId = options.groupId || "g1";
    const group = groups.find((x) => x.id === groupId) || groups[0];
    this.setData({ group });
  },
  goSelect() {
    if (!this.data.group) return;
    wx.navigateTo({ url: `/pages/product-select/index?groupId=${this.data.group.id}` });
  },
  goCart() {
    wx.redirectTo({ url: "/pages/cart/index" });
  }
});
