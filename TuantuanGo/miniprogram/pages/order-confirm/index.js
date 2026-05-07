const { groups } = require("../../stores/mock-data");
const { getCart, clearGroupCart } = require("../../stores/cart-store");
const { calcOrderAmount } = require("../../services/pricing");
const { createOrder } = require("../../stores/order-store");

Page({
  data: {
    groupId: "",
    cart: { groupId: "", items: [] },
    group: null,
    amount: null,
    remark: "",
    proofName: ""
  },
  onLoad(query) {
    this.setData({ groupId: query && query.groupId ? query.groupId : "" });
  },
  onShow() {
    const cart = getCart(this.data.groupId);
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
      remark: this.data.remark,
      logisticsCompany: "顺丰速运",
      trackingNo: `SF${String(Date.now()).slice(-10)}`,
      shipmentStatus: "pending",
      paymentReviewStatus: "pending_review",
      trackingEvents: [
        { time: "待发货", text: "团长审核通过后将更新物流轨迹", eventAt: Date.now() }
      ],
      mergeShipment: {
        status: "not_applied",
        relatedOrderNos: []
      },
      transferRecord: {
        status: "none",
        fromUser: "团团用户_1024",
        toUser: ""
      }
    });
    clearGroupCart(this.data.groupId || this.data.cart.groupId);
    wx.showModal({
      title: "提交成功",
      content: "订单已进入待团长审核状态。",
      showCancel: false,
      success: () => wx.redirectTo({ url: "/pages/orders/index" })
    });
  }
});
