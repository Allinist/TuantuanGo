const { groups } = require("../../stores/mock-data");
const { getCart, updateQuantity } = require("../../stores/cart-store");
const { calcOrderAmount } = require("../../services/pricing");

Page({
  data: {
    cart: { groupId: "", items: [] },
    group: null,
    amount: null
  },
  onShow() {
    this.refresh();
  },
  refresh() {
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
  plus(e) {
    const id = e.currentTarget.dataset.productId;
    const item = this.data.cart.items.find((x) => x.productId === id);
    if (!item) return;
    updateQuantity(id, item.quantity + 1);
    this.refresh();
  },
  minus(e) {
    const id = e.currentTarget.dataset.productId;
    const item = this.data.cart.items.find((x) => x.productId === id);
    if (!item) return;
    updateQuantity(id, item.quantity - 1);
    this.refresh();
  },
  submit() {
    if (!this.data.cart.items.length) {
      wx.showToast({ title: "购物车为空", icon: "none" });
      return;
    }
    wx.navigateTo({ url: "/pages/order-confirm/index" });
  }
});
