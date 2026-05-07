const { groups, productsByGroupId } = require("../../stores/mock-data");
const { getGroupById } = require("../../stores/market-store");
const { getCart, addItem, updateQuantity } = require("../../stores/cart-store");
const { DEFAULT_GROUP_COVER } = require("../../stores/market-store");

function loadGroup(groupId) {
  if (groupId) {
    const fromStore = getGroupById(groupId);
    if (fromStore) return fromStore;
  }
  return groups.find((x) => x.id === groupId) || groups[0];
}

Page({
  data: {
    group: null,
    products: []
  },
  onLoad(options) {
    const groupId = (options && options.groupId) || "g1";
    const group = loadGroup(groupId);
    this.setData({ group });
  },
  onShow() {
    this.reloadProducts();
  },
  reloadProducts() {
    const group = this.data.group;
    if (!group) return;
    const cart = getCart(group.id);
    const qtyMap = {};
    (cart.items || []).forEach((x) => { qtyMap[x.productId] = x.quantity; });
    const sourceProducts = Array.isArray(group.products) && group.products.length
      ? group.products.map((p) => ({ ...p, id: p.productId || p.id }))
      : (productsByGroupId[group.id] || []);
    const products = sourceProducts.map((p) => ({
      ...p,
      id: p.id || `p_${Date.now()}`,
      coverImage: ((p.images || [])[0]) || DEFAULT_GROUP_COVER,
      quantity: qtyMap[p.id] || 0
    }));
    this.setData({ products });
  },
  onQtyChange(e) {
    const { productId, value } = e.detail || {};
    const groupId = this.data.group && this.data.group.id;
    if (!groupId || !productId) return;
    const target = this.data.products.find((x) => x.id === productId);
    if (!target) return;
    if (value <= 0) {
      updateQuantity(groupId, productId, 0);
    } else if (target.quantity <= 0) {
      addItem(groupId, { id: productId, name: target.name, price: Number(target.price || 0), mode: target.mode, unitCode: target.unitCode, presaleDate: target.presaleDate });
      if (value > 1) updateQuantity(groupId, productId, value);
    } else {
      updateQuantity(groupId, productId, value);
    }
    this.reloadProducts();
  },
  goCart() {
    wx.redirectTo({ url: "/pages/cart/index" });
  },
  onShareAppMessage() {
    const group = this.data.group || {};
    return {
      title: group.title || "拼团分享",
      path: `/pages/group-detail/index?groupId=${group.id || ""}`,
      imageUrl: group.coverImage || ""
    };
  }
});
