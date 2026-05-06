const { groups, productsByGroupId } = require("../../stores/mock-data");
const { addItem } = require("../../stores/cart-store");

Page({
  data: {
    group: null,
    products: []
  },
  onLoad(options) {
    const groupId = options.groupId || "g1";
    const group = groups.find((x) => x.id === groupId) || groups[0];
    this.setData({ group, products: productsByGroupId[group.id] || [] });
  },
  addToCart(e) {
    const id = e.currentTarget.dataset.productId;
    const product = this.data.products.find((x) => x.id === id);
    if (!product || !this.data.group) return;
    const res = addItem(this.data.group.id, product);
    if (!res.ok) {
      wx.showToast({ title: res.message, icon: "none" });
      return;
    }
    wx.showToast({ title: "已加入购物车", icon: "success" });
  },
  goCart() {
    wx.redirectTo({ url: "/pages/cart/index" });
  }
});
