const { getRole, setRole, isLeader, isAdmin, getUserId } = require("../../stores/session-store");
const { isLeaderApproved } = require("../../stores/leader-application-store");

Page({
  data: {
    roleText: "角色：买家",
    isLeader: false,
    isAdmin: false,
    userId: ""
  },
  onShow() {
    const leader = isLeader();
    const admin = isAdmin();
    const userId = getUserId();
    this.setData({
      isLeader: leader,
      isAdmin: admin,
      userId,
      roleText: admin ? "角色：管理员" : (leader ? "角色：团长/卖家" : "角色：买家")
    });
  },
  toggleRole() {
    const current = getRole();
    if (current === "admin") {
      setRole("buyer");
      wx.showToast({ title: "已切换为买家", icon: "none" });
      return setTimeout(() => wx.reLaunch({ url: "/pages/market/index" }), 250);
    }
    if (current === "leader") {
      setRole("buyer");
      wx.showToast({ title: "已切换为买家", icon: "none" });
      return setTimeout(() => wx.reLaunch({ url: "/pages/market/index" }), 250);
    }
    if (!isLeaderApproved(getUserId())) {
      wx.showModal({
        title: "未开通团长/卖家",
        content: "你还未通过管理员审核，请先提交申请。",
        confirmText: "去申请",
        success: (res) => {
          if (res.confirm) wx.navigateTo({ url: "/pages/leader-apply/index" });
        }
      });
      return;
    }
    setRole("leader");
    wx.showToast({ title: "已切换为团长/卖家", icon: "none" });
    setTimeout(() => wx.reLaunch({ url: "/pages/market/index" }), 250);
  },
  switchAdminDemo() {
    const next = getRole() === "admin" ? "buyer" : "admin";
    setRole(next);
    wx.showToast({ title: next === "admin" ? "已切换为管理员" : "已退出管理员", icon: "none" });
    setTimeout(() => wx.reLaunch({ url: "/pages/market/index" }), 250);
  },
  goInventory() { wx.navigateTo({ url: "/pages/inventory/index" }); },
  goAddressManage() { wx.navigateTo({ url: "/pages/address-manage/index" }); },
  goLeaderApply() { wx.navigateTo({ url: "/pages/leader-apply/index" }); },
  goAdmin() { wx.navigateTo({ url: "/pages/admin/index" }); }
});
