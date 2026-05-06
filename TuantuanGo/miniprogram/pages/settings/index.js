Page({
  data: {
    roleText: "角色：买家（可申请团长）"
  },
  onShow() {
    const isLeader = !!wx.getStorageSync("ttg_is_leader");
    this.setData({
      roleText: isLeader ? "角色：团长" : "角色：买家（可申请团长）"
    });
  },
  toggleRole() {
    const isLeader = !!wx.getStorageSync("ttg_is_leader");
    wx.setStorageSync("ttg_is_leader", !isLeader);
    this.onShow();
    wx.showToast({ title: !isLeader ? "已切换为团长" : "已切换为买家", icon: "none" });
  }
});
