const { setRole } = require("../../stores/session-store");

Page({
  applyNow() {
    setRole("leader");
    wx.showToast({ title: "已切换为团长卖家", icon: "success", duration: 800 });
    setTimeout(() => {
      wx.reLaunch({ url: "/pages/market/index" });
    }, 300);
  }
});
