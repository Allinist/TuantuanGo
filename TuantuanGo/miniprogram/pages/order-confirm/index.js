const { groups } = require("../../stores/mock-data");
const { getCart, clearGroupCart } = require("../../stores/cart-store");
const { calcOrderAmount } = require("../../services/pricing");
const { createOrder } = require("../../stores/order-store");
const { getAddresses } = require("../../stores/address-store");

Page({
  data: {
    groupId: "",
    cart: { groupId: "", items: [] },
    group: null,
    amount: null,
    remark: "",
    proofName: "",
    addresses: [],
    selectedAddressId: "",
    selectedAddressText: "请选择收货地址"
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
    const addresses = getAddresses();
    let selectedAddressId = this.data.selectedAddressId;
    if (!selectedAddressId && addresses.length) selectedAddressId = addresses[0].id;
    const selected = addresses.find((x) => x.id === selectedAddressId);
    this.setData({
      cart,
      group,
      amount,
      addresses,
      selectedAddressId,
      selectedAddressText: selected ? `${selected.name} ${selected.phone} ${selected.address}` : "请选择收货地址"
    });
  },
  chooseAddress() {
    const list = this.data.addresses || [];
    if (!list.length) return wx.showToast({ title: "请先在设置中添加地址", icon: "none" });
    wx.showActionSheet({
      itemList: list.map((x) => `${x.name} ${x.phone}`),
      success: (res) => {
        const selected = list[res.tapIndex];
        if (!selected) return;
        this.setData({
          selectedAddressId: selected.id,
          selectedAddressText: `${selected.name} ${selected.phone} ${selected.address}`
        });
      }
    });
  },
  onRemarkInput(e) { this.setData({ remark: e.detail.value }); },
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
    if (!this.data.cart.items.length) return wx.showToast({ title: "购物车为空", icon: "none" });
    if (!this.data.proofName) return wx.showToast({ title: "请先上传支付截图", icon: "none" });
    if (!this.data.selectedAddressId) return wx.showToast({ title: "请选择收货地址", icon: "none" });
    const selected = this.data.addresses.find((x) => x.id === this.data.selectedAddressId) || null;
    createOrder({
      groupTitle: this.data.group ? this.data.group.title : "",
      leaderName: this.data.group ? this.data.group.leaderName : "",
      items: this.data.cart.items,
      amount: this.data.amount,
      remark: this.data.remark,
      address: selected,
      logisticsCompany: "顺丰速运",
      trackingNo: `SF${String(Date.now()).slice(-10)}`,
      shipmentStatus: "pending",
      paymentReviewStatus: "pending_review"
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
