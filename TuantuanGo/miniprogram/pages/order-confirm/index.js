const { groups } = require("../../stores/mock-data");
const { getCart, clearCart } = require("../../stores/cart-store");
const { calcOrderAmount } = require("../../services/pricing");
const { createOrder } = require("../../stores/order-store");

Page({
  data: {
    cart: { groupId: "", items: [] },
    group: null,
    amount: null,
    remark: "",
    proofName: ""
  },
  onShow() {
    const cart = getCart();
    const group = groups.find((x) => x.id === cart.groupId) || null;
    const amount = group
      ? calcOrderAmount(cart.items, {
          shippingFee: group.shippingFee,
          freeShippingThreshold: group.freeShippingThreshold,
          packingFee: group.packingFee,
          materialFee: group.materialFee,
          tipFee: group.tipFee
        })
      : null;
    this.setData({ cart, group, amount });
  },
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },
  chooseProof() {
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      success: (res) => {
        const path = res.tempFilePaths[0] || "";
        const name = path.split("/").pop();
        this.setData({ proofName: name || "已选择支付截图" });
      }
    });
  },
  submitOrder() {
    if (!this.data.cart.items.length) {
      wx.showToast({ title: "购物车为空", icon: "none" });
      return;
    }
    if (!this.data.proofName) {
      wx.showToast({ title: "请先上传支付截图", icon: "none" });
      return;
    }
    createOrder({
      groupTitle: this.data.group ? this.data.group.title : "",
      leaderName: this.data.group ? this.data.group.leaderName : "",
      items: this.data.cart.items,
      amount: this.data.amount,
      remark: this.data.remark
    });
    clearCart();
    wx.showModal({
      title: "提交成功",
      content: "订单已进入待团长审核状态。",
      showCancel: false,
      success: () => wx.redirectTo({ url: "/pages/orders/index" })
    });
  }
});
