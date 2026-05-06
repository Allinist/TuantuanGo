const { groups } = require("../../stores/mock-data");

Page({
  data: { groups: [] },
  onLoad() {
    this.setData({
      groups: groups.map((g) => ({
        ...g,
        host: `团长：${g.leaderName}`,
        priceLabel: `¥${g.minPrice} 起`,
        stockLabel: `余 ${g.stock}`,
        statusLabel: g.status === "active" ? "进行中" : "已发车"
      }))
    });
  },
  openGroup(e) {
    const groupId = e.currentTarget.dataset.groupId;
    wx.navigateTo({ url: `/pages/group-detail/index?groupId=${groupId}` });
  }
});
