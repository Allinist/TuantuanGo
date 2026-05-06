Page({
  applyNow() {
    wx.setStorageSync("ttg_is_leader", true);
    wx.showModal({
      title: "申请成功",
      content: "你已获得团长权限，后续点击 + 将进入开团页。",
      showCancel: false,
      success: () => wx.navigateBack()
    });
  }
});
