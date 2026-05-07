const { groups, productsByGroupId } = require("../../stores/mock-data");
const { addItem, getCart, updateQuantity } = require("../../stores/cart-store");

Page({
  data: {
    group: null,
    products: [],
    quantityMap: {},
    mainProduct: null,
    bundleProducts: [],
    fixedBundleProducts: [],
    selectedBundleIds: []
  },
  onLoad(options) {
    const groupId = options.groupId || "g1";
    const group = groups.find((x) => x.id === groupId) || groups[0];
    const products = productsByGroupId[group.id] || [];
    const mainProduct = products.find((x) => x.mode === "bundle_main") || null;
    const bundleProducts = products.filter((x) => x.mode === "bundle_item");
    const fixedBundleProducts = products.filter((x) => x.mode === "bundle_fixed");
    this.setData({ group, products, mainProduct, bundleProducts, fixedBundleProducts });
    this.syncQuantities(group.id);
  },
  onShow() {
    const groupId = this.data.group && this.data.group.id;
    if (!groupId) return;
    this.syncQuantities(groupId);
  },
  syncQuantities(groupId) {
    const cart = getCart(groupId);
    const quantityMap = {};
    (cart.items || []).forEach((x) => {
      quantityMap[x.productId] = x.quantity;
    });
    this.setData({ quantityMap });
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
    this.syncQuantities(this.data.group.id);
  },
  onQtyChange(e) {
    const { productId, value } = e.detail || {};
    if (!productId || !this.data.group) return;
    const qty = Number(value || 0);
    if (qty <= 0) {
      updateQuantity(this.data.group.id, productId, 0);
    } else {
      const current = Number(this.data.quantityMap[productId] || 0);
      if (current === 0) {
        const product = this.data.products.find((x) => x.id === productId);
        if (!product) return;
        const res = addItem(this.data.group.id, product);
        if (!res.ok) {
          wx.showToast({ title: res.message, icon: "none" });
          return;
        }
        updateQuantity(this.data.group.id, productId, qty);
      } else {
        updateQuantity(this.data.group.id, productId, qty);
      }
    }
    this.syncQuantities(this.data.group.id);
  },
  goCart() {
    wx.redirectTo({ url: "/pages/cart/index" });
  },
  toggleBundle(e) {
    const id = e.currentTarget.dataset.productId;
    const set = new Set(this.data.selectedBundleIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.setData({ selectedBundleIds: Array.from(set) });
  },
  addBundlePack() {
    const { group, mainProduct, bundleProducts, selectedBundleIds } = this.data;
    if (!group || !mainProduct) return;
    const picked = bundleProducts.filter((x) => selectedBundleIds.includes(x.id));
    const pickedAmount = picked.reduce((sum, x) => sum + x.price, 0);
    if (pickedAmount < (group.bundleRequiredAmount || 0)) {
      wx.showToast({ title: `被捆金额需≥¥${group.bundleRequiredAmount}`, icon: "none" });
      return;
    }
    const mainRes = addItem(group.id, mainProduct);
    if (!mainRes.ok) {
      wx.showToast({ title: mainRes.message, icon: "none" });
      return;
    }
    picked.forEach((p) => addItem(group.id, p));
    wx.showToast({ title: "捆出组合已加入", icon: "success" });
  },
  addFixedBundlePack() {
    const { group, mainProduct, fixedBundleProducts } = this.data;
    if (!group || !mainProduct) return;
    const mainRes = addItem(group.id, mainProduct);
    if (!mainRes.ok) {
      wx.showToast({ title: mainRes.message, icon: "none" });
      return;
    }
    fixedBundleProducts.forEach((p) => {
      const qty = p.fixedQty || 1;
      for (let i = 0; i < qty; i += 1) addItem(group.id, p);
    });
    wx.showToast({ title: "固定捆组合已加入", icon: "success" });
  }
});
