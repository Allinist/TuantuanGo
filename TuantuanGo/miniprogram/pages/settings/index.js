const { getRole, setRole, isLeader } = require("../../stores/session-store");
const { getLeaderPolicy, setLeaderPolicy } = require("../../stores/leader-policy-store");

Page({
  data: {
    roleText: "角色：买家（可申请团长）",
    isLeader: false,
    autoCompleteDays: 14
  },
  onShow() {
    const leader = isLeader();
    const policy = getLeaderPolicy();
    this.setData({
      isLeader: leader,
      roleText: leader ? "角色：团长卖家" : "角色：买家",
      autoCompleteDays: policy.autoCompleteDays || 14
    });
  },
  toggleRole() {
    const next = getRole() === "leader" ? "buyer" : "leader";
    setRole(next);
    wx.showToast({ title: next === "leader" ? "已切换为团长卖家" : "已切换为买家", icon: "none", duration: 700 });
    setTimeout(() => {
      wx.reLaunch({ url: "/pages/market/index" });
    }, 250);
  },
  goLeaderReview() {
    if (!isLeader()) {
      wx.showToast({ title: "请先切换为团长角色", icon: "none" });
      return;
    }
    wx.navigateTo({ url: "/pages/leader-order-review/index" });
  },
  goLeaderShipping() {
    if (!isLeader()) {
      wx.showToast({ title: "请先切换为团长角色", icon: "none" });
      return;
    }
    wx.navigateTo({ url: "/pages/leader-shipping/index" });
  },
  onAutoDaysInput(e) {
    this.setData({ autoCompleteDays: e.detail.value });
  },
  saveAutoDays() {
    if (!isLeader()) {
      wx.showToast({ title: "仅团长可设置", icon: "none" });
      return;
    }
    const days = Number(this.data.autoCompleteDays || 14);
    if (!days || days < 7 || days > 28) {
      wx.showToast({ title: "请输入7-28天", icon: "none" });
      return;
    }
    setLeaderPolicy({ autoCompleteDays: days });
    wx.showToast({ title: `已设置${days}天自动完成`, icon: "success" });
  }
});
